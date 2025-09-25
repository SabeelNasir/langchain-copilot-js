import type { NextFunction, Request, Response } from "express";

export const responseHandlerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.setHeader("x-custom-header", "this is custom header");

  const respBody = res.json;
  res.json = function (data) {
    const formatted = {
      status: "success",
      data: data,
    };
    return respBody.call(this, formatted);
  };
  next();
};
