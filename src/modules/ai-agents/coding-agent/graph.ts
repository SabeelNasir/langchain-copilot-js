import "dotenv/config";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import { Annotation, Graph, StateGraph } from "@langchain/langgraph";
import { initiateChatModels } from "../../../utils/chat-models";
import { ArchitectPrompt, PlannerPrompt, RouterPrompt } from "./prompts";
import z from "zod";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { extractJson, extractLastAIMessage } from "../../../utils/utils";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import { mongoClient } from "../../../database/mongo-datasource";
import { EnvConfig } from "../../../config/env-config";
import { routerSchema, routerSchemaParser } from "./output-schema-parsers";
import { parse } from "path";

type RouterType = z.infer<typeof routerSchema>;

const GraphState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
  }),
  intent: Annotation<string>({
    reducer: (x, y) => y ?? x,
  }),
});

const chatModel = initiateChatModels();

const plannerAgent = async (state: typeof GraphState.State) => {
  // Convert user prompt into a engineering plan //
  const formattedPrompt = await PlannerPrompt(state.messages);
  const resp = await chatModel.invoke(formattedPrompt);
  return { messages: [resp] };
};

const architectAgent = async (state: typeof GraphState.State) => {
  const formattedPrompt = await ArchitectPrompt(state.messages);
  const resp = await chatModel.invoke(formattedPrompt);
  return { messages: [resp] };
};

const routerAgent = async (state: typeof GraphState.State) => {
  const formattedPrompt = await RouterPrompt(state.messages);
  const resp = await chatModel.invoke(formattedPrompt);

  // Normalize content to string
  const raw =
    typeof resp.content === "string"
      ? resp.content
      : JSON.stringify(resp.content);

  // Strip <think> + grab JSON
  const jsonString = extractJson(raw);

  const parsed = await routerSchemaParser.parse(jsonString);
  return {
    ...state,
    intent: parsed.intent,
    messages: [...state.messages, new AIMessage(JSON.stringify(parsed))],
  };
};

const genericAgent = async (state: typeof GraphState.State) => {
  const resp = await chatModel.invoke(state.messages);
  return {
    ...state,
    messages: [...state.messages, new AIMessage(resp.content.toString())],
  };
};

export const callCodingAgent = async (
  userPrompt: string,
  sessionId?: string
) => {
  //Init graph & flow
  const graph = new StateGraph(GraphState)
    .addNode("router", routerAgent)
    .addNode("generic", genericAgent)
    .addNode("planner", plannerAgent)
    .addNode("architect", architectAgent)
    .addEdge("planner", "architect")
    .addEdge("__start__", "router")
    .addConditionalEdges("router", (state) => {
      return state.intent === "project" ? "planner" : "generic";
    });

  // Memory Checkpointer
  const checkpointer = new MongoDBSaver({
    client: mongoClient,
    dbName: EnvConfig.mongoDB.db,
  });

  const agent = graph.compile({ checkpointer });

  const result = await agent.invoke(
    {
      messages: [new HumanMessage(userPrompt)],
    },
    { recursionLimit: 10, configurable: { thread_id: sessionId } }
  );
  return extractLastAIMessage(result.messages);
};

// Testing manual run
// callCodingAgent("need to make calculator app.")
//   .then((resp) => console.log("model-response", resp))
//   .catch((err) => console.log("error in graph call: ", err));
