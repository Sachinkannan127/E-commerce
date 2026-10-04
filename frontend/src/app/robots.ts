import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/admin/*",
        "/seller/",
        "/seller/*",
        "/account/",
        "/account/*",
        "/checkout",
        "/order-success/",
        "/api/",
      ],
    },
    sitemap: "https://shopverse.in/sitemap.xml",
  };
}
