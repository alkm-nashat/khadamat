import { MetadataRoute } from "next";
import prisma from "@/lib/db";

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3002";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── الصفحات الثابتة ─────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/services`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/categories`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // ── التصنيفات ─────────────────────────────────────────────────
  let categoryPages: MetadataRoute.Sitemap = [];
  let servicePages: MetadataRoute.Sitemap = [];

  try {
    const categories = await prisma.serviceCategory.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });
    categoryPages = categories.map((cat) => ({
      url: `${BASE_URL}/categories/${cat.slug}`,
      lastModified: cat.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.7,
    }));

    const services = await prisma.service.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 1000,
    });
    servicePages = services.map((s) => ({
      url: `${BASE_URL}/services/${s.id}`,
      lastModified: s.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch {
    // DB not available at build time
  }

  return [...staticPages, ...categoryPages, ...servicePages];
}
