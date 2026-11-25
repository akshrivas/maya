import Link from "next/link";

/** Renders "I agree to the {terms} and {privacy}" with the placeholders turned into links. */
export function LinkedText({ text, links }: { text: string; links: Record<string, { href: string; label: string }> }) {
  const parts = text.split(/(\{\w+\})/g);
  return (
    <>
      {parts.map((part, i) => {
        const key = part.match(/^\{(\w+)\}$/)?.[1];
        const link = key ? links[key] : undefined;
        return link ? (
          <Link key={i} href={link.href} target="_blank" className="font-medium underline">
            {link.label}
          </Link>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </>
  );
}
