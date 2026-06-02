"use client";

import maplibregl, {
  type ExpressionSpecification,
  type GeoJSONSource,
  type Map as MapLibreMap,
  type StyleSpecification,
} from "maplibre-gl";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { getMuseumMapData, getTypeColor } from "@/lib/museums";
import type { MuseumGeoJSON, MuseumMapRecord } from "@/lib/museums";
import type { MuseumRecord } from "@/types";

type ArchiveMapViewProps = {
  museums?: MuseumRecord[];
};

type MapFilters = {
  province: string;
  city: string;
  classification: string;
  tag: string;
};

const EMPTY_FILTERS: MapFilters = {
  province: "all",
  city: "all",
  classification: "all",
  tag: "all",
};

const OSM_RASTER_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [
    {
      id: "osm",
      type: "raster",
      source: "osm",
    },
  ],
};

function recordMatchesFilters(record: MuseumMapRecord, filters: MapFilters) {
  return (
    (filters.province === "all" || record.province === filters.province) &&
    (filters.city === "all" || record.city === filters.city) &&
    (filters.classification === "all" || record.classification === filters.classification) &&
    (filters.tag === "all" || record.tags.includes(filters.tag))
  );
}

function hasRenderableCoordinates(record: MuseumMapRecord) {
  return (
    typeof record.latitude === "number" &&
    Number.isFinite(record.latitude) &&
    typeof record.longitude === "number" &&
    Number.isFinite(record.longitude) &&
    record.verification_status !== "pending_verification"
  );
}

function recordsToGeoJSON(records: MuseumMapRecord[]): MuseumGeoJSON {
  return {
    type: "FeatureCollection",
    features: records.filter(hasRenderableCoordinates).map((record) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [record.longitude as number, record.latitude as number],
      },
      properties: {
        id: record.id,
        name_zh: record.name_zh,
        name_en: record.name_en,
        province: record.province,
        city: record.city,
        classification: record.classification,
        classification_nature: record.classification_nature,
        latitude: record.latitude as number,
        longitude: record.longitude as number,
        coordinate_system: record.coordinate_system,
        verification_status: record.verification_status,
        tags: record.tags,
        address: record.address,
      },
    })),
  };
}

function getClassificationColorExpression(classifications: string[]): ExpressionSpecification {
  return [
    "match",
    ["get", "classification"],
    ...classifications.flatMap((classification) => [classification, getTypeColor(classification)]),
    "#78716c",
  ] as unknown as ExpressionSpecification;
}

function optionLabel(value: string) {
  return value === "all" ? "全部" : value;
}

export function ArchiveMapView({ museums }: ArchiveMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const latestGeoJSONRef = useRef<MuseumGeoJSON>(getMuseumMapData(museums).geojson);
  const [filters, setFilters] = useState<MapFilters>(EMPTY_FILTERS);

  const mapData = useMemo(() => getMuseumMapData(museums), [museums]);
  const filteredRecords = useMemo(
    () => mapData.records.filter((record) => recordMatchesFilters(record, filters)),
    [filters, mapData.records],
  );
  const filteredGeoJSON = useMemo(() => recordsToGeoJSON(filteredRecords), [filteredRecords]);
  const filteredPendingRecords = useMemo(
    () => filteredRecords.filter((record) => !hasRenderableCoordinates(record)),
    [filteredRecords],
  );

  useEffect(() => {
    latestGeoJSONRef.current = filteredGeoJSON;
  }, [filteredGeoJSON]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: OSM_RASTER_STYLE,
      center: [104.1954, 35.8617],
      zoom: 3.2,
      minZoom: 2.4,
      maxZoom: 14,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
    map.addControl(
      new maplibregl.AttributionControl({
        compact: true,
        customAttribution: "MapLibre GL JS",
      }),
      "bottom-right",
    );

    map.on("load", () => {
      map.addSource("museums", {
        type: "geojson",
        data: latestGeoJSONRef.current,
        cluster: true,
        clusterMaxZoom: 9,
        clusterRadius: 44,
      });

      map.addLayer({
        id: "museum-clusters",
        type: "circle",
        source: "museums",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#8b1a1a",
          "circle-radius": ["step", ["get", "point_count"], 20, 8, 26, 18, 34],
          "circle-opacity": 0.86,
          "circle-stroke-width": 3,
          "circle-stroke-color": "#fdfcf8",
        },
      });

      map.addLayer({
        id: "museum-points",
        type: "circle",
        source: "museums",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": getClassificationColorExpression(mapData.filterOptions.classifications),
          "circle-radius": 8,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
          "circle-opacity": 0.94,
        },
      });

      map.on("click", "museum-clusters", async (event) => {
        const feature = map.queryRenderedFeatures(event.point, { layers: ["museum-clusters"] })[0];
        const clusterId = feature?.properties?.cluster_id;
        const source = map.getSource("museums") as GeoJSONSource | undefined;
        if (!feature.geometry || feature.geometry.type !== "Point" || !source || clusterId == null) {
          return;
        }

        const zoom = await source.getClusterExpansionZoom(clusterId);
        map.easeTo({ center: feature.geometry.coordinates as [number, number], zoom });
      });

      map.on("click", "museum-points", (event) => {
        const feature = event.features?.[0];
        if (!feature?.properties || !feature.geometry || feature.geometry.type !== "Point") return;

        const props = feature.properties as MuseumGeoJSON["features"][number]["properties"];
        const coordinates = feature.geometry.coordinates as [number, number];
        const popupHtml = `
          <div class="archive-maplibre-popup">
            <span>${props.verification_status}</span>
            <h3>${props.name_zh}</h3>
            <p>${props.name_en ?? ""}</p>
            <dl>
              <div><dt>城市</dt><dd>${props.province} / ${props.city}</dd></div>
              <div><dt>空间类型</dt><dd>${props.classification}</dd></div>
              <div><dt>坐标状态</dt><dd>${props.coordinate_system} · ${props.verification_status}</dd></div>
            </dl>
            <a href="/museums/${props.id}">进入详情页</a>
          </div>
        `;

        new maplibregl.Popup({ closeButton: true, maxWidth: "320px", offset: 14 })
          .setLngLat(coordinates)
          .setHTML(popupHtml)
          .addTo(map);
      });

      map.on("mouseenter", "museum-points", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "museum-points", () => {
        map.getCanvas().style.cursor = "";
      });
      map.on("mouseenter", "museum-clusters", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "museum-clusters", () => {
        map.getCanvas().style.cursor = "";
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [mapData.filterOptions.classifications]);

  useEffect(() => {
    const source = mapRef.current?.getSource("museums") as GeoJSONSource | undefined;
    if (source) {
      source.setData(filteredGeoJSON);
    }
  }, [filteredGeoJSON]);

  const updateFilter = (key: keyof MapFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  return (
    <section className="archive-maplibre-module" aria-label="GIS map module">
      <aside className="archive-maplibre-filters" aria-label="Map filters">
        <div>
          <span>GIS FILTERS</span>
          <h3>筛选点位</h3>
        </div>
        {(
          [
            ["province", "省份", mapData.filterOptions.provinces],
            ["city", "城市", mapData.filterOptions.cities],
            ["classification", "空间类型", mapData.filterOptions.classifications],
            ["tag", "技术遗产标签", mapData.filterOptions.tags],
          ] as const
        ).map(([key, label, options]) => (
          <label key={key}>
            {label}
            <select value={filters[key]} onChange={(event) => updateFilter(key, event.target.value)}>
              <option value="all">{optionLabel("all")}</option>
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ))}
        <button type="button" onClick={() => setFilters(EMPTY_FILTERS)}>
          重置筛选
        </button>
        <p>
          {filteredGeoJSON.features.length} 个已核验点位 / {filteredPendingRecords.length} 个坐标待核验
        </p>
      </aside>

      <div className="archive-maplibre-canvas-panel">
        <div className="archive-maplibre-canvas" ref={mapContainerRef} />
        {!filteredGeoJSON.features.length ? (
          <div className="archive-maplibre-empty">
            <b>暂无可渲染点位</b>
            <span>当前筛选结果中的展馆坐标为空或坐标状态为 pending_verification。</span>
          </div>
        ) : null}
      </div>

      <aside className="archive-maplibre-list" aria-label="Filtered museum list">
        <div className="archive-maplibre-list-heading">
          <span>RESULTS</span>
          <b>{filteredRecords.length}</b>
        </div>
        {filteredRecords.map((record) => (
          <article key={record.id}>
            <div>
              <h3>{record.name_zh}</h3>
              <small>{record.name_en}</small>
            </div>
            <p>{record.province} / {record.city}</p>
            <footer>
              <span>{record.classification}</span>
              <span>{record.coordinate_system}</span>
              <strong className={hasRenderableCoordinates(record) ? "verified" : undefined}>
                {hasRenderableCoordinates(record) ? record.verification_status : "坐标待核验"}
              </strong>
            </footer>
            <Link href={`/museums/${record.id}`}>进入详情页</Link>
          </article>
        ))}
      </aside>
    </section>
  );
}
