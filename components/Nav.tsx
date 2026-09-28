import Link from "next/link";

const links = [
  { href: "/work", label: "work" },
  { href: "/projects", label: "projects" },
  { href: "/writing", label: "writing" },
  { href: "/quotes", label: "quotes" },
  { href: "/contact", label: "contact" },
];

export default function Nav({ className = "" }: { className?: string }) {
  return (
    <nav className={className} aria-label="Primary">
      {links.map((l) => (
        <Link key={l.href} className="ink-link" href={l.href}>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
