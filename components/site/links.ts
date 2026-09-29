import type { Business } from "@/lib/sites/types";

export function mapQuery(business: Business): string {
  const { address, name } = business;
  return address.mapQuery ?? `${name}, ${address.line}, ${address.district}, Hong Kong`;
}

export const directionsUrl = (business: Business) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery(business))}`;

export const mapEmbedUrl = (business: Business) =>
  `https://www.google.com/maps?q=${encodeURIComponent(mapQuery(business))}&output=embed`;

export const telUrl = (digits: string) => `tel:+${digits}`;
export const whatsappUrl = (digits: string) => `https://wa.me/${digits}`;

/** "85291234567" → "+852 9123 4567" */
export function formatPhone(digits: string): string {
  if (digits.startsWith("852") && digits.length === 11) {
    return `+852 ${digits.slice(3, 7)} ${digits.slice(7)}`;
  }
  return `+${digits}`;
}

export function formatPrice(price: number, from = false): string {
  return `${from ? "from " : ""}HK$${price.toLocaleString("en-HK")}`;
}
