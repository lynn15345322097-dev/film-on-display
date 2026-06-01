import { MapPinned } from "lucide-react";
import type { CSSProperties } from "react";

import { getMuseumMapPoints } from "@/lib/museums";
import type { MuseumRecord } from "@/types";

type ArchiveMapViewProps = {
  museums?: MuseumRecord[];
};

export function ArchiveMapView({ museums }: ArchiveMapViewProps) {
  const points = getMuseumMapPoints(museums);

  return (
    <div className="archive-atlas-map" aria-label="Museum distribution map">
      <div className="archive-atlas-grid" />
      <div className="archive-atlas-compass">
        <MapPinned size={18} />
        GIS POINTS
      </div>
      {points.map((point, index) => (
        <span
          className="archive-atlas-point"
          key={point.id}
          style={{
            "--point-color": point.color,
            left: `${10 + ((point.coordinates[1] - 73) / 63) * 80}%`,
            top: `${12 + ((54 - point.coordinates[0]) / 36) * 76}%`,
            opacity: point.visited ? 1 : 0.44,
            transform: `scale(${index % 5 === 0 ? 1.45 : 1})`,
          } as CSSProperties}
          title={`${point.name}｜${point.province} ${point.city}`}
        />
      ))}
    </div>
  );
}
