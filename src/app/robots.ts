import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://framemint.novamintnetworks.in";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard/",
          "/create/",
          "/editor/",
          "/gallery/",
          "/settings/",
          "/video-extract/",
          "/callback/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
