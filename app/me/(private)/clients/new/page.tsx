import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "../../../actions";
import ClientForm from "../../../client-form";

export const metadata: Metadata = { title: "Add client" };

export default function NewClient() {
  return (
    <>
      <Link href="/me/clients" className="me-back">
        Clients
      </Link>
      <h1>Add client</h1>
      <ClientForm action={createClient} submitLabel="Add client" />
    </>
  );
}
