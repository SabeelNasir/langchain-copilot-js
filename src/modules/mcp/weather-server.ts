import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import fetch from "node-fetch"; // only needed if Node < 18
import z from "zod";
// import { EnvConfig } from "../../config/env-config.js";

const server = new McpServer({
  name: "weather-server",
  version: "0.1.0",
});

// Register tool
server.registerTool(
  "getWeather",
  {
    description: "Get current weather for a given city",
    inputSchema: {
      city: z.string(),
    },
  },
  async ({ city }: { city: string }) => {
    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey) throw new Error("Missing WEATHER_API_KEY");

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city
    )}&appid=${apiKey}&units=metric`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Weather API error: ${res.statusText}`);
    const data = await res.json();

    return {
      content: [
        {
          type: "text",
          text: `The weather in ${data.name} is ${data.main.temp}°C with ${data.weather[0].description}.`,
        },
      ],
    };
  }
);

async function main() {
  // Start MCP server over stdio
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log("MCP Server is running...");
}

main().catch((err) => {
  console.log("Server error: ", err);
  process.exit(1);
});
