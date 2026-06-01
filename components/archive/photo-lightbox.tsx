"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect } from "react";

import type { PhotoRecord } from "@/types";

type PhotoLightboxProps = {
  photos: PhotoRecord[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

export function PhotoLightbox({
  photos,
  currentIndex,
  onClose,
  onNavigate,
}: PhotoLightboxProps) {
  const photo = photos[currentIndex];

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && currentIndex > 0) onNavigate(currentIndex - 1);
      if (event.key === "ArrowRight" && currentIndex < photos.length - 1) {
        onNavigate(currentIndex + 1);
      }
    },
    [currentIndex, onClose, onNavigate, photos.length],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  if (!photo) return null;

  return (
    <div className="archive-lightbox" onClick={onClose}>
      <button aria-label="Close photo preview" className="archive-lightbox-close" onClick={onClose}>
        <X size={24} />
      </button>
      {currentIndex > 0 ? (
        <button
          aria-label="Previous photo"
          className="archive-lightbox-nav previous"
          onClick={(event) => {
            event.stopPropagation();
            onNavigate(currentIndex - 1);
          }}
        >
          <ChevronLeft size={30} />
        </button>
      ) : null}
      <article className="archive-lightbox-panel" onClick={(event) => event.stopPropagation()}>
        <div className="archive-lightbox-image">
          <span>{photo.metadata.object_type}</span>
          <h2>{photo.metadata.title_zh}</h2>
        </div>
        <p>{photo.metadata.description}</p>
        <footer>
          {photo.visibility} · {photo.rights.institutional_restriction.status} ·{" "}
          {currentIndex + 1} / {photos.length}
        </footer>
      </article>
      {currentIndex < photos.length - 1 ? (
        <button
          aria-label="Next photo"
          className="archive-lightbox-nav next"
          onClick={(event) => {
            event.stopPropagation();
            onNavigate(currentIndex + 1);
          }}
        >
          <ChevronRight size={30} />
        </button>
      ) : null}
    </div>
  );
}
