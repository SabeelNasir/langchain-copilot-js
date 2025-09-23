import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { AIMessage } from "@langchain/core/messages";

const model = new ChatGroq({
  model: process.env.CHAT_MODEL!,
  temperature: 0,
  apiKey: process.env.GROQ_API_KEY!,
});

const response: AIMessage = await model.invoke("Hello, world!");
console.log({
  content: response.content,
  usage: response.usage_metadata,
});
