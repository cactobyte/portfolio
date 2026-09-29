import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLead } from "@/lib/me/data";
import { channelLabels, contactHref, stageLabels } from "@/lib/me/labels";
import { convertLead, deleteLead, updateLead } from "../../../actions";
import ConfirmButton from "../../../confirm-button";
import LeadForm from "../../../lead-form";

export const metadata: Metadata = { title: "Lead" };

export default async function LeadPage({ params, searchParams }: PageProps<"/me/leads/[id]">) {
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  const leadId = Number(id);
  if (!Number.isInteger(leadId) || leadId <= 0) notFound();
  const result = await getLead(leadId);
  if (!result) notFound();
  const { lead, clientId } = result;
  const contact = contactHref(lead.channel, lead.contact);

  return (
    <>
      <Link href="/me/leads" className="me-back">
        Leads
      </Link>
      <div className="me-page-head">
        <h1>
          {lead.name}
          {lead.nameZh && <span lang="zh-Hant"> {lead.nameZh}</span>}
        </h1>
        <span className="me-badge" data-stage={lead.stage}>
          {stageLabels[lead.stage]}
        </span>
      </div>
      {saved && <p className="me-notice">Saved.</p>}

      <div className="me-quick">
        {contact && lead.channel && (
          <a href={contact} target="_blank" rel="noopener" className="me-btn">
            Open {channelLabels[lead.channel]}
          </a>
        )}
        {lead.demoSlug && (
          <a href={`/demo/${lead.demoSlug}`} target="_blank" rel="noopener" className="me-btn">
            View demo
          </a>
        )}
        {lead.websiteUrl && (
          <a href={lead.websiteUrl} target="_blank" rel="noopener" className="me-btn">
            Current site
          </a>
        )}
        {clientId ? (
          <Link href={`/me/clients/${clientId}`} className="me-btn">
            View client
          </Link>
        ) : (
          (lead.stage === "replied" || lead.stage === "won") && (
            <form action={convertLead.bind(null, lead.id)}>
              <button type="submit" className="me-btn me-btn-primary">
                Mark won and add client
              </button>
            </form>
          )
        )}
      </div>

      <LeadForm lead={lead} action={updateLead.bind(null, lead.id)} submitLabel="Save changes" />

      <form action={deleteLead.bind(null, lead.id)} className="me-danger-zone">
        <ConfirmButton message={`Delete ${lead.name}? This can't be undone.`}>Delete lead</ConfirmButton>
      </form>
    </>
  );
}
