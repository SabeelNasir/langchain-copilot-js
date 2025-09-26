// src/ai/tools/weather-tool.ts
import { tool } from "@langchain/core/tools";
import fetch from "node-fetch";
import z from "zod";
import { EnvConfig } from "../../config/env-config.js";

export const WeatherTool = tool(
  async ({ city }): Promise<string> => {
    const apiKey = EnvConfig.weatherApiKey; // put your key in .env
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city
    )}&units=metric&appid=${apiKey}`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Weather API error: ${res.statusText}`);
    }
    const data = await res.json();
    return `The weather in ${city} is ${data.weather[0].description}, temperature ${data.main.temp}°C.`;
  },
  {
    name: "get_weather",
    description: "Fetches current weather for a given city.",
    schema: z.object({
      city: z.string().describe("The city to get the weather for"),
    }),
  }
);

// const result = await WeatherTool.invoke({ city: "Naran" });
// console.log("tool-result", result);
