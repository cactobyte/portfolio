import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { paymentKinds } from "@/lib/db/schema";
import { getClient } from "@/lib/me/data";
import { formatDate, hkToday } from "@/lib/me/dates";
import { hkd, paymentKindLabels } from "@/lib/me/labels";
import { deletePayment, recordPayment, updateClient } from "../../../actions";
import ClientForm from "../../../client-form";
import ConfirmButton from "../../../confirm-button";
import { Field, Select } from "../../../fields";

export const metadata: Metadata = { title: "Client" };

export default async function ClientPage({ params, searchParams }: PageProps<"/me/clients/[id]">) {
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  const clientId = Number(id);
  if (!Number.isInteger(clientId) || clientId <= 0) notFound();
  const result = await getClient(clientId);
  if (!result) notFound();
  const { client, payments } = result;
  const total = payments.reduce((n, p) => n + p.amount, 0);
  const kindOptions = Object.fromEntries(paymentKinds.map((k) => [k, paymentKindLabels[k]])) as typeof paymentKindLabels;

  return (
    <>
      <Link href="/me/clients" className="me-back">
        Clients
      </Link>
      <div className="me-page-head">
        <h1>{client.name}</h1>
        {client.leadId && (
          <Link href={`/me/leads/${client.leadId}`} className="me-btn">
            View lead
          </Link>
        )}
      </div>
      {saved && <p className="me-notice">Saved.</p>}

      <section className="me-section">
        <h2>Payments · {hkd(total)}</h2>
        {payments.length === 0 ? (
          <p className="me-empty">No payments recorded yet.</p>
        ) : (
          <ul className="me-list">
            {payments.map((payment) => (
              <li key={payment.id} className="me-row me-row-static">
                <span className="me-row-title">{hkd(payment.amount)}</span>
                <span className="me-row-meta">
                  {[paymentKindLabels[payment.kind], formatDate(payment.paidOn), payment.note].filter(Boolean).join(" · ")}
                </span>
                <form action={deletePayment.bind(null, client.id, payment.id)} className="me-row-side">
                  <ConfirmButton message={`Remove this ${hkd(payment.amount)} payment?`} className="me-link-btn">
                    Remove
                  </ConfirmButton>
                </form>
              </li>
            ))}
          </ul>
        )}

        <form action={recordPayment.bind(null, client.id)} className="me-form me-form-inline">
          <Select label="Type" name="kind" options={kindOptions} defaultValue={payments.length ? "monthly" : "setup"} />
          <Field
            label="Amount (HK$)"
            name="amount"
            type="number"
            inputMode="numeric"
            defaultValue={payments.length ? client.monthlyFee : client.setupFee}
            required
          />
          <Field label="Paid on" name="paidOn" type="date" defaultValue={hkToday()} required />
          <Field label="Note" name="note" />
          <div className="me-form-actions">
            <button type="submit" className="me-btn me-btn-primary">
              Record payment
            </button>
          </div>
        </form>
      </section>

      <section className="me-section">
        <h2>Details</h2>
        <ClientForm client={client} action={updateClient.bind(null, client.id)} submitLabel="Save changes" />
      </section>
    </>
  );
}
