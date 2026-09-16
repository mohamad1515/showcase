"use client";

import Image from "next/image";
import { useState } from "react";
import { FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";

type Props = {
  images: string[];
  productName: string;
};

export default function ProductImageGallery({ images, productName }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const displayImages =
    (images ?? []).filter(
      (image): image is string =>
        typeof image === "string" && image.trim().length > 0,
    ).length > 0
      ? (images ?? []).filter(
          (image): image is string =>
            typeof image === "string" && image.trim().length > 0,
        )
      : ["/images/product.png"];
  const currentImage = displayImages[selectedIndex];

  const handlePrevious = () => {
    setSelectedIndex((prev) =>
      prev === 0 ? displayImages.length - 1 : prev - 1,
    );
  };

  const handleNext = () => {
    setSelectedIndex((prev) =>
      prev === displayImages.length - 1 ? 0 : prev + 1,
    );
  };

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    setIsLightboxOpen(true);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Main Image */}
        <div
          className="relative aspect-square overflow-hidden rounded-lg bg-card cursor-pointer"
          onClick={() => openLightbox(selectedIndex)}
        >
          <Image
            src={currentImage}
            alt={productName}
            fill
            priority
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover hover:scale-105 transition-transform duration-300"
          />
          {displayImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-semibold">
              {selectedIndex + 1} / {displayImages.length}
            </div>
          )}
        </div>

        {/* Thumbnail Navigation */}
        {displayImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {displayImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                  selectedIndex === index
                    ? "border-accent"
                    : "border-transparent hover:border-muted"
                }`}
              >
                <Image
                  src={image}
                  alt={`${productName} - صورت ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative max-h-screen max-w-4xl w-full">
            {/* Close Button */}
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-accent transition-colors"
              aria-label="بستن"
            >
              <FiX size={32} />
            </button>

            {/* Image */}
            <div className="relative aspect-square overflow-hidden rounded-lg bg-card">
              <Image
                src={currentImage}
                alt={productName}
                fill
                sizes="(min-width: 1024px) 90vw, 100vw"
                className="object-contain"
                priority
              />
            </div>

            {/* Navigation Buttons */}
            {displayImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
                  aria-label="تصویر قبلی"
                >
                  <FiChevronLeft size={24} />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
                  aria-label="تصویر بعدی"
                >
                  <FiChevronRight size={24} />
                </button>

                {/* Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  {selectedIndex + 1} / {displayImages.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
