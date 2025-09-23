import { Router, type Request, type Response } from "express";
import { ChatCopilot } from "./chat-copilot.js";
import { UserRoutes } from "./user-routes.js";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.send("API Running !");
});

// Instantiate ChatCopilot and use its router
const chatCopilot = new ChatCopilot();
const userRoutes = new UserRoutes();

router.use("/chat", chatCopilot.router);
router.use("/user", userRoutes.router);

export default router;
