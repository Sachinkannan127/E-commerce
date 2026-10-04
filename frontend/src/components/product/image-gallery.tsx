"use client";

import { useState } from "react";
import Image from "next/image";
import { ProductImage } from "@/types/product";

interface ImageGalleryProps {
  images: ProductImage[];
  title: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });

  const activeImage = images[selectedIdx] || { url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80" };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* Thumbnails list */}
      <div className="flex md:flex-col gap-3 overflow-x-auto no-scrollbar py-1">
        {images.map((img, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setSelectedIdx(idx)}
            className={`relative h-16 w-16 md:h-20 md:w-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
              selectedIdx === idx
                ? "border-primary shadow-md scale-95"
                : "border-transparent opacity-70 hover:opacity-100"
            }`}
          >
            <Image src={img.url} alt={img.alt || title} fill className="object-cover" sizes="80px" />
          </button>
        ))}
      </div>

      {/* Main Image with Zoom Lens */}
      <div
        className="relative flex-1 aspect-square rounded-3xl overflow-hidden bg-muted border cursor-crosshair group"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <Image
          src={activeImage.url}
          alt={activeImage.alt || title}
          fill
          priority
          className={`object-cover transition-transform duration-200 ${
            isZoomed ? "scale-150" : "scale-100"
          }`}
          style={
            isZoomed
              ? {
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                }
              : undefined
          }
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    </div>
  );
}
