import type { Metadata } from "next";
import Link from "next/link";
import { leadStages } from "@/lib/db/schema";
import { getOverview } from "@/lib/me/data";
import { formatDate } from "@/lib/me/dates";
import { categoryLabels, hkd, stageLabels } from "@/lib/me/labels";

export const metadata: Metadata = { title: "Overview" };

export default async function Overview() {
  const { byStage, inPlay, mrr, collectedThisMonth, due, today } = await getOverview();

  return (
    <>
      <dl className="me-stats">
        <div>
          <dt>Leads in play</dt>
          <dd>{inPlay}</dd>
        </div>
        <div>
          <dt>Clients won</dt>
          <dd>{byStage.won}</dd>
        </div>
        <div>
          <dt>Monthly recurring</dt>
          <dd>{hkd(mrr)}</dd>
        </div>
        <div>
          <dt>Collected this month</dt>
          <dd>{hkd(collectedThisMonth)}</dd>
        </div>
      </dl>

      <section className="me-section">
        <h2>Pipeline</h2>
        <ol className="me-pipeline">
          {leadStages.map((stage) => (
            <li key={stage} data-stage={stage}>
              <Link href={`/me/leads?stage=${stage}`}>
                <span className="me-pipeline-count">{byStage[stage]}</span>
                <span className="me-pipeline-label">{stageLabels[stage]}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="me-section">
        <h2>Due today</h2>
        {due.length === 0 ? (
          <p className="me-empty">
            Nothing due. Set a next-action date on a lead to see it here.{" "}
            <Link href="/me/leads/new">Add a lead</Link>
          </p>
        ) : (
          <ul className="me-list">
            {due.map((lead) => (
              <li key={lead.id}>
                <Link href={`/me/leads/${lead.id}`} className="me-row">
                  <span className="me-row-title">{lead.name}</span>
                  <span className="me-row-meta">
                    {categoryLabels[lead.category]} · {stageLabels[lead.stage]}
                  </span>
                  <span className="me-row-side" data-overdue={lead.nextActionOn! < today || undefined}>
                    {formatDate(lead.nextActionOn)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
