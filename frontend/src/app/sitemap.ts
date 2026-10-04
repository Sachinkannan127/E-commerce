import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://shopverse.in";

  const staticRoutes = [
    "",
    "/products",
    "/cart",
    "/checkout",
    "/compare",
    "/spin-and-win",
    "/reseller",
    "/seller/onboarding",
    "/help",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  const categorySlugs = [
    "electronics",
    "fashion",
    "home-kitchen",
    "beauty-care",
    "sports-fitness",
    "grocery-gourmet",
    "books-stationery",
    "toys-baby",
  ];

  const categoryRoutes = categorySlugs.map((slug) => ({
    url: `${baseUrl}/products?category_slug=${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes];
}
