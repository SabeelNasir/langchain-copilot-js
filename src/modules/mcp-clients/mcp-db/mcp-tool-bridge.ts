import { DynamicStructuredTool, tool } from "@langchain/core/tools";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import z from "zod";

export class McpToolBridge {
  private client: Client;

  constructor() {
    // Provide client info as required
    this.client = new Client({ name: "langchain-bridge", version: "1.0.0" });
  }

  async connect() {
    // Connect using the HTTP transport (pointing to your mcp-dbs server)
    const transport = new SSEClientTransport(
      new URL("http://localhost:3011/mcp") // 👈 supply sessionId
    );
    await this.client.connect(transport as any);

    console.log("✅ Connected to MCP-DBS on http://localhost:3011");

    // List tools from MCP server
    const tools = await this.client.listTools();
    console.log("Available MCP tools:", tools);

    // Test connect-database tool
    // await this.testConnectDatabaseTool(tools);

    // Test execute-query tool
    // await this.testExecuteQueryDbTool(tools);

    // List mcp-dbs resources
    // const resources = await this.client.listResources();
    // console.log("MCP resources:", JSON.stringify(resources, null, 2));
  }

  getClient(): Client {
    return this.client;
  }

  /** Convert MCP tools → LangChain tools */
  async getLangChainTools() {
    const toolsMeta = await this.client.listTools();

    return toolsMeta.tools.map((t) => {
      return new DynamicStructuredTool({
        name: t.name,
        description: t.description ?? "No description",
        schema: z.object({
          connectionId: z.string().optional(),
          query: z.string(),
          params: z.array(z.any()).optional(),
        }),
        func: async (rawInput) => {
          console.log("Raw input received:", rawInput);
          const input = rawInput ?? {}; // 👈 ensure not undefined

          if (t.name === "execute-query" && !input.connectionId) {
            input.connectionId = "mydb2";
          }

          const res = await this.client.callTool({
            name: t.name,
            arguments: input, // 👈 must be "arguments", not "input"
          });

          return JSON.stringify(res, null, 2);
        },
      });
    });
  }

  /** Utility: JSON Schema → Zod schema (basic converter) */
  private jsonSchemaToZod(schema: any): z.ZodTypeAny {
    if (!schema || !schema.type) return z.any();

    switch (schema.type) {
      case "object": {
        const shape: Record<string, z.ZodTypeAny> = {};
        for (const [key, value] of Object.entries(schema.properties ?? {})) {
          const zodType = this.jsonSchemaToZod(value);
          const isRequired = schema.required?.includes(key);
          shape[key] = isRequired ? zodType : zodType.optional();
        }
        return z.object(shape);
      }
      case "string":
        // if (schema.enum) {
        //   return z.enum([...schema]);
        // }
        return z.string();
      case "number":
        return z.number();
      case "integer":
        return z.number().int();
      case "boolean":
        return z.boolean();
      case "array":
        return z.array(this.jsonSchemaToZod(schema.items));
      default:
        return z.any();
    }
  }

  async testConnectDatabaseTool(toolsMeta) {
    // Call the "connect-database" tool if present
    const connectTool = toolsMeta.tools.find(
      (t) => t.name === "connect-database"
    );
    if (connectTool) {
      // using your tool wrapper or client.callTool directly
      const res = await this.client.callTool({
        name: "connect-database",
        arguments: {
          connectionId: "mydb2",
          type: "postgres",
          config: {
            host: "localhost",
            port: 5432,
            database: "",
            user: "",
            password: "root",
            ssl: false,
          },
        },
      });
      console.log("Connect DB result:", res);

      // now list resources
      const resources = await this.client.listResources();
      console.log("Registered resources:", resources);
    }
  }

  async testExecuteQueryDbTool(tools) {
    const queryTool = tools.find((t) => t.name === "execute-query");
    const result = await queryTool!.invoke({
      connectionId: "mydb2",
      query: "select * From nucleus_db.observium_alert limit 3;",
      params: [],
    });
    console.log("DB Result:", result);
  }
}
