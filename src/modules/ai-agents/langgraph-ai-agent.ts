import { createReactAgent, ToolNode } from "@langchain/langgraph/prebuilt";
import { ConsoleCallbackHandler } from "@langchain/core/tracers/console";
import { EnvConfig } from "../../config/env-config";
import {
  NucleusCriticalAlarmsStats,
  NucleusTicketStatsTool,
} from "../ai-tools/demo-nucleus-stats.tool";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import { mongoClient } from "../../database/mongo-datasource";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import { extractLastAIMessage } from "../../utils/utils";
import { initiateChatModels } from "../../utils/chat-models";
import { langChainDebugTracer } from "../../utils/langchain-debug-tracer";
import { Annotation, Graph, StateGraph } from "@langchain/langgraph";
import { ChatGroq } from "@langchain/groq";
import { ChatOpenAI, ChatOpenAICallOptions } from "@langchain/openai";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { CallbackManagerForLLMRun } from "@langchain/core/callbacks/manager";

const handler = new ConsoleCallbackHandler();

export class LanggraphNMSSystemAIAgentWorkflow {
  // Implementation for Monitoring System AI Agent via Langgraph Stateful workflow
  private sessionId: string;
  private chatModel: ChatGroq | ChatOpenAI<ChatOpenAICallOptions>;
  private checkPoinerSaver;
  constructor(sessionId: string) {
    this.sessionId = sessionId;
    // this.chatModel = initiateChatModels();
  }
  async init() {
    // const client = await mongoClient.connect();
    // this.checkPoinerSaver = new MongoDBSaver({
    //   client,
    //   dbName: EnvConfig.mongoDB.db,
    // });
  }

  async callAgent(userPrompt: string, sessionId: string) {
    this.chatModel = initiateChatModels();
    const client = await mongoClient.connect();
    this.checkPoinerSaver = new MongoDBSaver({
      client,
      dbName: EnvConfig.mongoDB.db,
    });

    // Define the graph state
    const GraphState = Annotation.Root({
      messages: Annotation<BaseMessage[]>({
        reducer: (x, y) => x.concat(y),
      }),
    });

    const tools = [NucleusTicketStatsTool];

    const toolNode = new ToolNode<typeof GraphState.State>(tools);

    this.chatModel.bindTools(tools);

    // Define the function that determines whether to continue or not
    function shouldContinue(state: typeof GraphState.State) {
      const messages = state.messages;
      const lastMessage = messages[messages.length - 1] as AIMessage;

      // If the LLM makes a tool call, then we route to the "tools" node
      if (lastMessage.tool_calls?.length) {
        return "tools";
      }
      // Otherwise, we stop (reply to the user)
      return "__end__";
    }

    async function callModel(
      state: typeof GraphState.State,
      model: ChatGroq | ChatOpenAI<ChatOpenAICallOptions>
    ) {
      const prompt = ChatPromptTemplate.fromMessages([
        [
          "system",
          `You are a helpful AI assistant, collaborating with other assistants. 
        Use the provided tools to progress towards answering the question. 
        If you are unable to fully answer, that's OK, another assistant with different tools will help where you left off. 
        Execute what you can to make progress. If you or any of the other assistants have the final answer or deliverable, 
        prefix your response with FINAL ANSWER so the team knows to stop. 
        You have access to the following tools: {tool_names}.\n{system_message}\nCurrent time: {time}.`,
        ],
        new MessagesPlaceholder("messages"),
      ]);
      const formattedPrompt = await prompt.formatMessages({
        system_message:
          "You are a helpful Centralized Network Monitoring System Chatbot!",
        tool_names: tools.map((tool) => tool.name).join(", "),
        time: new Date().toISOString(),
        messages: state.messages,
      });

      const result = model.invoke(formattedPrompt);

      return { messages: [result] };
    }

    // Define a graph workflow
    const workflow = new StateGraph(GraphState)
      .addNode("agent", callModel)
      .addNode("tools", toolNode)
      .addEdge("__start__", "agent")
      .addConditionalEdges("agent", shouldContinue)
      .addEdge("tools", "agent");

    // Connect mongodb saver for graph runs persistance
    const checkpointer = new MongoDBSaver({
      client,
      dbName: EnvConfig.mongoDB.db,
    });

    const app = workflow.compile({ checkpointer });

    const finalState = await app.invoke(
      { messages: [new HumanMessage(userPrompt)] },
      { configurable: { thread_id: sessionId }, recursionLimit: 5 }
    );

    return extractLastAIMessage(finalState.messages);
  }
}
