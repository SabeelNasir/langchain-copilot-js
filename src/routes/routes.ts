import { Router, type Request, type Response } from "express";
import { ChatCopilot } from "../modules/chat-copilot/chat-copilot.route.js";
import { UserRoutes } from "../modules/users/user-routes.js";
import { AIAgentsRouter } from "../modules/ai-agents/ai-agents.route.js";
import { NMSStatsCopilotRoutes } from "../modules/chat-copilot/nms-copilot.route.js";
import { NMSStatsWorkflowCopilotRoutes } from "../modules/chat-copilot/nms-langgraph-workflow.route.js";
import CodingAgentRouter from "../modules/ai-agents/coding-agent/coding-agent.route.js";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.send("API Running !");
});

// Instantiate ChatCopilot and use its router
const chatCopilot = new ChatCopilot();
const userRoutes = new UserRoutes();
const nmsCopilotRoutes = new NMSStatsCopilotRoutes();
const nmsLanggraphStatefulWorkflowRoutes = new NMSStatsWorkflowCopilotRoutes();

router.use("/chat", chatCopilot.router);
router.use("/user", userRoutes.router);
router.use("/ai-agents", AIAgentsRouter);
router.use("/nms-copilot", nmsCopilotRoutes.router);
router.use(
  "/nms-copilot-langgraph-workflow",
  nmsLanggraphStatefulWorkflowRoutes.router
);

// Coding Agent Chat Routes
router.use("/coding-agent", CodingAgentRouter);

export default router;
