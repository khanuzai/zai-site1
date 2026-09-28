import InkPanels from "@/components/InkPanels";
import Nav from "@/components/Nav";
import { socials } from "@/content/socials";

export default function Home() {
  return (
    <main className="home">
      <Nav className="home-nav" />

      <div className="home-hero">
        <h1>
          abdullah
          <br />
          khan
        </h1>
        <span className="home-ur" lang="ur" dir="rtl">
          عبداللہ خان
        </span>
        <p>
          builds things that feel like something.
          <br />
          cs at uwaterloo, bba at laurier.
        </p>
      </div>

      {/* Manga panels canvas — sits behind the content on desktop, becomes a
          banner under the text below 1024px. */}
      <div className="ink-panels">
        <InkPanels />
      </div>

      <nav className="home-social" aria-label="Social">
        {socials.map((s) => (
          <a key={s.label} className="ink-link ink-link-muted" href={s.href}>
            {s.label}
          </a>
        ))}
      </nav>
    </main>
  );
}
