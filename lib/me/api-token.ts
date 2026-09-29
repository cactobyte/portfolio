import { createHash, timingSafeEqual } from "node:crypto";

const digest = (value: string) => createHash("sha256").update(value).digest();

/**
 * Checks the bearer token used by the automated lead-finding sessions.
 * Fails closed: with LEADS_API_TOKEN unset, nothing is accepted.
 */
export function isAuthorizedAutomation(request: Request): boolean {
  const expected = process.env.LEADS_API_TOKEN?.trim();
  const header = request.headers.get("authorization") ?? "";
  if (!expected || !header.startsWith("Bearer ")) return false;
  // Hash both sides so the comparison is constant-time regardless of length.
  return timingSafeEqual(digest(header.slice("Bearer ".length).trim()), digest(expected));
}
