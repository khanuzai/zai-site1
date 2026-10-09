"use client";

import { useEffect, useState } from "react";

// Shows a small line only on October 8 in Toronto. The date is read in the
// browser (not at build time), so it works on the statically generated page:
// SSR and first render show nothing, then the effect reveals it if it's the day.
export default function BirthdayNote() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Toronto",
      month: "numeric",
      day: "numeric",
    }).formatToParts(new Date());
    const month = parts.find((p) => p.type === "month")?.value;
    const day = parts.find((p) => p.type === "day")?.value;
    const isBirthday = month === "10" && day === "8";

    // dev-only: ?birthday=1 pretends it's October 8 for testing the layout.
    const forced =
      process.env.NODE_ENV !== "production" &&
      new URLSearchParams(window.location.search).get("birthday") === "1";

    if (isBirthday || forced) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShow(true);
    }
  }, []);

  if (!show) return null;
  return <p className="home-birthday">{"it's my birthday today."}</p>;
}
