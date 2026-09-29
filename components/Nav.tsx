import Link from "next/link";

const links = [
  { href: "/work", label: "work" },
  { href: "/projects", label: "projects" },
  { href: "/writing", label: "writing" },
  { href: "/quotes", label: "quotes" },
  { href: "/contact", label: "contact" },
];

export default function Nav({
  className = "",
  home = false,
}: {
  className?: string;
  home?: boolean;
}) {
  return (
    <nav className={className} aria-label="Primary">
      {home ? (
        <Link className="ink-link nav-home" href="/">
          zai
        </Link>
      ) : null}
      {links.map((l) => (
        <Link key={l.href} className="ink-link" href={l.href}>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
