import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Deploy Eye",
    short_name: "Deploy Eye",
    description: "Latest production deployments across Railway and Vercel accounts.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f4f2ed",
    theme_color: "#0f766e",
    categories: ["developer", "productivity", "utilities"],
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
