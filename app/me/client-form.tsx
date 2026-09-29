import type { Client } from "@/lib/db/schema";
import { clientStatusLabels } from "@/lib/me/labels";
import { standardPricing } from "@/lib/me/pricing";
import { Field, Select, TextArea } from "./fields";

export default function ClientForm({
  client,
  action,
  submitLabel,
}: {
  client?: Client;
  action: (form: FormData) => Promise<void>;
  submitLabel: string;
}) {
  return (
    <form action={action} className="me-form">
      <fieldset>
        <legend>Client</legend>
        <Field label="Name" name="name" defaultValue={client?.name} required />
        <Field label="Domain" name="domain" defaultValue={client?.domain} placeholder="example.hk" />
        <Select label="Status" name="status" options={clientStatusLabels} defaultValue={client?.status ?? "active"} />
        <Field label="Started on" name="startedOn" type="date" defaultValue={client?.startedOn} />
      </fieldset>
      <fieldset>
        <legend>Pricing (HK$)</legend>
        <Field label="Setup fee" name="setupFee" type="number" inputMode="numeric" defaultValue={client?.setupFee ?? standardPricing.setupFee} />
        <Field label="Monthly fee" name="monthlyFee" type="number" inputMode="numeric" defaultValue={client?.monthlyFee ?? standardPricing.monthlyFee} />
      </fieldset>
      <fieldset>
        <legend>Notes</legend>
        <TextArea label="Notes" name="notes" defaultValue={client?.notes} rows={4} />
      </fieldset>
      <div className="me-form-actions">
        <button type="submit" className="me-btn me-btn-primary">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
