import { socials } from "@/content/socials";

// "find me" links for the hello post. Socials come from content/socials.ts so
// they always match the rest of the site; the resume PDF is added in front.
const links = [
  { label: "resume", href: "/abdullah-khan-resume.pdf" },
  ...socials,
];

export default function FindMe() {
  return (
    <ul className="find-me">
      {links.map((l) => {
        const newTab = l.href.startsWith("http") || l.href.endsWith(".pdf");
        return (
          <li key={l.label}>
            <a
              href={l.href}
              {...(newTab
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {l.label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
