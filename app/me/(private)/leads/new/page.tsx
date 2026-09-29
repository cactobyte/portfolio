import type { Metadata } from "next";
import Link from "next/link";
import { createLead } from "../../../actions";
import LeadForm from "../../../lead-form";

export const metadata: Metadata = { title: "Add lead" };

export default function NewLead() {
  return (
    <>
      <Link href="/me/leads" className="me-back">
        Leads
      </Link>
      <h1>Add lead</h1>
      <LeadForm action={createLead} submitLabel="Add lead" />
    </>
  );
}
