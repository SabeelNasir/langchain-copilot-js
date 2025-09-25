import "dotenv/config";

import express from "express";
import morgan from "morgan";
import router from "./routes/index.js";
import { MongoDataSource } from "./database/mongo-datasource.js";
import { responseHandlerMiddleware } from "./middlewares/response-handler.js";
import { errorResponesHandler } from "./middlewares/error-handler.js";

// Initialize mongodb
await MongoDataSource.initialize()
  .then(() => {
    console.log("Mongodb connected via Typeorm");
  })
  .catch((err) => {
    console.error("MongoDB connection error: ", err);
  });

const app = express();

// middleware
app.use(express.json());
app.use(morgan("dev"));
app.use(responseHandlerMiddleware);

// API App Routes
app.use("/api", router);

app.use(errorResponesHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Langchain server running on : ", PORT);
});
