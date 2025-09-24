import type { Request, Response, NextFunction } from "express";

import Joi from "joi";

const aiAgentSchema = Joi.object({
  name: Joi.string().min(2).required(),
  model: Joi.string().min(2).required(),
  description: Joi.string().allow("").optional(),
  systemMessage: Joi.string().allow("").optional(),
});

export function validateAIAgent(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { error } = aiAgentSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res
      .status(400)
      .json({ error: error.details.map((d) => d.message).join(", ") });
  }
  next();
}
