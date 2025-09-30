import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export const errorResponesHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("ERROR: ", err);
  res.status(err.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
    status: false,
    error: {
      message: err?.message || "Unexpected happened",
      stack: err?.stack || undefined,
    },
    timestamp: new Date().toISOString(),
  });
};
