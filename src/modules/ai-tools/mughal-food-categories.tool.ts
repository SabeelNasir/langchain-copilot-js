import { tool } from "@langchain/core/tools";
import z from "zod"; // add schema
// If Node < 18, uncomment:
// import fetch from "node-fetch";

export const MughalFoodCategoriesTool = tool(
  async (): Promise<string> => {
    const url = "https://api.mughaleazam.com.pk/categories?limit=5";

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error("Error in getting food-categories");
    }
    const data = await res.json();

    const categories = data?.response?.data?.categories ?? [];

    // ✅ Ensure response is always a string
    return JSON.stringify(categories);
  },
  {
    name: "get_food_categories",
    description:
      "Fetches the food categories list for the Mughal-e-Azam Restaurant.",
    schema: z.object({}), // no input params
  }
);

// Example usage
// const result = await MughalFoodCategoriesTool.invoke({});
// console.log("tool-result", result);
