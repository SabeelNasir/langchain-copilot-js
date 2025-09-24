import { Router, type Request, type Response } from "express";

export class UserRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.intiateRoutes();
  }

  intiateRoutes() {
    this.router.get("/", (req: Request, res: Response) => {
      res.send("User-Route working");
    });
  }
}
