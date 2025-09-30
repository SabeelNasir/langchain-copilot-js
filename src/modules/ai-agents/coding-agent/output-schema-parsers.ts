import { StructuredOutputParser } from "@langchain/core/output_parsers";
import z from "zod";

const fileSchema = z.object({
  path: z
    .string()
    .describe("the path of the file to be created with proper extension."),
  purpose: z
    .string()
    .describe(
      "purpose of each file to be created. e.g: main app bootstrap, for styling css, main entry point etc"
    ),
});

const planSchema = z.object({
  name: z.string(),
  description: z.string().describe("a one liner description of the app"),
  techstack: z.string(),
  features: z.array(
    z
      .string()
      .describe(
        "a list of features application should have, e.g: authentication, order booking"
      )
  ),
  files: z.array(fileSchema),
});
const planParser = StructuredOutputParser.fromZodSchema(planSchema);

/**
 * TASK Implemetation related schemas
 */
const implementationTask = z.object({
  filePath: z.string().describe("path of the file to be created"),
  task_description: z
    .string()
    .describe("a detailed description of the task to be performed on the file"),
});
const taskPlanSchema = z.object({
  description: z.string().describe("a on"),
  list_of_tasks: z
    .array(implementationTask)
    .describe("a list of steps to be taken to implement the task"),
});
const taskPlanParser = StructuredOutputParser.fromZodSchema(taskPlanSchema);
/**************** */

//======= Router Agent Schema for Intent classification ====//
export const routerSchema = z.object({
  intent: z
    .enum(["project", "generic"])
    .describe(
      "Classify as per user request if it is project building related then (`project`) otherwise (`generic`)"
    ),
});
const routerSchemaParser = StructuredOutputParser.fromZodSchema(routerSchema);

export { planParser, taskPlanParser, routerSchemaParser };
