const axios = require('axios');

/**
 * Onramper API Client
 * Wraps Onramper HTTP API and normalizes responses to Bitfront schema.
 */
class OnramperClient {
  /**
   * @param {Object} config
   * @param {string} config.apiKey - Onramper API Key
   * @param {string} config.baseUrl - Onramper API Base URL
   * @param {Object} [config.logger] - Optional winston-like logger
   * @param {number} [config.timeout=10000] - Request timeout in ms
   */
  constructor({ apiKey, baseUrl, logger, timeout = 10000 }) {
    if (!apiKey) throw new Error('ONRAMP_API_KEY is required');
    if (!baseUrl) throw new Error('ONRAMP_API_BASE is required');

    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.logger = logger || {
      info: () => {},
      error: () => {},
      debug: () => {},
      warn: () => {},
    };

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout,
      headers: {
        'Authorization': this.apiKey,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    // Add retry interceptor
    this.client.interceptors.response.use(null, async (error) => {
      const { config, response } = error;
      
      // Retry on 502, 503, 504
      const retryableStatuses = [502, 503, 504];
      const maxRetries = 3;
      
      config.retryCount = config.retryCount || 0;

      if (response && retryableStatuses.includes(response.status) && config.retryCount < maxRetries) {
        config.retryCount += 1;
        const delay = 200 * Math.pow(2, config.retryCount);
        this.logger.warn(`Retrying request to ${config.url} (Attempt ${config.retryCount}) after ${delay}ms due to status ${response.status}`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.client(config);
      }

      return Promise.reject(this._handleError(error));
    });
  }

  /**
   * Get Buy Quotes
   * @param {Object} params
   */
  async getOnrampQuotes({ fiatCurrency, network, amount, paymentMethod, country }) {
    try {
      // Onramper Buy Quotes: GET /quotes/{fiat}/{crypto}
      // Note: network is often part of the crypto string or a separate param in some versions, 
      // but standard V2 uses /quotes/fiat/crypto
      const response = await this.client.get(`/quotes/${fiatCurrency.toLowerCase()}/${network.toLowerCase()}`, {
        params: {
          amount,
          paymentMethod,
          country,
        },
      });

      return response.data.map(quote => this._normalizeQuote(quote, network));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create Onramp Order (Checkout Intent)
   * @param {Object} payload
   */
  async createOnrampOrder(payload) {
    try {
      // Onramper Checkout Intent: POST /checkout/intent
      const body = {
        onramp: payload.provider, // If specified
        source: payload.fiatCurrency.toLowerCase(),
        destination: payload.network.toLowerCase(),
        amount: payload.fiatAmount,
        paymentMethod: payload.paymentMethod,
        wallet: {
          address: payload.walletAddress,
        },
        partnerData: {
          partnerOrderId: payload.partnerOrderId,
          partnerContext: payload.partnerContext,
          redirectUrl: {
            success: payload.successUrl,
            failure: payload.failureUrl,
          },
        },
        callbackUrl: payload.callbackUrl,
      };

      const response = await this.client.post('/checkout/intent', body);
      return this._normalizeOrder(response.data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get Onramp Order
   * @param {string} orderId
   */
  async getOnrampOrder(orderId) {
    try {
      const response = await this.client.get(`/transactions/${orderId}`);
      return this._normalizeOrder(response.data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get Sell Quotes
   * @param {Object} params
   */
  async getOfframpQuotes({ network, fiatCurrency, amount }) {
    try {
      // Onramper Sell Quotes: GET /quotes/{crypto}/{fiat}
      const response = await this.client.get(`/quotes/${network.toLowerCase()}/${fiatCurrency.toLowerCase()}`, {
        params: {
          amount,
          type: 'sell',
        },
      });

      return response.data.map(quote => this._normalizeQuote(quote, network));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create Offramp Order
   * @param {Object} payload
   */
  async createOfframpOrder(payload) {
    try {
      // Offramp usually uses the same checkout intent or a specific sell flow
      const body = {
        type: 'sell',
        source: payload.network.toLowerCase(),
        destination: payload.fiatCurrency.toLowerCase(),
        amount: payload.cryptoAmount,
        paymentMethod: payload.fiatChannel,
        partnerData: {
          partnerOrderId: payload.partnerOrderId,
          partnerContext: payload.partnerContext,
        },
        callbackUrl: payload.callbackUrl,
      };

      const response = await this.client.post('/checkout/intent', body);
      return this._normalizeOrder(response.data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get Offramp Order
   * @param {string} orderId
   */
  async getOfframpOrder(orderId) {
    // Onramper uses the same transaction endpoint for both
    return this.getOnrampOrder(orderId);
  }

  /**
   * Normalize Onramper quote to Bitfront schema
   * @private
   */
  _normalizeQuote(onramperQuote, network) {
    // Mapping:
    // orderId: N/A for quotes
    // checkoutUrl: N/A for quotes
    // provider: ramp
    // quote: payout (estimated crypto out)
    // network: network (passed in)
    // walletAddress: N/A for quotes
    // estimatedOutAmount: payout
    // onrampTransactionId: N/A for quotes
    return {
      provider: onramperQuote.ramp,
      quote: onramperQuote.payout,
      network: network,
      estimatedOutAmount: onramperQuote.payout,
      raw: onramperQuote, // Keep raw for reference
    };
  }

  /**
   * Normalize Onramper order/transaction to Bitfront schema
   * @private
   */
  _normalizeOrder(onramperData) {
    // Onramper response can be nested in 'message' for checkout intent
    const data = onramperData.message || onramperData;
    
    // Mapping:
    // orderId: transactionId
    // checkoutUrl: redirectUrl (from checkout intent)
    // provider: onramp
    // quote: outAmount
    // network: destination (or network)
    // walletAddress: wallet.address
    // estimatedOutAmount: outAmount
    // onrampTransactionId: onrampTransactionId
    return {
      orderId: data.transactionId,
      checkoutUrl: data.redirectUrl || null,
      provider: data.onramp,
      quote: data.outAmount,
      network: data.destination || data.network,
      walletAddress: data.wallet?.address || data.walletAddress,
      estimatedOutAmount: data.outAmount,
      onrampTransactionId: data.onrampTransactionId,
      status: data.status, // Extra field for utility
      raw: onramperData,
    };
  }

  /**
   * Structured error handler
   * @private
   */
  _handleError(error) {
    const message = error.response?.data?.message || error.message;
    const details = error.response?.data || null;
    const code = 'ONRAMP_API_ERROR';

    this.logger.error(`${code}: ${message}`, { details });

    return {
      code,
      message,
      details,
    };
  }
}

module.exports = OnramperClient;
