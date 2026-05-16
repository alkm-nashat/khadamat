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
  const categories = await prisma.serviceCategory.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  });

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${BASE_URL}/categories/${cat.slug}`,
    lastModified: cat.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  // ── الخدمات النشطة ────────────────────────────────────────────
  const services = await prisma.service.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 1000, // حد أقصى للخريطة
  });

  const servicePages: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${BASE_URL}/services/${s.id}`,
    lastModified: s.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...servicePages];
}
