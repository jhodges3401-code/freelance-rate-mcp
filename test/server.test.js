import { test } from "node:test";
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { calcRate, rateRaiseEmail } from "../lib.js";
import { buildServer } from "../server.js";

test("calcRate matches web calculator defaults", () => {
  // web defaults: 70k income, 8k exp, 28% tax, 15% margin, 46*40*0.65 = 1196 h
  const r = calcRate({ targetIncome: 70000, expenses: 8000, taxPct: 28, marginPct: 15, billableHours: 1196 });
  const expected = Math.ceil(((70000 / 0.72 + 8000) / 1196) * 1.15);
  assert.equal(r.hourly, expected);
  assert.equal(r.day, expected * 6);
});
test("calcRate simple case", () => {
  assert.deepEqual(calcRate({ targetIncome: 50000, billableHours: 1000 }), { hourly: 50, day: 300, grossNeeded: 50000, billableHours: 1000 });
});
test("calcRate rejects zero hours", () => assert.throws(() => calcRate({ targetIncome: 1, billableHours: 0 })));
test("email content", () => {
  const e = rateRaiseEmail({ oldRate: 80, newRate: 95, clientName: "Acme", effectiveDate: "Nov 1" });
  assert.match(e, /Hi Acme/); assert.match(e, /\$95\/hour/); assert.match(e, /19% change/);
  assert.throws(() => rateRaiseEmail({ oldRate: 95, newRate: 80, clientName: "A" }));
});
test("MCP end-to-end via client", async () => {
  const [ct, st] = InMemoryTransport.createLinkedPair();
  await buildServer().connect(st);
  const c = new Client({ name: "t", version: "0" }); await c.connect(ct);
  const names = (await c.listTools()).tools.map((t) => t.name).sort();
  assert.deepEqual(names, ["calc_rate", "rate_raise_email"]);
  const r = await c.callTool({ name: "calc_rate", arguments: { targetIncome: 50000, billableHours: 1000 } });
  assert.equal(JSON.parse(r.content[0].text).hourly, 50);
  const bad = await c.callTool({ name: "rate_raise_email", arguments: { oldRate: 90, newRate: 80, clientName: "X" } });
  assert.equal(bad.isError, true);
  await c.close();
});
