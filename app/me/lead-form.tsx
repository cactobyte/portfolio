import type { Lead } from "@/lib/db/schema";
import { categoryLabels, channelLabels, stageLabels, websiteLabels } from "@/lib/me/labels";
import { Field, Select, TextArea } from "./fields";

export default function LeadForm({
  lead,
  action,
  submitLabel,
}: {
  lead?: Lead;
  action: (form: FormData) => Promise<void>;
  submitLabel: string;
}) {
  return (
    <form action={action} className="me-form">
      <fieldset>
        <legend>Business</legend>
        <Field label="Name" name="name" defaultValue={lead?.name} required />
        <Field label="Chinese name" name="nameZh" defaultValue={lead?.nameZh} />
        <Select label="Type" name="category" options={categoryLabels} defaultValue={lead?.category ?? "cafe"} />
        <Field label="District" name="district" defaultValue={lead?.district} placeholder="Sham Shui Po" />
      </fieldset>

      <fieldset>
        <legend>Website</legend>
        <Select label="Current site" name="websiteState" options={websiteLabels} defaultValue={lead?.websiteState ?? "none"} />
        <Field label="Current site URL" name="websiteUrl" type="url" defaultValue={lead?.websiteUrl} inputMode="url" />
        <TextArea
          label="What's wrong or missing"
          name="problem"
          defaultValue={lead?.problem}
          hint="The opening line of the pitch. Keep it specific and true."
        />
      </fieldset>

      <fieldset>
        <legend>Outreach</legend>
        <Select label="Stage" name="stage" options={stageLabels} defaultValue={lead?.stage ?? "found"} />
        <Select label="Contact via" name="channel" options={channelLabels} defaultValue={lead?.channel} allowEmpty />
        <Field label="Contact" name="contact" defaultValue={lead?.contact} hint="Email, @handle or phone number." />
        <Field label="Demo slug" name="demoSlug" defaultValue={lead?.demoSlug} hint="Shown at /demo/<slug>." />
        <Field label="Contacted on" name="contactedOn" type="date" defaultValue={lead?.contactedOn} />
        <Field label="Next action on" name="nextActionOn" type="date" defaultValue={lead?.nextActionOn} />
      </fieldset>

      <fieldset>
        <legend>Notes</legend>
        <TextArea label="Sources" name="sources" defaultValue={lead?.sources} hint="Where you found them, one link per line." />
        <TextArea label="Notes" name="notes" defaultValue={lead?.notes} rows={4} />
      </fieldset>

      <div className="me-form-actions">
        <button type="submit" className="me-btn me-btn-primary">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
