# freelance-rate-mcp: demo MCP server

A small Model Context Protocol server, built on the official TypeScript SDK (`@modelcontextprotocol/sdk` 1.32.1, run as plain Node ESM). It exposes freelance rate-calculator logic as tools. Its outputs are estimates, not tax or financial advice.

## Tools
| Tool | Inputs | Output |
|---|---|---|
| `calc_rate` | targetIncome, billableHours (per year), expenses=0, taxPct=0, marginPct=0, hoursPerDay=6 | `{hourly, day, grossNeeded, billableHours}`. Formula: hourly = ceil((income/(1-tax) + expenses) / billableHours × (1+margin)) |
| `rate_raise_email` | oldRate, newRate, clientName, effectiveDate?, senderName? | Draft email text. Returns an error unless newRate is greater than oldRate. |

## Run
```bash
npm install
npm test          # 5 tests (unit + in-memory MCP client end-to-end)
node demo.js      # spawns server over stdio, writes transcript
npm start         # stdio server
```
Claude Desktop / Cursor config:
```json
{ "mcpServers": { "freelance-rate": { "command": "node", "args": ["/abs/path/demo-server/server.js"] } } }
```
See `DEMO-TRANSCRIPT.txt` for a sample session.

## License
MIT
