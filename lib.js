// Clean-room rate logic (Money Lab's own code). Estimates only, not tax/financial advice.
export function calcRate({ targetIncome, expenses = 0, taxPct = 0, billableHours, marginPct = 0, hoursPerDay = 6 }) {
  if (!(billableHours > 0)) throw new Error("billableHours must be > 0");
  if (targetIncome < 0 || expenses < 0) throw new Error("income/expenses must be >= 0");
  const t = Math.min(Math.max(taxPct, 0), 95) / 100;
  const grossNeeded = targetIncome / (1 - t) + expenses;
  const hourly = Math.ceil((grossNeeded / billableHours) * (1 + marginPct / 100));
  return { hourly, day: hourly * hoursPerDay, grossNeeded: Math.round(grossNeeded), billableHours };
}
export function rateRaiseEmail({ oldRate, newRate, clientName, effectiveDate = "next month", senderName = "[Your name]" }) {
  if (!(oldRate > 0) || !(newRate > 0)) throw new Error("rates must be > 0");
  if (newRate <= oldRate) throw new Error("newRate must be greater than oldRate");
  const pct = Math.round((newRate / oldRate - 1) * 100);
  return `Subject: Updated rates starting ${effectiveDate}

Hi ${clientName},

Thank you for the work we've done together. I want to keep giving your projects the same care and attention.

Starting ${effectiveDate}, my rate will be $${newRate}/hour (currently $${oldRate}/hour, a ${pct}% change). Anything already scheduled before that date stays at the current rate.

If you'd like to lock in upcoming work or discuss a monthly arrangement, just reply and we'll sort it out.

Thanks again,
${senderName}`;
}
