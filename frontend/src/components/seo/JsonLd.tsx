import React from "react";

interface OrganizationJsonLdProps {
  name?: string;
  url?: string;
  logo?: string;
}

export const OrganizationJsonLd: React.FC<OrganizationJsonLdProps> = ({
  name = "ShopVerse",
  url = "https://shopverse.in",
  logo = "https://shopverse.in/logo.png",
}) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    logo,
    sameAs: [
      "https://twitter.com/shopverse",
      "https://instagram.com/shopverse",
      "https://facebook.com/shopverse",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-1800-123-4567",
      contactType: "customer service",
      areaServed: "IN",
      availableLanguage: ["en", "hi"],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

interface ProductJsonLdProps {
  title: string;
  description: string;
  images: string[];
  pricePaise: number;
  brandName?: string;
  sku: string;
  avgRating: number;
  reviewCount: number;
  inStock: boolean;
}

export const ProductJsonLd: React.FC<ProductJsonLdProps> = ({
  title,
  description,
  images,
  pricePaise,
  brandName,
  sku,
  avgRating,
  reviewCount,
  inStock,
}) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    description,
    image: images,
    sku,
    brand: {
      "@type": "Brand",
      name: brandName || "ShopVerse",
    },
    offers: {
      "@type": "Offer",
      url: `https://shopverse.in/products/${sku}`,
      priceCurrency: "INR",
      price: (pricePaise / 100).toFixed(2),
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: avgRating.toString(),
      reviewCount: Math.max(1, reviewCount).toString(),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};
