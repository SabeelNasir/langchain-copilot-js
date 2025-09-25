import type { NextFunction, Request, Response } from "express";

export const asyncHandler =
  (callback: Function) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await callback();
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
