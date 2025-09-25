// npm install @langchain-anthropic
import "dotenv/config";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatAnthropic } from "@langchain/anthropic";
import { tool } from "@langchain/core/tools";

import { z } from "zod";
import { ChatGroq } from "@langchain/groq";
import { WeatherTool } from "../ai-tools/weather.tool.js";

const search = tool(
  async ({ query }) => {
    if (
      query.toLowerCase().includes("sf") ||
      query.toLowerCase().includes("san francisco")
    ) {
      return "It's 60 degrees and foggy.";
    }
    return "It's 90 degrees and sunny.";
  },
  {
    name: "search",
    description: "Call to surf the web.",
    schema: z.object({
      query: z.string().describe("The query to use in your search."),
    }),
  }
);

const model = new ChatGroq({
  model: "openai/gpt-oss-20b",
  apiKey: process.env.GROQ_API_KEY!,
});

const agent = createReactAgent({
  llm: model,
  tools: [search, WeatherTool],
});

const result = await agent.invoke({
  messages: [
    {
      role: "user",
      content: "what is the weather in Rawalpindi",
    },
  ],
});
console.log(result);
