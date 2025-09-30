import "dotenv/config";
import { ActiveLLMCompany } from "./enum";

export const EnvConfig = {
  port: process.env.PORT!,
  activeLLMCompany:
    (process.env.ACTIVE_LLM_COMPANY as ActiveLLMCompany) ||
    ActiveLLMCompany.GROQ,
  chatModel: process.env.CHAT_MODEL!,
  chatModelMaxTokens: parseInt(process.env.CHAT_MODEL_MAX_TOKENS!),
  chatPastInteractions: parseInt(process.env.CHAT_PAST_INTERACTIONS!),
  groqApiKey: process.env.GROQ_API_KEY!,
  openApiKey: process.env.OPEN_API_KEY!,
  mongoDB: {
    uri: process.env.MONGO_URI!,
    db: process.env.MONGO_DB!,
  },
  mongoDbAtlas: {
    uri: process.env.MONGODB_ATLAS_URI,
    dbName: process.env.MONGODB_ATLAS_DB_NAME,
  },
  weatherApiKey: process.env.WEATHER_API_KEY,
  nucleusDemoCredentails: {
    apiHost: process.env.NUCLEUS_API_HOST!,
    apiToken: process.env.NUCLEUS_API_TOKEN!,
  },
};
