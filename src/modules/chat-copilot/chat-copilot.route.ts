import {
  Router,
  type Request,
  type Response,
  type RouterOptions,
} from "express";
import { AIModelService } from "../ai-models/ai-model-api.service.js";
import { validateChatCopilotRequest } from "./route-middleware.js";
import { randomUUID } from "crypto";
import { AIModelV2Service } from "../ai-models/ai-model-v2.service.js";

// const router = Router();

// router.get("/chat", async (req: Request, res: Response) => {
//         const svcResp =
// });

export class ChatCopilot {
  public router: Router;
  constructor() {
    this.router = Router();

    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      "/",
      validateChatCopilotRequest,
      async (req: Request, res: Response) => {
        try {
          const service = new AIModelV2Service(
            req.headers["x-session-id"]?.toString()!
          );
          const { prompt } = req.body;
          if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
          }
          const response = await service.invoke(prompt);
          res.json({
            content: response.content,
            usage: response.response_metadata,
          });
          // res.json(response);
        } catch (error) {
          res.status(500).json({ error: (error as Error).message });
        }
      }
    );
  }
}
