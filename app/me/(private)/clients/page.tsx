import type { Metadata } from "next";
import Link from "next/link";
import { listClients } from "@/lib/me/data";
import { clientStatusLabels, hkd } from "@/lib/me/labels";

export const metadata: Metadata = { title: "Clients" };

export default async function Clients() {
  const rows = await listClients();

  return (
    <>
      <div className="me-page-head">
        <h1>Clients</h1>
        <Link href="/me/clients/new" className="me-btn me-btn-primary">
          Add client
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="me-empty">
          No clients yet. Won leads become clients from the lead page, or{" "}
          <Link href="/me/clients/new">add one directly</Link>.
        </p>
      ) : (
        <ul className="me-list">
          {rows.map(({ client, paid }) => (
            <li key={client.id}>
              <Link href={`/me/clients/${client.id}`} className="me-row">
                <span className="me-row-title">{client.name}</span>
                <span className="me-row-meta">
                  {[client.domain, `${hkd(client.monthlyFee)}/mo`].filter(Boolean).join(" · ")}
                </span>
                <span className="me-row-side">
                  <span className="me-badge" data-status={client.status}>
                    {clientStatusLabels[client.status]}
                  </span>
                  <span>{hkd(paid)} paid</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
