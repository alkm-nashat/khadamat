import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3002";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/services/", "/categories/"],
        disallow: [
          "/api/",
          "/admin/",
          "/bookings/",
          "/profile/",
          "/dashboard/",
          "/services/add",
          "/services/edit/",
          "/_next/",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
