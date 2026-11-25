import type { TemplateId } from "@/config/templates";
import type { PageCtx } from "@/components/page/helpers";
import { ClassicTemplate } from "./Classic";
import { FriendlyTemplate } from "./Friendly";
import { GalleryTemplate } from "./Gallery";
import { BoldTemplate } from "./Bold";

export const TEMPLATES: Record<TemplateId, (props: { ctx: PageCtx }) => React.ReactElement> = {
  classic: ClassicTemplate,
  friendly: FriendlyTemplate,
  gallery: GalleryTemplate,
  bold: BoldTemplate,
};

export function ProfilePage({ ctx }: { ctx: PageCtx }) {
  const Template = TEMPLATES[ctx.profile.template] ?? ClassicTemplate;
  return <Template ctx={ctx} />;
}
