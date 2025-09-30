import { Router } from "express";
import { callCodingAgent } from "./graph";

const CodingAgentRouter = Router();

// Temporary Auth
CodingAgentRouter.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).send("Not Authorized, Bearer missing");
  }
  if (authHeader.replace("Bearer ", "").trim() === "GRAPH") {
    return next();
  }
  res.status(401).send("Not Authorized, Bearer missing");
});

CodingAgentRouter.post("/chat", async (req, res) => {
  const sessionId = new Date().getTime().toString();
  const callResponse = await callCodingAgent(req.body.prompt, sessionId);
  res.json({ sessionId, response: callResponse });
});

CodingAgentRouter.post("/chat/:sessionId", async (req, res) => {
  const sessionId = req.params.sessionId;
  const callResponse = await callCodingAgent(req.body.prompt, sessionId);
  res.json({ response: callResponse });
});

export default CodingAgentRouter;
