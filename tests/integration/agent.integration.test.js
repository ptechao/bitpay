
/**
 * @file tests/integration/agent.integration.test.js
 * @description 聚合支付平台代理商服務的整合測試。
 *              測試代理商的創建、查詢、更新等功能。
 * @author Manus AI
 * @date 2026-02-19
 */

const axios = require("axios");
const express = require("express");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");

// 模擬代理商服務
const mockAgentService = express();
mockAgentService.use(bodyParser.json());

let agents = [];

mockAgentService.post("/api/agents", (req, res) => {
  const { name, contactEmail, commissionRate } = req.body;
  if (!name || !contactEmail || !commissionRate) {
    return res.status(400).json({ code: "400", message: "缺少必要的參數" });
  }
  const newAgent = {
    id: uuidv4(),
    name,
    contactEmail,
    commissionRate,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  agents.push(newAgent);
  res.status(201).json({ code: "201", message: "代理商創建成功", data: newAgent });
});

mockAgentService.get("/api/agents/:id", (req, res) => {
  const { id } = req.params;
  const agent = agents.find((a) => a.id === id);
  if (agent) {
    res.status(200).json({ code: "200", message: "代理商查詢成功", data: agent });
  }
  res.status(404).json({ code: "404", message: "代理商不存在" });
});

mockAgentService.put("/api/agents/:id", (req, res) => {
  const { id } = req.params;
  const { name, contactEmail, commissionRate } = req.body;
  const agentIndex = agents.findIndex((a) => a.id === id);

  if (agentIndex > -1) {
    agents[agentIndex] = {
      ...agents[agentIndex],
      name: name || agents[agentIndex].name,
      contactEmail: contactEmail || agents[agentIndex].contactEmail,
      commissionRate: commissionRate || agents[agentIndex].commissionRate,
      updatedAt: new Date().toISOString(),
    };
    res.status(200).json({ code: "200", message: "代理商更新成功", data: agents[agentIndex] });
  }
  res.status(404).json({ code: "404", message: "代理商不存在" });
});

const AGENT_SERVICE_PORT = 3002;
let server;

describe("Agent Service Integration Test", () => {
  beforeAll((done) => {
    server = mockAgentService.listen(AGENT_SERVICE_PORT, () => {
      console.log(`Mock Agent Service運行於 http://localhost:${AGENT_SERVICE_PORT}`);
      done();
    });
  });

  afterAll((done) => {
    server.close(() => {
      console.log("Mock Agent Service已停止");
      done();
    });
  });

  beforeEach(() => {
    agents = []; // 每個測試前清空代理商列表
  });

  test("應該成功創建一個代理商", async () => {
    const agentData = {
      name: "Test Agent 1",
      contactEmail: "agent1@example.com",
      commissionRate: 0.05,
    };
    const response = await axios.post(`http://localhost:${AGENT_SERVICE_PORT}/api/agents`, agentData);

    expect(response.status).toBe(201);
    expect(response.data.code).toBe("201");
    expect(response.data.message).toBe("代理商創建成功");
    expect(response.data.data).toMatchObject(agentData);
    expect(response.data.data).toHaveProperty("id");
  });

  test("應該成功查詢一個代理商", async () => {
    const agentData = {
      name: "Test Agent 2",
      contactEmail: "agent2@example.com",
      commissionRate: 0.07,
    };
    const createResponse = await axios.post(`http://localhost:${AGENT_SERVICE_PORT}/api/agents`, agentData);
    const agentId = createResponse.data.data.id;

    const getResponse = await axios.get(`http://localhost:${AGENT_SERVICE_PORT}/api/agents/${agentId}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.data.code).toBe("200");
    expect(getResponse.data.message).toBe("代理商查詢成功");
    expect(getResponse.data.data.id).toBe(agentId);
    expect(getResponse.data.data).toMatchObject(agentData);
  });

  test("查詢不存在的代理商應該返回 404", async () => {
    try {
      await axios.get(`http://localhost:${AGENT_SERVICE_PORT}/api/agents/non_existent_agent_id`);
    } catch (error: any) {
      expect(error.response.status).toBe(404);
      expect(error.response.data.code).toBe("404");
      expect(error.response.data.message).toBe("代理商不存在");
    }
  });

  test("應該成功更新一個代理商", async () => {
    const agentData = {
      name: "Test Agent 3",
      contactEmail: "agent3@example.com",
      commissionRate: 0.10,
    };
    const createResponse = await axios.post(`http://localhost:${AGENT_SERVICE_PORT}/api/agents`, agentData);
    const agentId = createResponse.data.data.id;

    const updateData = {
      contactEmail: "new_agent3@example.com",
      commissionRate: 0.12,
    };
    const updateResponse = await axios.put(`http://localhost:${AGENT_SERVICE_PORT}/api/agents/${agentId}`, updateData);

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.data.code).toBe("200");
    expect(updateResponse.data.message).toBe("代理商更新成功");
    expect(updateResponse.data.data.id).toBe(agentId);
    expect(updateResponse.data.data.contactEmail).toBe(updateData.contactEmail);
    expect(updateResponse.data.data.commissionRate).toBe(updateData.commissionRate);
    expect(updateResponse.data.data.name).toBe(agentData.name); // 名稱未更新，應保持不變
  });

  test("更新不存在的代理商應該返回 404", async () => {
    try {
      await axios.put(`http://localhost:${AGENT_SERVICE_PORT}/api/agents/non_existent_agent_id`, { name: "Updated Name" });
    } catch (error: any) {
      expect(error.response.status).toBe(404);
      expect(error.response.data.code).toBe("404");
      expect(error.response.data.message).toBe("代理商不存在");
    }
  });
});
