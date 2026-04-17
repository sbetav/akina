import type { MetadataRoute } from "next";

const baseUrl = (() => {
  const fallback = "http://localhost:3000";

  try {
    return new URL(process.env.NEXT_PUBLIC_BASE_URL ?? fallback).origin;
  } catch {
    return fallback;
  }
})();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
