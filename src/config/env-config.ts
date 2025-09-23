export const EnvConfig = {
  port: process.env.PORT!,
  chatModel: process.env.CHAT_MODEL!,
  chatModelMaxTokens: parseInt(process.env.CHAT_MODEL_MAX_TOKENS!),
  chatPastInteractions: parseInt(process.env.CHAT_PAST_INTERACTIONS!),
  groqApiKey: process.env.GROQ_API_KEY!,
  mongoDB: {
    uri: process.env.MONGO_URI!,
    db: process.env.MONGO_DB!,
  },
};
