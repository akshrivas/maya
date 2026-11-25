"use client";

import { useT } from "@/i18n/client";
import { errorText } from "@/lib/errors";

/** A labelled form field with optional hint, error and character counter. */
export function Field({
  id,
  label,
  hint,
  error,
  optional,
  count,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  count?: { value: number; max: number };
  children: React.ReactNode;
}) {
  const { t } = useT();
  return (
    <div>
      <label htmlFor={id} className="label flex items-baseline justify-between gap-2">
        <span>
          {label}
          {optional && <span className="ml-1 font-normal text-muted">({t.common.optional})</span>}
        </span>
        {count && (
          <span className={`text-xs font-normal ${count.value > count.max ? "text-red-600" : "text-muted"}`}>
            {count.value}/{count.max}
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {errorText(t, error)}
        </p>
      ) : hint ? (
        <p className="mt-1 text-sm text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
