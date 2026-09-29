import { z } from "zod";
import {
  clientStatuses,
  contactChannels,
  leadCategories,
  leadStages,
  paymentKinds,
  websiteStates,
} from "@/lib/db/schema";

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

export const leadInput = z.object({
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

export const clientInput = z.object({
  name: z.string().trim().min(1, "Name is required"),
  domain: optionalText,
  status: z.enum(clientStatuses),
  setupFee: money,
  monthlyFee: money,
  startedOn: optionalDate,
  notes: optionalText,
});

export const paymentInput = z.object({
  kind: z.enum(paymentKinds),
  amount: money.refine((n) => n > 0, "Amount must be more than zero"),
  paidOn: z.iso.date(),
  note: optionalText,
});
