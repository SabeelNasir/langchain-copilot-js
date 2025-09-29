// Ticket Stats API Tool

import { tool } from "@langchain/core/tools";
import z from "zod";
import { EnvConfig } from "../../config/env-config";

export const NucleusTicketStatsTool = tool(
  async (): Promise<string> => {
    console.log("Fetching ticket stats from Nucleus API...");
    const url = `http://47.128.201.248:3000/trouble-ticket-dashboard/network-wise-departmental-stats`;
    const resp = await fetch(url, {
      headers: {
        Authorization: `Bearer ${EnvConfig.nucleusDemoCredentails.apiToken}`,
      },
    });
    if (!resp.ok) {
      throw new Error("Error in fetching ticket stats");
    }
    console.log("URL Called: ", url);
    const data = await resp.json();
    return JSON.stringify(data);
  },
  {
    name: "get_tickets_stats",
    description:
      "Fetch nucleus ticketing statistics for today which can provide insights on network issues and departmental performance. No query parameters required.",
  }
);

export const NucleusCriticalAlarmsStats = tool(
  async ({ selected_network, selected_period }): Promise<string> => {
    console.log("Fetching critical alarms stats from Nucleus API...");
    const url = `http://47.128.201.248:3000/dashboard-stats/counts/${selected_network}?period=${selected_period}&status=uncleared`;
    const resp = await fetch(url, {
      headers: {
        Authorization: `Bearer ${EnvConfig.nucleusDemoCredentails.apiToken}`,
      },
    });
    if (!resp.ok) {
      throw new Error("Error in fetching ticket stats");
    }
    console.log("URL Called: ", url);
    const data = await resp.json();
    return JSON.stringify(data);
  },
  {
    name: "get_critical_alarms_stats",
    description:
      "Fetch nucleus critical alarms statistics against specific network domain and period. Allowed Networks are <transmission, gpon, ip>. Periods are LAST_WEEK & LAST_24_HOURS",
    schema: z.object({
      selected_network: z
        .string()
        .describe(
          "network domain name, allowed names are transmission, gpon, ip"
        )
        .nonempty(),
      selected_period: z
        .string()
        .describe("periods are LAST_WEEK  & LAST_24_HOURS")
        .nonempty(),
    }),
  }
);
