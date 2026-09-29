import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "s4.anilist.co" }, // anime / manga (AniList)
      { protocol: "https", hostname: "covers.openlibrary.org" }, // books
      { protocol: "https", hostname: "**.us.archive.org" }, // books (openlibrary redirects here)
      { protocol: "https", hostname: "image.tmdb.org" }, // movies (TMDB)
      { protocol: "https", hostname: "i.scdn.co" }, // spotify thumbnails
      { protocol: "https", hostname: "mosaic.scdn.co" }, // spotify playlist mosaics
      { protocol: "https", hostname: "**.spotifycdn.com" }, // spotify (newer CDN)
    ],
  },
};

export default nextConfig;
