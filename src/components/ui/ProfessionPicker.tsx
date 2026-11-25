"use client";

import { useId, useMemo, useRef, useState } from "react";
import { useT } from "@/i18n/client";
import { professionName, searchProfessions } from "@/config/professions";

/** Searchable dropdown of professions (works in English and Hindi, plus aliases like "vakil"). */
export function ProfessionPicker({
  id,
  value,
  onChange,
  invalid,
}: {
  id: string;
  value: string;
  onChange: (id: string) => void;
  invalid?: boolean;
}) {
  const { t, lang } = useT();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => searchProfessions(query, lang).slice(0, 50), [query, lang]);

  function choose(pid: string) {
    onChange(pid);
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-invalid={invalid}
        autoComplete="off"
        className="input"
        placeholder={value ? professionName(value, lang) : t.onboarding.professionPlaceholder}
        value={open ? query : value ? professionName(value, lang) : ""}
        onFocus={() => {
          setOpen(true);
          setActive(0);
        }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => Math.min(a + 1, results.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, 0));
          } else if (e.key === "Enter" && open && results[active]) {
            e.preventDefault();
            choose(results[active].id);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-line bg-white py-1 shadow-lg"
        >
          {results.map((p, i) => (
            <li
              key={p.id}
              role="option"
              aria-selected={p.id === value}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(p.id)}
              className={`cursor-pointer px-4 py-2.5 ${i === active ? "bg-brand-50" : ""} ${
                p.id === value ? "font-semibold text-brand-700" : ""
              }`}
            >
              {p.names[lang]}
            </li>
          ))}
          <li className="px-4 py-2 text-xs text-muted">{t.onboarding.noProfession}</li>
        </ul>
      )}
    </div>
  );
}
