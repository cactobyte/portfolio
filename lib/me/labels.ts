import type {
  clientStatuses,
  contactChannels,
  leadCategories,
  leadStages,
  paymentKinds,
  websiteStates,
} from "@/lib/db/schema";

type LabelMap<T extends readonly string[]> = Record<T[number], string>;

export const stageLabels: LabelMap<typeof leadStages> = {
  found: "Found",
  demo_built: "Demo built",
  contacted: "Contacted",
  replied: "Replied",
  won: "Won",
  lost: "Lost",
};

export const categoryLabels: LabelMap<typeof leadCategories> = {
  cafe: "Café",
  restaurant: "Restaurant",
  salon: "Salon",
  clinic: "Clinic",
  stay: "Guesthouse",
  other: "Other",
};

export const websiteLabels: LabelMap<typeof websiteStates> = {
  none: "No website",
  broken: "Broken website",
  outdated: "Outdated website",
  fine: "Website is fine",
};

export const channelLabels: LabelMap<typeof contactChannels> = {
  email: "Email",
  instagram: "Instagram",
  facebook: "Facebook",
  whatsapp: "WhatsApp",
  phone: "Phone",
};

export const clientStatusLabels: LabelMap<typeof clientStatuses> = {
  active: "Active",
  paused: "Paused",
  ended: "Ended",
};

export const paymentKindLabels: LabelMap<typeof paymentKinds> = {
  setup: "Setup fee",
  monthly: "Monthly",
  other: "Other",
};

export function hkd(amount: number): string {
  return `HK$${amount.toLocaleString("en-HK")}`;
}

/** Link that opens the lead's contact channel, when the contact detail allows one. */
export function contactHref(channel: string | null, contact: string | null): string | null {
  if (!channel || !contact) return null;
  const value = contact.trim();
  switch (channel) {
    case "email":
      return `mailto:${value}`;
    case "whatsapp":
      return `https://wa.me/${value.replace(/\D/g, "")}`;
    case "phone":
      return `tel:+${value.replace(/\D/g, "")}`;
    case "instagram":
      return value.startsWith("http") ? value : `https://instagram.com/${value.replace(/^@/, "")}`;
    case "facebook":
      return value.startsWith("http") ? value : `https://facebook.com/${value}`;
    default:
      return null;
  }
}
