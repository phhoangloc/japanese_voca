import { forwardRef } from "react";

interface FieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, error, hint, className, id, ...rest },
  ref,
) {
  const fieldId = id ?? `f-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div>
      <label htmlFor={fieldId} className="label">
        {label}
      </label>
      <input
        ref={ref}
        id={fieldId}
        className={[
          "input",
          error && "input-error",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-invalid={!!error}
        {...rest}
      />
      {hint && !error && (
        <p className="mt-1 text-xs text-ink-faint">{hint}</p>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});

interface SelectFieldProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

export function SelectField({
  label,
  error,
  className,
  id,
  children,
  ...rest
}: SelectFieldProps) {
  const fieldId = id ?? `f-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div>
      <label htmlFor={fieldId} className="label">
        {label}
      </label>
      <select
        id={fieldId}
        className={["input", error && "input-error", className]
          .filter(Boolean)
          .join(" ")}
        aria-invalid={!!error}
        {...rest}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
