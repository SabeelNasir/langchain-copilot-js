import { Router } from "express";
import { AIAgentsService } from "./ai-agents.service.js";
import { validateAIAgent } from "./validation.middleware.js";
import { AIModelService } from "../ai-models/ai-model-api.service.js";

const router = Router();
const service = new AIAgentsService();

// Create
router.post("/", validateAIAgent, async (req, res) => {
  try {
    const agent = await service.create(req.body);
    res.status(201).json(agent);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

// Read all
router.get("/", async (_req, res) => {
  const agents = await service.findAll();
  res.json(agents);
});

// Read one
router.get("/:id", async (req, res) => {
  const agent = await service.findById(req.params.id);
  if (!agent) return res.status(404).json({ error: "Not found" });
  res.json(agent);
});

// Update
router.put("/:id", validateAIAgent, async (req, res) => {
  try {
    const id = req.params.id ?? "";
    const updated = await service.update(id, req.body);
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

// Delete
router.delete("/:id", async (req, res) => {
  try {
    await service.delete(req.params.id);
    res.status(204).end();
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

// Chat with Specific AI Agent
router.post("/:id/chat", async (req, res) => {
  const { prompt } = req.body;
  // Find agent details first
  const aiAgent = await service.findById(req.params.id);
  if (!aiAgent) {
    throw new Error("Agent not found !");
  }
  const sessionId = req.headers["x-session-id"]?.toString()!;
  const aiModelService = new AIModelService(sessionId, aiAgent.model);
  const response = await aiModelService.invoke(prompt, aiAgent?.systemMessage);

  res.send(response.content);
});

export { router as AIAgentsRouter };
