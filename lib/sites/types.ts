/** 0 = Sunday … 6 = Saturday, matching Date#getDay. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface OpeningHours {
  days: Weekday[];
  /** 24h "HH:MM". A close time at or before the open time means the shift runs past midnight. */
  open: string;
  close: string;
}

export interface Business {
  name: string;
  nameZh?: string;
  tagline: string;
  /** One or two sentences, used for the page description and search previews. */
  summary: string;
  address: {
    line: string;
    lineZh?: string;
    district: string;
    /** Overrides the query sent to Google Maps when the written address isn't precise enough. */
    mapQuery?: string;
  };
  /** Digits only, including country code, e.g. "85291234567". */
  phone?: string;
  /** Digits only, including country code. */
  whatsapp?: string;
  email?: string;
  instagram?: string;
  facebook?: string;
  bookingUrl?: string;
  hours: OpeningHours[];
}

export interface PriceItem {
  name: string;
  nameZh?: string;
  description?: string;
  /** HKD. Omit for "ask us" items. */
  price?: number;
  /** Renders as "from HK$…" for services with variable pricing. */
  priceFrom?: boolean;
  /** Free text, e.g. "60 min" or "per night". */
  unit?: string;
}

export interface PriceGroup {
  title: string;
  items: PriceItem[];
}

export type Section =
  | { type: "priceList"; id: string; title: string; intro?: string; groups: PriceGroup[] }
  | { type: "story"; id: string; title: string; paragraphs: string[] }
  | { type: "visit"; id: string; title: string };

export type TypePairing = "signage" | "editorial" | "clinical";

export interface Theme {
  type: TypePairing;
  palette: {
    /** Page background. */
    paper: string;
    /** Raised surfaces such as the hours panel. */
    surface: string;
    /** Body text and the signboard background. */
    ink: string;
    muted: string;
    /** Signboard lettering, primary buttons, prices. */
    accent: string;
    /** Text drawn on top of the accent colour. */
    onAccent: string;
  };
}

/**
 * sample: fictional business used to show the template.
 * demo: unsolicited concept for a real business; carries a disclaimer banner.
 * live: a paying client's site.
 */
export type SiteStatus = "sample" | "demo" | "live";

export type PrimaryAction = "call" | "whatsapp" | "booking";

export interface SiteConfig {
  /** Demo slugs carry a random suffix so they can't be guessed. */
  slug: string;
  status: SiteStatus;
  business: Business;
  theme: Theme;
  primaryAction: PrimaryAction;
  sections: Section[];
}
