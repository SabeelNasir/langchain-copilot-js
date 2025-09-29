import { Router, type Request, type Response } from "express";
import { validateChatCopilotRequest } from "./route-middleware.js";
import { AIModelV2Service } from "../ai-models/ai-model-v2.service.js";
import { MonitoringSystemAIAgent } from "../ai-agents/monitoring-system-ai-agent.js";

export class NMSStatsCopilotRoutes {
  public router: Router;
  constructor() {
    this.router = Router();

    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      "/",
      // validateChatCopilotRequest,
      async (req: Request, res: Response) => {
        try {
          const sessionId = new Date().getTime().toString();
          const service = new MonitoringSystemAIAgent(sessionId);
          await service.init();
          const { prompt } = req.body;
          // if (!prompt) {
          //   return res.status(400).json({ error: "Prompt is required" });
          // }
          const response = await service.invoke(prompt);
          res.json({ sessionId, response });
        } catch (error) {
          console.log("error", error);
          res.status(500).json({ error: (error as Error).message });
        }
      }
    );
    this.router.post(
      "/:sessionId",
      validateChatCopilotRequest,
      async (req: Request, res: Response) => {
        try {
          const sessionId = req.params.sessionId;
          const service = new MonitoringSystemAIAgent(sessionId);
          await service.init();
          const { prompt } = req.body;
          if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
          }
          const response = await service.invoke(prompt);
          res.json({ sessionId, response });
        } catch (error) {
          console.log("error", error);
          res.status(500).json({ error: (error as Error).message });
        }
      }
    );
  }
}
