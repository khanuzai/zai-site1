import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import StatsEasterEgg from "@/components/StatsEasterEgg";
import { socials } from "@/content/socials";

export const metadata: Metadata = {
  title: "contact — abdullah khan",
};

const email = socials.find((s) => s.label === "email");

export default function ContactPage() {
  return (
    <PageShell title="contact">
      <p className="contact-lead">
        Reach me by email, or find me on the usual places.
      </p>

      {email ? (
        <p className="contact-email">
          <a className="ink-link" href={email.href}>
            {email.href.replace(/^mailto:/, "")}
          </a>
        </p>
      ) : null}

      <ul className="contact-socials">
        {socials
          .filter((s) => s.label !== "email")
          .map((s) => (
            <li key={s.label}>
              <a
                className="ink-link ink-link-muted"
                href={s.href}
                target="_blank"
                rel="noreferrer"
              >
                {s.label}
              </a>
            </li>
          ))}
      </ul>

      {/* TODO: simple contact form wired to Resend (later, per CLAUDE.md). */}

      <StatsEasterEgg />
    </PageShell>
  );
}
