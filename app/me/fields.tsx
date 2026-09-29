/** Small form primitives shared by the lead and client forms. */

export function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required,
  placeholder,
  hint,
  inputMode,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: "text" | "date" | "number" | "url" | "email";
  required?: boolean;
  placeholder?: string;
  hint?: string;
  inputMode?: "numeric" | "text" | "email" | "url" | "tel";
}) {
  return (
    <label className="me-field">
      <span className="me-field-label">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        required={required}
        placeholder={placeholder}
        inputMode={inputMode}
        min={type === "number" ? 0 : undefined}
      />
      {hint && <span className="me-field-hint">{hint}</span>}
    </label>
  );
}

export function TextArea({
  label,
  name,
  defaultValue,
  rows = 3,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  rows?: number;
  hint?: string;
}) {
  return (
    <label className="me-field me-field-wide">
      <span className="me-field-label">{label}</span>
      <textarea name={name} rows={rows} defaultValue={defaultValue ?? ""} />
      {hint && <span className="me-field-hint">{hint}</span>}
    </label>
  );
}

export function Select<T extends string>({
  label,
  name,
  options,
  defaultValue,
  allowEmpty,
}: {
  label: string;
  name: string;
  options: Record<T, string>;
  defaultValue?: T | null;
  allowEmpty?: boolean;
}) {
  return (
    <label className="me-field">
      <span className="me-field-label">{label}</span>
      <select name={name} defaultValue={defaultValue ?? ""}>
        {allowEmpty && <option value="">Not set</option>}
        {(Object.entries(options) as [T, string][]).map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}
