import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { isAuthorizedAutomation } from "@/lib/me/api-token";
import { leadInput } from "@/lib/me/validation";

// Machine access to the leads table for the daily outreach sessions. The dashboard itself uses server actions.

const { leads } = schema;

const unauthorized = () => Response.json({ error: "Unauthorized" }, { status: 401 });

function hostOf(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/** Everything needed to avoid contacting the same business twice. */
export async function GET(request: Request) {
  if (!isAuthorizedAutomation(request)) return unauthorized();
  const rows = await db()
    .select({
      id: leads.id,
      name: leads.name,
      websiteUrl: leads.websiteUrl,
      contact: leads.contact,
      stage: leads.stage,
      demoSlug: leads.demoSlug,
      contactedOn: leads.contactedOn,
    })
    .from(leads);
  return Response.json({ leads: rows });
}

/** Creates leads, skipping any whose name or website domain is already known. */
export async function POST(request: Request) {
  if (!isAuthorizedAutomation(request)) return unauthorized();
  const body = await request.json().catch(() => null);
  const parsed = z.array(leadInput).min(1).max(50).safeParse(Array.isArray(body) ? body : [body]);
  if (!parsed.success) return Response.json({ error: z.prettifyError(parsed.error) }, { status: 400 });

  const existing = await db().select({ name: leads.name, websiteUrl: leads.websiteUrl }).from(leads);
  const knownNames = new Set(existing.map((l) => l.name.trim().toLowerCase()));
  const knownHosts = new Set(existing.map((l) => hostOf(l.websiteUrl)).filter(Boolean));

  const created: { id: number; name: string }[] = [];
  const skipped: string[] = [];
  for (const lead of parsed.data) {
    const name = lead.name.trim().toLowerCase();
    const host = hostOf(lead.websiteUrl);
    if (knownNames.has(name) || (host && knownHosts.has(host))) {
      skipped.push(lead.name);
      continue;
    }
    const [row] = await db().insert(leads).values(lead).returning({ id: leads.id, name: leads.name });
    created.push(row);
    knownNames.add(name);
    if (host) knownHosts.add(host);
  }
  if (created.length) revalidatePath("/me", "layout");
  return Response.json({ created, skipped }, { status: created.length ? 201 : 200 });
}

/** Updates one lead. Only fields present in the body are written. */
export async function PATCH(request: Request) {
  if (!isAuthorizedAutomation(request)) return unauthorized();
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ error: "Expected a JSON object with an id" }, { status: 400 });
  }
  const id = z.coerce.number().int().positive().safeParse(body.id);
  if (!id.success) return Response.json({ error: "Missing or invalid id" }, { status: 400 });

  const { id: _id, ...fields } = body as Record<string, unknown>;
  void _id;
  const parsed = leadInput.partial().safeParse(fields);
  if (!parsed.success) return Response.json({ error: z.prettifyError(parsed.error) }, { status: 400 });
  // partial() still applies defaults, so keep only the keys that were actually sent.
  const values = Object.fromEntries(Object.entries(parsed.data).filter(([key]) => key in fields));
  if (Object.keys(values).length === 0) return Response.json({ error: "Nothing to update" }, { status: 400 });

  const [row] = await db()
    .update(leads)
    .set({ ...values, updatedAt: sql`now()` })
    .where(eq(leads.id, id.data))
    .returning({ id: leads.id, stage: leads.stage });
  if (!row) return Response.json({ error: "Lead not found" }, { status: 404 });
  revalidatePath("/me", "layout");
  return Response.json({ lead: row });
}
