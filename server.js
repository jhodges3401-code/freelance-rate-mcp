#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { calcRate, rateRaiseEmail } from "./lib.js";

export function buildServer() {
  const server = new McpServer({ name: "freelance-rate-demo", version: "0.1.0" });
  const ok = (o) => ({ content: [{ type: "text", text: typeof o === "string" ? o : JSON.stringify(o, null, 2) }] });
  const fail = (e) => ({ isError: true, content: [{ type: "text", text: String(e.message || e) }] });
  server.registerTool("calc_rate", {
    description: "Hourly and day rate needed to hit a target after-tax income. Estimates only.",
    inputSchema: {
      targetIncome: z.number().min(0).describe("Desired after-tax income per year ($)"),
      billableHours: z.number().positive().describe("Billable hours per year"),
      expenses: z.number().min(0).default(0).describe("Business expenses per year ($)"),
      taxPct: z.number().min(0).max(95).default(0).describe("Effective tax rate %"),
      marginPct: z.number().min(0).default(0).describe("Profit/buffer margin %"),
      hoursPerDay: z.number().positive().default(6).describe("Billable hours per day"),
    },
  }, async (a) => { try { return ok(calcRate(a)); } catch (e) { return fail(e); } });
  server.registerTool("rate_raise_email", {
    description: "Draft a polite rate-increase email to a client.",
    inputSchema: {
      oldRate: z.number().positive(), newRate: z.number().positive(), clientName: z.string().min(1),
      effectiveDate: z.string().optional(), senderName: z.string().optional(),
    },
  }, async (a) => { try { return ok(rateRaiseEmail(a)); } catch (e) { return fail(e); } });
  return server;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await buildServer().connect(new StdioServerTransport());
}
