// The page designs a professional can choose from.
// Each one is a component in src/components/templates/.
export const TEMPLATE_IDS = ["classic", "friendly", "gallery", "bold"] as const;
export type TemplateId = (typeof TEMPLATE_IDS)[number];

export function isTemplateId(v: unknown): v is TemplateId {
  return typeof v === "string" && (TEMPLATE_IDS as readonly string[]).includes(v);
}
