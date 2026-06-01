"use client";

import { Camera } from "lucide-react";
import { useMemo, useState } from "react";

import type { PhotoRecord } from "@/types";

import { PhotoLightbox } from "./photo-lightbox";

type PhotoGalleryProps = {
  photos: PhotoRecord[];
};

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const categories = useMemo(
    () => ["全部", ...Array.from(new Set(photos.map((photo) => photo.metadata.object_type)))],
    [photos],
  );
  const [activeCategory, setActiveCategory] = useState(categories[0] ?? "全部");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const displayed =
    activeCategory === "全部"
      ? photos
      : photos.filter((photo) => photo.metadata.object_type === activeCategory);

  return (
    <div className="archive-gallery">
      <div className="archive-gallery-tabs">
        {categories.map((category) => (
          <button
            className={activeCategory === category ? "active" : ""}
            key={category}
            onClick={() => setActiveCategory(category)}
            type="button"
          >
            {category}
          </button>
        ))}
      </div>
      <div className="archive-gallery-grid">
        {displayed.slice(0, 48).map((photo) => {
          const originalIndex = photos.findIndex((item) => item.id === photo.id);
          return (
            <button
              className="archive-gallery-item"
              key={photo.id}
              onClick={() => setLightboxIndex(originalIndex)}
              type="button"
            >
              <div>
                <Camera size={22} />
                <span>{photo.visibility}</span>
              </div>
              <h3>{photo.metadata.title_zh}</h3>
              <p>{photo.metadata.description}</p>
              <footer>
                <b>{photo.metadata.object_type}</b>
                <em>{photo.rights.institutional_restriction.status}</em>
              </footer>
            </button>
          );
        })}
      </div>
      {lightboxIndex !== null ? (
        <PhotoLightbox
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
          photos={photos}
        />
      ) : null}
    </div>
  );
}
