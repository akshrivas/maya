"use client";

import { TEMPLATE_IDS, type TemplateId } from "@/config/templates";
import { useT } from "@/i18n/client";

// Small visual swatch of each design (colours match the real templates).
const SWATCH: Record<TemplateId, { bg: string; band: string; dot: string; line: string }> = {
  classic: { bg: "#faf8f3", band: "#1c2b4a", dot: "#c9a961", line: "#d9d5ca" },
  friendly: { bg: "#fff8f0", band: "linear-gradient(135deg,#ffd6a8,#9fd8d5)", dot: "#ffcf9e", line: "#efe5da" },
  gallery: { bg: "#121212", band: "linear-gradient(180deg,#3a2430,#121212)", dot: "#e9a3b5", line: "#333" },
  bold: { bg: "#fff3b0", band: "#ffd400", dot: "#000", line: "#000" },
};

export function TemplatePicker({ value, onChange }: { value: TemplateId; onChange: (id: TemplateId) => void }) {
  const { t } = useT();
  const names = t.templates as Record<string, string>;
  return (
    <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label={t.dash.secTemplate}>
      {TEMPLATE_IDS.map((id) => {
        const s = SWATCH[id];
        const selected = id === value;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(id)}
            className={`overflow-hidden rounded-2xl border-2 text-left transition ${
              selected ? "border-brand-600 ring-2 ring-brand-100" : "border-line"
            }`}
          >
            <div className="h-28 p-0" style={{ background: s.bg }} aria-hidden>
              <div className="h-8" style={{ background: s.band }} />
              <div className="-mt-4 ml-3 h-8 w-8 rounded-lg border-2 border-white" style={{ background: s.dot }} />
              <div className="mx-3 mt-2 h-2 w-2/3 rounded" style={{ background: s.line }} />
              <div className="mx-3 mt-1.5 grid grid-cols-2 gap-1">
                <div className="h-4 rounded bg-[#1fa855]" />
                <div className="h-4 rounded" style={{ background: id === "gallery" ? "#fff" : s.band.startsWith("linear") ? "#2d7d84" : s.band === "#ffd400" ? "#000" : s.band }} />
              </div>
            </div>
            <div className="bg-white p-3">
              <p className="font-semibold">
                {names[id]} {selected && "✓"}
              </p>
              <p className="text-xs text-muted">{names[`${id}Desc`]}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
