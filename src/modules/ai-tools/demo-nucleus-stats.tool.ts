// Ticket Stats API Tool

import { tool } from "@langchain/core/tools";
import z from "zod";
import { EnvConfig } from "../../config/env-config";
import https from "https";
import axios, { HttpStatusCode } from "axios";

const agent = new https.Agent({
  rejectUnauthorized: false, // OR better: pass a custom CA here
});

// Set Axios defaults
axios.defaults.baseURL = EnvConfig.nucleusDemoCredentails.apiHost;
axios.defaults.headers.common[
  "Authorization"
] = `Bearer ${EnvConfig.nucleusDemoCredentails.apiToken}`;
axios.defaults.httpsAgent = agent;

export const NucleusTicketStatsTool = tool(
  async (): Promise<string> => {
    try {
      console.log("Fetching ticket stats from Nucleus API...");
      const url = `trouble-ticket-dashboard/network-wise-departmental-stats`;
      const resp = await axios.get(url);
      if (resp.status !== HttpStatusCode.Ok) {
        console.log("Tool API Error:", resp.data);
        throw new Error("Error in fetching ticket stats");
      }
      console.log("URL Called: ", url);
      const data = await resp.data;
      return JSON.stringify(data);
    } catch (err) {
      console.log("Tool API Exception:", err);
    }
  },
  {
    name: "get_tickets_stats",
    description:
      "Fetch nucleus ticketing statistics for today which can provide insights on network issues and departmental performance. No query parameters required.",
  }
);

export const NucleusCriticalAlarmsStats = tool(
  async ({ selected_network, selected_period }): Promise<string> => {
    try {
      console.log("Fetching critical alarms stats from Nucleus API...");
      const url = `dashboard-stats/counts/${selected_network}?period=${selected_period}&status=uncleared`;
      const resp = await axios.get(url);
      if (resp.status !== HttpStatusCode.Ok) {
        console.log("Tool API Error:", resp.data);
        throw new Error("Error in fetching ticket stats");
      }
      console.log("URL Called: ", url);
      const data = await resp.data;
      return JSON.stringify(data);
    } catch (err) {
      console.log("Tool API Exception:", err);
    }
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
