"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { signIn, signOut } from "@/auth";
import { db, schema } from "@/lib/db";
import {
  clientStatuses,
  contactChannels,
  leadCategories,
  leadStages,
  paymentKinds,
  websiteStates,
} from "@/lib/db/schema";
import { hkToday } from "@/lib/me/dates";
import { standardPricing } from "@/lib/me/pricing";
import { requireOwner } from "@/lib/me/owner";

const { leads, clients, payments } = schema;

// Empty form fields arrive as "", which should be stored as null.
const optionalText = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .nullable()
  .default(null);
const optionalDate = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .pipe(z.iso.date().nullable())
  .nullable()
  .default(null);
const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z
    .string()
    .transform((v) => (v === "" ? null : v))
    .pipe(z.enum(values).nullable())
    .nullable()
    .default(null);
const money = z.coerce.number().int().min(0).max(10_000_000);
const id = z.coerce.number().int().positive();

const leadInput = z.object({
  name: z.string().trim().min(1, "Name is required"),
  nameZh: optionalText,
  category: z.enum(leadCategories),
  district: optionalText,
  stage: z.enum(leadStages),
  websiteState: z.enum(websiteStates),
  websiteUrl: optionalText,
  problem: optionalText,
  channel: optionalEnum(contactChannels),
  contact: optionalText,
  demoSlug: optionalText,
  sources: optionalText,
  notes: optionalText,
  contactedOn: optionalDate,
  nextActionOn: optionalDate,
});

const clientInput = z.object({
  name: z.string().trim().min(1, "Name is required"),
  domain: optionalText,
  status: z.enum(clientStatuses),
  setupFee: money,
  monthlyFee: money,
  startedOn: optionalDate,
  notes: optionalText,
});

const paymentInput = z.object({
  kind: z.enum(paymentKinds),
  amount: money.refine((n) => n > 0, "Amount must be more than zero"),
  paidOn: z.iso.date(),
  note: optionalText,
});

function fields(form: FormData) {
  return Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === "string"));
}

function refresh() {
  revalidatePath("/me", "layout");
}

export async function signInWithGitHub() {
  await signIn("github", { redirectTo: "/me" });
}

export async function signOutOwner() {
  await signOut({ redirectTo: "/me/sign-in" });
}

export async function createLead(form: FormData) {
  await requireOwner();
  const values = leadInput.parse(fields(form));
  const [lead] = await db().insert(leads).values(values).returning({ id: leads.id });
  refresh();
  redirect(`/me/leads/${lead.id}`);
}

export async function updateLead(leadId: number, form: FormData) {
  await requireOwner();
  const values = leadInput.parse(fields(form));
  // Moving to "contacted" stamps the date if it wasn't filled in.
  if (values.stage === "contacted" && !values.contactedOn) values.contactedOn = hkToday();
  // Closed leads have nothing left to chase.
  if (values.stage === "won" || values.stage === "lost") values.nextActionOn = null;
  await db().update(leads).set(values).where(eq(leads.id, id.parse(leadId)));
  refresh();
  redirect(`/me/leads/${leadId}?saved=1`);
}

export async function deleteLead(leadId: number) {
  await requireOwner();
  await db().delete(leads).where(eq(leads.id, id.parse(leadId)));
  refresh();
  redirect("/me/leads");
}

/** Turns a won lead into a client record, carrying its name across. */
export async function convertLead(leadId: number) {
  await requireOwner();
  const [lead] = await db().select().from(leads).where(eq(leads.id, id.parse(leadId)));
  if (!lead) redirect("/me/leads");
  const [client] = await db()
    .insert(clients)
    .values({ leadId: lead.id, name: lead.name, startedOn: hkToday(), ...standardPricing })
    .returning({ id: clients.id });
  await db().update(leads).set({ stage: "won", nextActionOn: null }).where(eq(leads.id, lead.id));
  refresh();
  redirect(`/me/clients/${client.id}`);
}

export async function createClient(form: FormData) {
  await requireOwner();
  const values = clientInput.parse(fields(form));
  const [client] = await db().insert(clients).values(values).returning({ id: clients.id });
  refresh();
  redirect(`/me/clients/${client.id}`);
}

export async function updateClient(clientId: number, form: FormData) {
  await requireOwner();
  const values = clientInput.parse(fields(form));
  await db().update(clients).set(values).where(eq(clients.id, id.parse(clientId)));
  refresh();
  redirect(`/me/clients/${clientId}?saved=1`);
}

export async function recordPayment(clientId: number, form: FormData) {
  await requireOwner();
  const values = paymentInput.parse(fields(form));
  await db().insert(payments).values({ ...values, clientId: id.parse(clientId) });
  refresh();
  redirect(`/me/clients/${clientId}`);
}

export async function deletePayment(clientId: number, paymentId: number) {
  await requireOwner();
  await db().delete(payments).where(eq(payments.id, id.parse(paymentId)));
  refresh();
  redirect(`/me/clients/${clientId}`);
}
