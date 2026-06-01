import { MapPin, Tag } from "lucide-react";

import type { MuseumRecord } from "@/types";

type MuseumCardProps = {
  museum: MuseumRecord;
};

export function MuseumCard({ museum }: MuseumCardProps) {
  return (
    <article className="archive-museum-card">
      <div className="archive-museum-card-banner">
        <span>{museum.name}</span>
      </div>
      <div className="archive-museum-card-body">
        <h3>{museum.name}</h3>
        <p className="archive-museum-card-meta">
          <MapPin size={14} />
          {museum.province} · {museum.city} · {museum.nature}
        </p>
        <p>{museum.description}</p>
        <div className="archive-tag-row">
          {museum.tags.slice(0, 4).map((tag) => (
            <span key={tag}>
              <Tag size={12} />
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
