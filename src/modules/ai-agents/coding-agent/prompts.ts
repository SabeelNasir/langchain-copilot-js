import { BaseMessage } from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import {
  planParser,
  routerSchema,
  routerSchemaParser,
  taskPlanParser,
} from "./output-schema-parsers";

export const PlannerPrompt = (messages: BaseMessage[]) => {
  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are the PLANNER agent. Convert the user prompt into a COMPLETE engineering project plan.
       Stay very consice for now and short. Tech Stack is HTML, CSS, Javascript only.
       If user request is not clear, you can ask them for more clarity & specifci basic details.
       Current Time: {current_time}
       Output Schema Instructions are: {output_schema}`,
    ],
    new MessagesPlaceholder("messages"),
  ]);
  return prompt.formatMessages({
    current_time: new Date().toISOString(),
    messages,
    output_schema: planParser.getFormatInstructions(),
  });
};

export const ArchitectPrompt = (messages: BaseMessage[]) => {
  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are the Software Architect Agent. Make list of tasks as per given plan. Plan: {plan}
      Output Schema Instructions are: {output_schema}`,
    ],
    new MessagesPlaceholder("messages"),
  ]);
  return prompt.formatMessages({
    plan: messages,
    messages,
    output_schema: taskPlanParser.getFormatInstructions(),
  });
};

export const RouterPrompt = (messages: BaseMessage[]) => {
  const userInput = messages[messages.length - 1].content;
  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `Classify as per user request prompt and return the response in required json schema.
      User input: {user_input}
      Output Schema is: {output_schema}`,
    ],
    new MessagesPlaceholder("messages"),
  ]);
  return prompt.formatMessages({
    messages,
    user_input: userInput,
    output_schema: routerSchemaParser.getFormatInstructions(),
  });
};
