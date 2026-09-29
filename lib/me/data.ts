import { and, asc, desc, eq, gte, inArray, isNotNull, lte, sql, sum } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { leadStages } from "@/lib/db/schema";
import { hkToday } from "./dates";
import { requireOwner } from "./owner";

const { leads, clients, payments } = schema;
const openStages = ["found", "demo_built", "contacted", "replied"] as const;

export type LeadStage = (typeof leadStages)[number];

export async function getOverview() {
  await requireOwner();
  const today = hkToday();
  const monthStart = `${today.slice(0, 7)}-01`;

  const [stageRows, mrrRow, collectedRow, due] = await Promise.all([
    db()
      .select({ stage: leads.stage, count: sql<number>`count(*)::int` })
      .from(leads)
      .groupBy(leads.stage),
    db()
      .select({ total: sum(clients.monthlyFee).mapWith(Number) })
      .from(clients)
      .where(eq(clients.status, "active")),
    db()
      .select({ total: sum(payments.amount).mapWith(Number) })
      .from(payments)
      .where(gte(payments.paidOn, monthStart)),
    db()
      .select()
      .from(leads)
      .where(
        and(inArray(leads.stage, [...openStages]), isNotNull(leads.nextActionOn), lte(leads.nextActionOn, today)),
      )
      .orderBy(asc(leads.nextActionOn))
      .limit(20),
  ]);

  const byStage = Object.fromEntries(leadStages.map((s) => [s, 0])) as Record<LeadStage, number>;
  for (const row of stageRows) byStage[row.stage] = row.count;

  return {
    byStage,
    inPlay: openStages.reduce((n, s) => n + byStage[s], 0),
    mrr: mrrRow[0]?.total ?? 0,
    collectedThisMonth: collectedRow[0]?.total ?? 0,
    due,
    today,
  };
}

export async function listLeads(stage?: LeadStage) {
  await requireOwner();
  return db()
    .select()
    .from(leads)
    .where(stage ? eq(leads.stage, stage) : undefined)
    .orderBy(desc(leads.updatedAt));
}

export async function getLead(id: number) {
  await requireOwner();
  const [lead] = await db().select().from(leads).where(eq(leads.id, id));
  if (!lead) return null;
  const [client] = await db().select({ id: clients.id }).from(clients).where(eq(clients.leadId, id)).limit(1);
  return { lead, clientId: client?.id ?? null };
}

export async function listClients() {
  await requireOwner();
  return db()
    .select({
      client: clients,
      paid: sql<number>`coalesce(sum(${payments.amount}), 0)::int`,
    })
    .from(clients)
    .leftJoin(payments, eq(payments.clientId, clients.id))
    .groupBy(clients.id)
    .orderBy(asc(clients.status), desc(clients.createdAt));
}

export async function getClient(id: number) {
  await requireOwner();
  const [client] = await db().select().from(clients).where(eq(clients.id, id));
  if (!client) return null;
  const clientPayments = await db()
    .select()
    .from(payments)
    .where(eq(payments.clientId, id))
    .orderBy(desc(payments.paidOn), desc(payments.id));
  return { client, payments: clientPayments };
}
