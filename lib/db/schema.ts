import { relations } from "drizzle-orm";
import { date, integer, pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const leadStages = ["found", "demo_built", "contacted", "replied", "won", "lost"] as const;
export const leadCategories = ["cafe", "restaurant", "salon", "clinic", "stay", "other"] as const;
export const websiteStates = ["none", "broken", "outdated", "fine"] as const;
export const contactChannels = ["email", "instagram", "facebook", "whatsapp", "phone"] as const;
export const clientStatuses = ["active", "paused", "ended"] as const;
export const paymentKinds = ["setup", "monthly", "other"] as const;

export const leadStage = pgEnum("lead_stage", leadStages);
export const leadCategory = pgEnum("lead_category", leadCategories);
export const websiteState = pgEnum("website_state", websiteStates);
export const contactChannel = pgEnum("contact_channel", contactChannels);
export const clientStatus = pgEnum("client_status", clientStatuses);
export const paymentKind = pgEnum("payment_kind", paymentKinds);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameZh: text("name_zh"),
  category: leadCategory("category").notNull(),
  district: text("district"),
  stage: leadStage("stage").notNull().default("found"),
  websiteState: websiteState("website_state").notNull(),
  websiteUrl: text("website_url"),
  /** What's wrong or missing: the hook for the pitch. */
  problem: text("problem"),
  channel: contactChannel("channel"),
  /** Email address, handle, or phone number, depending on the channel. */
  contact: text("contact"),
  /** Slug under /demo once a concept site exists. */
  demoSlug: text("demo_slug"),
  /** Where the lead was found, one URL per line. */
  sources: text("sources"),
  notes: text("notes"),
  contactedOn: date("contacted_on"),
  nextActionOn: date("next_action_on"),
  ...timestamps,
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").references(() => leads.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  domain: text("domain"),
  status: clientStatus("status").notNull().default("active"),
  /** HKD, whole dollars. */
  setupFee: integer("setup_fee").notNull().default(0),
  monthlyFee: integer("monthly_fee").notNull().default(0),
  startedOn: date("started_on"),
  notes: text("notes"),
  ...timestamps,
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  kind: paymentKind("kind").notNull(),
  /** HKD, whole dollars. */
  amount: integer("amount").notNull(),
  paidOn: date("paid_on").notNull(),
  note: text("note"),
  createdAt: timestamps.createdAt,
});

export const leadsRelations = relations(leads, ({ many }) => ({ clients: many(clients) }));
export const clientsRelations = relations(clients, ({ one, many }) => ({
  lead: one(leads, { fields: [clients.leadId], references: [leads.id] }),
  payments: many(payments),
}));
export const paymentsRelations = relations(payments, ({ one }) => ({
  client: one(clients, { fields: [payments.clientId], references: [clients.id] }),
}));

export type Lead = typeof leads.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type Payment = typeof payments.$inferSelect;
