// Spawns server.js over stdio as a real MCP client would, and prints a transcript.
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
const c = new Client({ name: "demo-client", version: "0" });
await c.connect(new StdioClientTransport({ command: "node", args: ["server.js"] }));
console.log("> tools/list\n" + (await c.listTools()).tools.map((t) => `  - ${t.name}: ${t.description}`).join("\n"));
for (const [name, args] of [["calc_rate", { targetIncome: 70000, expenses: 8000, taxPct: 28, marginPct: 15, billableHours: 1196 }],
  ["rate_raise_email", { oldRate: 80, newRate: 95, clientName: "Acme Co", effectiveDate: "November 1", senderName: "Sam" }]]) {
  const r = await c.callTool({ name, arguments: args });
  console.log(`\n> tools/call ${name} ${JSON.stringify(args)}\n${r.content[0].text}`);
}
await c.close();
