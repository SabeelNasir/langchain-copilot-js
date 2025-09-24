import { type Request, type Response, type NextFunction } from "express";

export function validateChatCopilotRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { prompt } = req.body;
  if (typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ error: "Prompt must be a non-empty string" });
  }
  next();
}
