import Image from "next/image";
import type { ResolvedItem, ResolvedPlaylist } from "@/lib/shelf";

const IMG_SIZES = "(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 200px";

function CoverArt({ title, cover }: { title: string; cover: string | null }) {
  if (cover) {
    // unoptimized: the browser loads the cover directly and follows redirects
    // (Open Library covers 302 to the Internet Archive), so nothing looks broken.
    return (
      <Image
        src={cover}
        alt=""
        fill
        sizes={IMG_SIZES}
        className="cover-img"
        unoptimized
      />
    );
  }
  return <div className="cover-ph">{title}</div>;
}

function Caption({
  title,
  year,
  note,
}: {
  title: string;
  year?: number;
  note?: string;
}) {
  return (
    <figcaption className="shelf-cap">
      <span className="shelf-cap-title">{title}</span>
      {year ? <span className="shelf-cap-note">{year}</span> : null}
      {note ? <span className="shelf-cap-note">{note}</span> : null}
    </figcaption>
  );
}

// A cover (anime/book/movie). `showYear` adds the year under the title (used on
// the full section pages; the /shelf previews show just title + note).
export function CoverCell({
  item,
  showYear = false,
}: {
  item: ResolvedItem;
  showYear?: boolean;
}) {
  return (
    <figure className="shelf-cell">
      <div className="cover-frame" tabIndex={0}>
        <CoverArt title={item.title} cover={item.cover} />
      </div>
      <Caption
        title={item.title}
        year={showYear ? item.year : undefined}
        note={item.note}
      />
    </figure>
  );
}

// A playlist tile — square cover that links out to Spotify.
export function PlaylistCell({ item }: { item: ResolvedPlaylist }) {
  return (
    <figure className="shelf-cell">
      <a className="cover-a" href={item.href} target="_blank" rel="noreferrer">
        <div className="cover-frame cover-frame--square">
          <CoverArt title={item.title} cover={item.cover} />
        </div>
      </a>
      <Caption title={item.title} />
    </figure>
  );
}
