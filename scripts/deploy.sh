#!/bin/bash
# ============================================================
# BitPay 聚合支付平台 - 自動化部署腳本
# 適用於 Ubuntu 伺服器，自動安裝 Docker、部署服務、申請 SSL 憑證
# ============================================================

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置變數
DOMAIN="${DOMAIN:-bitpay.gocc.store}"
PROJECT_DIR="${PROJECT_DIR:-/opt/bitpay}"
REPO_URL="${REPO_URL:-https://github.com/ptechao/bitpay.git}"
BRANCH="${BRANCH:-main}"

# 資料庫配置
PG_USER="${PG_USER:-bitpay_user}"
PG_PASSWORD="${PG_PASSWORD:-$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 32)}"
PG_DATABASE="${PG_DATABASE:-bitpay_db}"

# JWT 配置
JWT_SECRET="${JWT_SECRET:-$(openssl rand -base64 48 | tr -dc 'a-zA-Z0-9' | head -c 64)}"
JWT_EXPIRES_IN="${JWT_EXPIRES_IN:-24h}"

# SSL 配置
SSL_EMAIL="${SSL_EMAIL:-admin@${DOMAIN}}"

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ============================================================
# 1. 系統更新與基礎工具安裝
# ============================================================
install_prerequisites() {
    log_info "更新系統套件..."
    apt-get update -y
    apt-get upgrade -y

    log_info "安裝基礎工具..."
    apt-get install -y \
        apt-transport-https \
        ca-certificates \
        curl \
        gnupg \
        lsb-release \
        git \
        ufw \
        openssl \
        software-properties-common

    log_success "基礎工具安裝完成"
}

# ============================================================
# 2. 安裝 Docker 和 Docker Compose
# ============================================================
install_docker() {
    if command -v docker &> /dev/null; then
        log_warn "Docker 已安裝，版本: $(docker --version)"
    else
        log_info "安裝 Docker..."

        # 添加 Docker 官方 GPG 金鑰
        install -m 0755 -d /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
        chmod a+r /etc/apt/keyrings/docker.asc

        # 添加 Docker 軟體源
        echo \
          "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
          $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
          tee /etc/apt/sources.list.d/docker.list > /dev/null

        apt-get update -y
        apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

        # 啟動 Docker 服務
        systemctl start docker
        systemctl enable docker

        log_success "Docker 安裝完成，版本: $(docker --version)"
    fi

    # 確認 Docker Compose
    if docker compose version &> /dev/null; then
        log_success "Docker Compose 可用，版本: $(docker compose version)"
    else
        log_error "Docker Compose 安裝失敗"
        exit 1
    fi
}

# ============================================================
# 3. 配置防火牆
# ============================================================
configure_firewall() {
    log_info "配置防火牆..."

    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow 22/tcp    # SSH
    ufw allow 80/tcp    # HTTP
    ufw allow 443/tcp   # HTTPS
    ufw --force enable

    log_success "防火牆配置完成（開放 22, 80, 443 端口）"
}

# ============================================================
# 4. 克隆或更新專案
# ============================================================
setup_project() {
    log_info "設定專案目錄..."

    if [ -d "$PROJECT_DIR" ]; then
        log_warn "專案目錄已存在，拉取最新程式碼..."
        cd "$PROJECT_DIR"
        git fetch origin
        git reset --hard "origin/$BRANCH"
        git pull origin "$BRANCH"
    else
        log_info "克隆專案..."
        git clone -b "$BRANCH" "$REPO_URL" "$PROJECT_DIR"
        cd "$PROJECT_DIR"
    fi

    log_success "專案程式碼已就緒"
}

# ============================================================
# 5. 建立環境變數配置
# ============================================================
setup_env() {
    log_info "建立環境變數配置..."

    cat > "$PROJECT_DIR/.env" << EOF
# ============================================================
# BitPay 聚合支付平台 - 生產環境配置
# 自動產生於 $(date '+%Y-%m-%d %H:%M:%S')
# ============================================================

# PostgreSQL 資料庫配置
PG_HOST=postgres
PG_PORT=5432
PG_USER=${PG_USER}
PG_PASSWORD=${PG_PASSWORD}
PG_DATABASE=${PG_DATABASE}
PG_POOL_MIN=2
PG_POOL_MAX=10

# JWT 認證配置
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=${JWT_EXPIRES_IN}

# Redis 配置
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# 域名配置
DOMAIN=${DOMAIN}

# Node 環境
NODE_ENV=production
EOF

    chmod 600 "$PROJECT_DIR/.env"
    log_success "環境變數配置完成"
}

# ============================================================
# 6. 建立 SSL 用的 Nginx 配置（先用 HTTP 取得憑證）
# ============================================================
setup_nginx_initial() {
    log_info "建立初始 Nginx 配置（HTTP only，用於 SSL 驗證）..."

    mkdir -p "$PROJECT_DIR/nginx/certs"
    mkdir -p "$PROJECT_DIR/certbot/www"
    mkdir -p "$PROJECT_DIR/certbot/conf"

    cat > "$PROJECT_DIR/nginx/nginx.conf" << 'NGINX_EOF'
worker_processes auto;

events {
    worker_connections 1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile      on;
    keepalive_timeout 65;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent"';

    access_log /var/log/nginx/access.log main;
    error_log  /var/log/nginx/error.log warn;

    # 後端微服務 upstream
    upstream payment_service {
        server payment-service:3001;
    }
    upstream merchant_service {
        server merchant-service:3002;
    }
    upstream agent_service {
        server agent-service:3003;
    }
    upstream settlement_service {
        server settlement-service:3004;
    }
    upstream risk_control_service {
        server risk-control-service:3005;
    }
    upstream channel_service {
        server channel-service:3006;
    }
    upstream sandbox_service {
        server sandbox-service:3007;
    }

    # 前端門戶 upstream
    upstream merchant_portal {
        server merchant-portal:3000;
    }
    upstream agent_portal {
        server agent-portal:3008;
    }
    upstream admin_portal {
        server admin-portal:3009;
    }

    # HTTP 伺服器
    server {
        listen 80;
        server_name DOMAIN_PLACEHOLDER;

        # Let's Encrypt 驗證路徑
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        # API 路由
        location /api/payments/ {
            proxy_pass http://payment_service/api/payments/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        location /api/merchants/ {
            proxy_pass http://merchant_service/api/merchants/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        location /api/agents/ {
            proxy_pass http://agent_service/api/agents/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        location /api/settlements/ {
            proxy_pass http://settlement_service/api/settlements/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        location /api/risk-control/ {
            proxy_pass http://risk_control_service/api/risk-control/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        location /api/channels/ {
            proxy_pass http://channel_service/api/channels/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        location /api/sandbox/ {
            proxy_pass http://sandbox_service/api/sandbox/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # 前端路由
        location /admin/ {
            proxy_pass http://admin_portal/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        location /agent/ {
            proxy_pass http://agent_portal/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        location / {
            proxy_pass http://merchant_portal/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
NGINX_EOF

    # 替換域名
    sed -i "s/DOMAIN_PLACEHOLDER/${DOMAIN}/g" "$PROJECT_DIR/nginx/nginx.conf"

    log_success "初始 Nginx 配置完成"
}

# ============================================================
# 7. 建立生產環境 docker-compose
# ============================================================
setup_docker_compose_prod() {
    log_info "建立生產環境 docker-compose 配置..."

    cat > "$PROJECT_DIR/docker-compose.prod.yml" << 'COMPOSE_EOF'
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    restart: always
    environment:
      POSTGRES_DB: ${PG_DATABASE}
      POSTGRES_USER: ${PG_USER}
      POSTGRES_PASSWORD: ${PG_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${PG_USER} -d ${PG_DATABASE}"]
      interval: 5s
      timeout: 5s
      retries: 10

  redis:
    image: redis:7-alpine
    restart: always
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  payment-service:
    build:
      context: .
      dockerfile: Dockerfile
      target: payment-service
    restart: always
    env_file: .env
    environment:
      PORT: 3001
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  merchant-service:
    build:
      context: .
      dockerfile: Dockerfile
      target: merchant-service
    restart: always
    env_file: .env
    environment:
      PORT: 3002
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  agent-service:
    build:
      context: .
      dockerfile: Dockerfile
      target: agent-service
    restart: always
    env_file: .env
    environment:
      PORT: 3003
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  settlement-service:
    build:
      context: .
      dockerfile: Dockerfile
      target: settlement-service
    restart: always
    env_file: .env
    environment:
      PORT: 3004
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  risk-control-service:
    build:
      context: .
      dockerfile: Dockerfile
      target: risk-control-service
    restart: always
    env_file: .env
    environment:
      PORT: 3005
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  channel-service:
    build:
      context: .
      dockerfile: Dockerfile
      target: channel-service
    restart: always
    env_file: .env
    environment:
      PORT: 3006
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  sandbox-service:
    build:
      context: .
      dockerfile: Dockerfile
      target: sandbox-service
    restart: always
    env_file: .env
    environment:
      SANDBOX_SERVICE_PORT: 3007
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  merchant-portal:
    build:
      context: .
      dockerfile: Dockerfile
      target: merchant-portal
    restart: always
    environment:
      PORT: 3000

  agent-portal:
    build:
      context: .
      dockerfile: Dockerfile
      target: agent-portal
    restart: always
    environment:
      PORT: 3008

  admin-portal:
    build:
      context: .
      dockerfile: Dockerfile
      target: admin-portal
    restart: always
    environment:
      PORT: 3009

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certbot/conf:/etc/letsencrypt:ro
      - ./certbot/www:/var/www/certbot:ro
    depends_on:
      - payment-service
      - merchant-service
      - agent-service
      - settlement-service
      - risk-control-service
      - channel-service
      - sandbox-service
      - merchant-portal
      - admin-portal
      - agent-portal

  certbot:
    image: certbot/certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"

volumes:
  postgres_data:
  redis_data:
COMPOSE_EOF

    log_success "生產環境 docker-compose 配置完成"
}

# ============================================================
# 8. 啟動服務
# ============================================================
start_services() {
    log_info "構建並啟動所有服務..."
    cd "$PROJECT_DIR"

    # 停止舊服務（如果有）
    docker compose -f docker-compose.prod.yml down 2>/dev/null || true

    # 構建並啟動
    docker compose -f docker-compose.prod.yml up --build -d

    log_info "等待服務啟動..."
    sleep 30

    # 檢查服務狀態
    docker compose -f docker-compose.prod.yml ps

    log_success "所有服務已啟動"
}

# ============================================================
# 9. 申請 SSL 憑證
# ============================================================
setup_ssl() {
    log_info "申請 Let's Encrypt SSL 憑證..."
    cd "$PROJECT_DIR"

    # 使用 certbot 申請憑證
    docker compose -f docker-compose.prod.yml run --rm certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email "${SSL_EMAIL}" \
        --agree-tos \
        --no-eff-email \
        -d "${DOMAIN}"

    if [ $? -eq 0 ]; then
        log_success "SSL 憑證申請成功"

        # 更新 Nginx 配置啟用 HTTPS
        setup_nginx_ssl
        
        # 重新載入 Nginx
        docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
        
        log_success "HTTPS 已啟用"
    else
        log_warn "SSL 憑證申請失敗，服務仍可透過 HTTP 訪問"
        log_warn "您可以稍後手動執行: cd $PROJECT_DIR && docker compose -f docker-compose.prod.yml run --rm certbot certonly --webroot --webroot-path=/var/www/certbot --email ${SSL_EMAIL} --agree-tos --no-eff-email -d ${DOMAIN}"
    fi
}

# ============================================================
# 10. 更新 Nginx 配置啟用 HTTPS
# ============================================================
setup_nginx_ssl() {
    log_info "更新 Nginx 配置啟用 HTTPS..."

    cat > "$PROJECT_DIR/nginx/nginx.conf" << NGINX_SSL_EOF
worker_processes auto;

events {
    worker_connections 1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile      on;
    keepalive_timeout 65;
    client_max_body_size 50m;

    log_format main '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                    '\$status \$body_bytes_sent "\$http_referer" '
                    '"\$http_user_agent"';

    access_log /var/log/nginx/access.log main;
    error_log  /var/log/nginx/error.log warn;

    # 後端微服務 upstream
    upstream payment_service {
        server payment-service:3001;
    }
    upstream merchant_service {
        server merchant-service:3002;
    }
    upstream agent_service {
        server agent-service:3003;
    }
    upstream settlement_service {
        server settlement-service:3004;
    }
    upstream risk_control_service {
        server risk-control-service:3005;
    }
    upstream channel_service {
        server channel-service:3006;
    }
    upstream sandbox_service {
        server sandbox-service:3007;
    }

    # 前端門戶 upstream
    upstream merchant_portal {
        server merchant-portal:3000;
    }
    upstream agent_portal {
        server agent-portal:3008;
    }
    upstream admin_portal {
        server admin-portal:3009;
    }

    # HTTP -> HTTPS 重定向
    server {
        listen 80;
        server_name ${DOMAIN};

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 301 https://\$host\$request_uri;
        }
    }

    # HTTPS 伺服器
    server {
        listen 443 ssl;
        server_name ${DOMAIN};

        ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;

        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        # HSTS
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # API 路由
        location /api/payments/ {
            proxy_pass http://payment_service/api/payments/;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
        location /api/merchants/ {
            proxy_pass http://merchant_service/api/merchants/;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
        location /api/agents/ {
            proxy_pass http://agent_service/api/agents/;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
        location /api/settlements/ {
            proxy_pass http://settlement_service/api/settlements/;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
        location /api/risk-control/ {
            proxy_pass http://risk_control_service/api/risk-control/;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
        location /api/channels/ {
            proxy_pass http://channel_service/api/channels/;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
        location /api/sandbox/ {
            proxy_pass http://sandbox_service/api/sandbox/;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        # 前端路由
        location /admin/ {
            proxy_pass http://admin_portal/;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
        location /agent/ {
            proxy_pass http://agent_portal/;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
        location / {
            proxy_pass http://merchant_portal/;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
    }
}
NGINX_SSL_EOF

    log_success "Nginx HTTPS 配置完成"
}

# ============================================================
# 11. 設定 SSL 自動續期 Cron
# ============================================================
setup_ssl_renewal() {
    log_info "設定 SSL 憑證自動續期..."

    # 添加 crontab 每天凌晨 3 點檢查續期
    (crontab -l 2>/dev/null; echo "0 3 * * * cd ${PROJECT_DIR} && docker compose -f docker-compose.prod.yml run --rm certbot renew && docker compose -f docker-compose.prod.yml exec nginx nginx -s reload") | crontab -

    log_success "SSL 自動續期已設定（每天凌晨 3 點）"
}

# ============================================================
# 12. 輸出部署資訊
# ============================================================
print_summary() {
    echo ""
    echo "============================================================"
    echo -e "${GREEN} BitPay 聚合支付平台部署完成！${NC}"
    echo "============================================================"
    echo ""
    echo -e "  域名:     ${BLUE}https://${DOMAIN}${NC}"
    echo -e "  HTTP:     ${BLUE}http://${DOMAIN}${NC}"
    echo ""
    echo "  前端門戶:"
    echo -e "    商戶門戶:   ${BLUE}https://${DOMAIN}/${NC}"
    echo -e "    代理商門戶: ${BLUE}https://${DOMAIN}/agent/${NC}"
    echo -e "    管理員門戶: ${BLUE}https://${DOMAIN}/admin/${NC}"
    echo ""
    echo "  資料庫資訊:"
    echo -e "    使用者: ${YELLOW}${PG_USER}${NC}"
    echo -e "    密碼:   ${YELLOW}${PG_PASSWORD}${NC}"
    echo -e "    資料庫: ${YELLOW}${PG_DATABASE}${NC}"
    echo ""
    echo "  JWT Secret: ${YELLOW}${JWT_SECRET}${NC}"
    echo ""
    echo "  專案目錄: ${PROJECT_DIR}"
    echo "  環境配置: ${PROJECT_DIR}/.env"
    echo ""
    echo "  常用命令:"
    echo "    查看狀態: cd ${PROJECT_DIR} && docker compose -f docker-compose.prod.yml ps"
    echo "    查看日誌: cd ${PROJECT_DIR} && docker compose -f docker-compose.prod.yml logs -f"
    echo "    重啟服務: cd ${PROJECT_DIR} && docker compose -f docker-compose.prod.yml restart"
    echo "    停止服務: cd ${PROJECT_DIR} && docker compose -f docker-compose.prod.yml down"
    echo "    更新部署: cd ${PROJECT_DIR} && git pull && docker compose -f docker-compose.prod.yml up --build -d"
    echo ""
    echo "============================================================"

    # 保存部署資訊到文件
    cat > "${PROJECT_DIR}/DEPLOYMENT_INFO.txt" << EOF
BitPay 部署資訊
================
部署時間: $(date '+%Y-%m-%d %H:%M:%S')
域名: ${DOMAIN}
專案目錄: ${PROJECT_DIR}

資料庫:
  使用者: ${PG_USER}
  密碼: ${PG_PASSWORD}
  資料庫: ${PG_DATABASE}

JWT Secret: ${JWT_SECRET}
EOF
    chmod 600 "${PROJECT_DIR}/DEPLOYMENT_INFO.txt"
}

# ============================================================
# 主流程
# ============================================================
main() {
    echo "============================================================"
    echo -e "${BLUE} BitPay 聚合支付平台 - 自動化部署${NC}"
    echo "============================================================"
    echo ""

    install_prerequisites
    install_docker
    configure_firewall
    setup_project
    setup_env
    setup_nginx_initial
    setup_docker_compose_prod
    start_services
    setup_ssl
    setup_ssl_renewal
    print_summary
}

main "$@"
