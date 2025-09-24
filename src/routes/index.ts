import { Router, type Request, type Response } from "express";
import { ChatCopilot } from "../modules/chat-copilot/chat-copilot.route.js";
import { UserRoutes } from "../modules/users/user-routes.js";
import { AIAgentsRouter } from "../modules/ai-agents/ai-agents.route.js";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.send("API Running !");
});

// Instantiate ChatCopilot and use its router
const chatCopilot = new ChatCopilot();
const userRoutes = new UserRoutes();


router.use("/chat", chatCopilot.router);
router.use("/user", userRoutes.router);
router.use("/ai-agents", AIAgentsRouter);

export default router;
