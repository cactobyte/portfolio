"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { signIn, signOut } from "@/auth";
import { db, schema } from "@/lib/db";
import { hkToday } from "@/lib/me/dates";
import { standardPricing } from "@/lib/me/pricing";
import { requireOwner } from "@/lib/me/owner";
import { clientInput, leadInput, paymentInput } from "@/lib/me/validation";

const { leads, clients, payments } = schema;
const id = z.coerce.number().int().positive();

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
