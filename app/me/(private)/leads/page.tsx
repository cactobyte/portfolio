import type { Metadata } from "next";
import Link from "next/link";
import { leadStages } from "@/lib/db/schema";
import { listLeads, type LeadStage } from "@/lib/me/data";
import { formatDate } from "@/lib/me/dates";
import { categoryLabels, stageLabels, websiteLabels } from "@/lib/me/labels";

export const metadata: Metadata = { title: "Leads" };

export default async function Leads({ searchParams }: PageProps<"/me/leads">) {
  const { stage: rawStage } = await searchParams;
  const stage = leadStages.find((s) => s === rawStage) as LeadStage | undefined;
  const leads = await listLeads(stage);

  return (
    <>
      <div className="me-page-head">
        <h1>Leads</h1>
        <Link href="/me/leads/new" className="me-btn me-btn-primary">
          Add lead
        </Link>
      </div>

      <nav className="me-filters" aria-label="Filter by stage">
        <Link href="/me/leads" aria-current={!stage ? "page" : undefined}>
          All
        </Link>
        {leadStages.map((s) => (
          <Link key={s} href={`/me/leads?stage=${s}`} aria-current={stage === s ? "page" : undefined}>
            {stageLabels[s]}
          </Link>
        ))}
      </nav>

      {leads.length === 0 ? (
        <p className="me-empty">
          {stage ? `No leads at "${stageLabels[stage]}".` : "No leads yet."}{" "}
          <Link href="/me/leads/new">Add a lead</Link>
        </p>
      ) : (
        <ul className="me-list">
          {leads.map((lead) => (
            <li key={lead.id}>
              <Link href={`/me/leads/${lead.id}`} className="me-row">
                <span className="me-row-title">
                  {lead.name}
                  {lead.nameZh && <span lang="zh-Hant"> {lead.nameZh}</span>}
                </span>
                <span className="me-row-meta">
                  {[categoryLabels[lead.category], lead.district, websiteLabels[lead.websiteState]]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
                {lead.problem && <span className="me-row-body">{lead.problem}</span>}
                <span className="me-row-side">
                  <span className="me-badge" data-stage={lead.stage}>
                    {stageLabels[lead.stage]}
                  </span>
                  {lead.nextActionOn && lead.stage !== "won" && lead.stage !== "lost" && (
                    <span>Next {formatDate(lead.nextActionOn)}</span>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
