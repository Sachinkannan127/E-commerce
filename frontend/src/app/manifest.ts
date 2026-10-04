import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ShopVerse - India's Premier Multi-Vendor E-Commerce Platform",
    short_name: "ShopVerse",
    description: "Shop electronics, fashion, beauty, home essentials with express delivery, daily lucky spins, and social reselling.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#4f46e5",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
