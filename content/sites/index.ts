import type { SiteConfig } from "@/lib/sites/types";
import { sampleCafe } from "./sample-cafe";

export const sites: SiteConfig[] = [sampleCafe];

export function getSite(slug: string): SiteConfig | undefined {
  return sites.find((site) => site.slug === slug);
}
