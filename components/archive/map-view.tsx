"use client";

import maplibregl, {
  type ExpressionSpecification,
  type GeoJSONSource,
  type Map as MapLibreMap,
  type StyleSpecification,
} from "maplibre-gl";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

// ── Basemap: archival low-saturation style (CARTO light – no commercial POI) ──
const ARCHIVE_BASEMAP_STYLE: StyleSpecification = {
  version: 8,
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  sources: {
    carto: {
      type: "raster",
      tiles: ["https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    },
  },
  layers: [
    {
      id: "carto-light",
      type: "raster",
      source: "carto",
      paint: {
        // further desaturate for a research-archive feel
        "raster-saturation": -0.6,
        "raster-contrast": -0.15,
      },
    },
  ],
};

// ── Classification label map (Chinese display names) ──
const CLASSIFICATION_LABELS: Record<string, string> = {
  "国家级专题博物馆": "综合性电影博物馆",
  "国家": "综合性电影博物馆",
  "省级电影博物馆": "省级电影博物馆",
  "市级电影博物馆": "市级电影博物馆",
  "专题博物馆": "专题博物馆",
  "电影资料馆/影像档案": "影像档案与资料馆空间",
  "档案与学术机构": "影像档案与资料馆空间",
  "电影制片厂/影视基地": "电影厂旧址与工业遗产空间",
  "产业园区博物馆": "影视基地展示空间",
  "工业遗址博物馆": "电影厂旧址与工业遗产空间",
  "民间收藏馆": "民间电影技术收藏空间",
  "非国有": "民间电影技术收藏空间",
  "高校电影博物馆": "高校电影博物馆",
  "校企共建": "高校电影博物馆",
  "影视文化中心": "主题与专题陈列馆",
  "影视基地与主题公园": "影视基地展示空间",
};

function classificationLabel(type: string): string {
  return CLASSIFICATION_LABELS[type] ?? type;
}

// ── Verification status badge ──
const VERIFICATION_BADGES: Record<string, { text: string; cls: string }> = {
  pending_verification: { text: "坐标待核验", cls: "badge-pending" },
  gps_field_measurement: { text: "GPS 实测", cls: "badge-verified" },
  geocoding_from_address: { text: "地址反查", cls: "badge-geocoded" },
  manual_estimation: { text: "人工估算", cls: "badge-estimated" },
  third_party_source: { text: "第三方来源", cls: "badge-third-party" },
};

function verificationBadge(status: string) {
  const badge = VERIFICATION_BADGES[status];
  if (!badge) return `<span class="archive-badge badge-pending">坐标待核验</span>`;
  return `<span class="archive-badge ${badge.cls}">${badge.text}</span>`;
}

// ── Filter helpers ──

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
    "#78716c", // warm gray fallback
  ] as unknown as ExpressionSpecification;
}

function optionLabel(value: string) {
  return value === "all" ? "全部" : value;
}

function normalizeTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function highlightedPointPaint(highlightedId: string | null) {
  const id = highlightedId ?? "";

  return {
    radius: ["case", ["==", ["get", "id"], id], 11, 7] as ExpressionSpecification,
    strokeWidth: ["case", ["==", ["get", "id"], id], 3, 1.5] as ExpressionSpecification,
    strokeColor: ["case", ["==", ["get", "id"], id], "#1a1a1a", "#ffffff"] as ExpressionSpecification,
    opacity: ["case", ["==", ["get", "id"], id], 1, 0.9] as ExpressionSpecification,
  };
}

// ── Build archive-card popup HTML ──
function buildPopupHTML(
  props: MuseumGeoJSON["features"][number]["properties"],
  hasPhotos: boolean,
  hasExhibitions: boolean,
) {
  const typeLabel = classificationLabel(props.classification);
  const tags = normalizeTags(props.tags).slice(0, 4);
  const tagsHtml = tags.length
    ? `<div class="popup-tags">${tags.map((t) => `<span>${t}</span>`).join("")}</div>`
    : "";

  const extrasHtml = [
    hasPhotos ? '<span class="popup-meta-icon photo">📷 田野照片</span>' : "",
    hasExhibitions ? '<span class="popup-meta-icon exhibition">📋 展厅资料</span>' : "",
  ]
    .filter(Boolean)
    .join("");

  return `
    <div class="archive-popup-card">
      <div class="popup-header">
        <h3 class="popup-title-zh">${props.name_zh}</h3>
        <p class="popup-title-en">${props.name_en ?? ""}</p>
      </div>
      <div class="popup-meta">
        <span class="popup-location">${props.province} · ${props.city}</span>
        <span class="popup-type">${typeLabel}</span>
      </div>
      ${tagsHtml}
      ${extrasHtml ? `<div class="popup-extras">${extrasHtml}</div>` : ""}
      <div class="popup-verification">
        ${verificationBadge(props.verification_status)}
        <span class="popup-coord-system">${props.coordinate_system}</span>
      </div>
      <a class="popup-enter-btn" href="/spaces/${props.id}">进入详情页 →</a>
    </div>
  `;
}

export function ArchiveMapView({ museums }: ArchiveMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const latestGeoJSONRef = useRef<MuseumGeoJSON>(getMuseumMapData(museums).geojson);
  const [filters, setFilters] = useState<MapFilters>(EMPTY_FILTERS);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [mapRuntimeError, setMapRuntimeError] = useState<string | null>(null);

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

  // ── Initialize MapLibre map ──
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    if (!filteredGeoJSON.features.length) return;

    let map: MapLibreMap;

    try {
      map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: ARCHIVE_BASEMAP_STYLE,
        center: [104.1954, 35.8617],
        zoom: 3.2,
        minZoom: 2.4,
        maxZoom: 14,
        attributionControl: false,
      });
      setMapRuntimeError(null);
    } catch (error) {
      setMapRuntimeError(error instanceof Error ? error.message : "MapLibre 初始化失败。");
      return;
    }

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
    map.addControl(
      new maplibregl.AttributionControl({
        compact: true,
        customAttribution: "© OpenStreetMap © CARTO",
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

      // Cluster circles – warm archival dark red
      map.addLayer({
        id: "museum-clusters",
        type: "circle",
        source: "museums",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#8b1a1a",
          "circle-radius": ["step", ["get", "point_count"], 18, 5, 24, 10, 32, 20, 40],
          "circle-opacity": 0.84,
          "circle-stroke-width": 2.5,
          "circle-stroke-color": "#fdfcf8",
        },
      });

      // Cluster count labels
      map.addLayer({
        id: "museum-cluster-count",
        type: "symbol",
        source: "museums",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["DIN Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12,
        },
        paint: {
          "text-color": "#ffffff",
        },
      });

      // Individual museum points – classified by type
      map.addLayer({
        id: "museum-points",
        type: "circle",
        source: "museums",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": getClassificationColorExpression(mapData.filterOptions.classifications),
          "circle-radius": highlightedPointPaint(null).radius,
          "circle-stroke-width": highlightedPointPaint(null).strokeWidth,
          "circle-stroke-color": highlightedPointPaint(null).strokeColor,
          "circle-opacity": highlightedPointPaint(null).opacity,
        },
      });

      // ── Cluster click: expand ──
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

      // ── Point click: show archive-card popup ──
      map.on("click", "museum-points", (event) => {
        const feature = event.features?.[0];
        if (!feature?.properties || !feature.geometry || feature.geometry.type !== "Point") return;

        const props = feature.properties as MuseumGeoJSON["features"][number]["properties"];
        const coordinates = feature.geometry.coordinates as [number, number];

        // Highlight the clicked point
        setHighlightedId(props.id);

        const popupHtml = buildPopupHTML(props, false, false);

        const popup = new maplibregl.Popup({
          closeButton: true,
          maxWidth: "340px",
          offset: 14,
          className: "archive-popup-container",
        });

        popup.setLngLat(coordinates).setHTML(popupHtml).addTo(map);
        popup.on("close", () => setHighlightedId(null));
      });

      // ── Cursor states ──
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
    // Only run once; classifications array is stable enough
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredGeoJSON.features.length]);

  // ── Update source data when filters change ──
  useEffect(() => {
    const source = mapRef.current?.getSource("museums") as GeoJSONSource | undefined;
    if (source) {
      source.setData(filteredGeoJSON);
    }
  }, [filteredGeoJSON]);

  // ── Fly to museum when highlightedId changes ──
  const flyToMuseum = useCallback(
    (record: MuseumMapRecord) => {
      const map = mapRef.current;
      if (!map || !hasRenderableCoordinates(record)) return;

      setHighlightedId(record.id);
      map.flyTo({
        center: [record.longitude as number, record.latitude as number],
        zoom: Math.max(map.getZoom(), 8),
        duration: 1200,
      });

    },
    [],
  );

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.getLayer("museum-points")) return;

    const paint = highlightedPointPaint(highlightedId);
    map.setPaintProperty("museum-points", "circle-radius", paint.radius);
    map.setPaintProperty("museum-points", "circle-stroke-width", paint.strokeWidth);
    map.setPaintProperty("museum-points", "circle-stroke-color", paint.strokeColor);
    map.setPaintProperty("museum-points", "circle-opacity", paint.opacity);
  }, [highlightedId]);

  const updateFilter = (key: keyof MapFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const activeFilterCount = Object.values(filters).filter((v) => v !== "all").length;

  return (
    <section className="archive-maplibre-module" aria-label="GIS map module">
      {/* ── Left: Filter panel ── */}
      <aside className="archive-maplibre-filters" aria-label="Map filters">
        <div className="filter-header">
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
            <span className="filter-label-text">{label}</span>
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
        {activeFilterCount > 0 && (
          <div className="filter-active-tags">
            {Object.entries(filters)
              .filter(([, v]) => v !== "all")
              .map(([key, value]) => (
                <span key={key} className="filter-tag">
                  {value}
                  <button
                    type="button"
                    aria-label={`清除 ${value}`}
                    onClick={() => updateFilter(key as keyof MapFilters, "all")}
                  >
                    ×
                  </button>
                </span>
              ))}
          </div>
        )}
        <button
          className="filter-reset-btn"
          type="button"
          disabled={activeFilterCount === 0}
          onClick={() => setFilters(EMPTY_FILTERS)}
        >
          重置筛选
        </button>
        <p className="filter-stats">
          <b>{filteredGeoJSON.features.length}</b> 个已核验点位
          {filteredPendingRecords.length > 0 && (
            <> / <span className="pending-count">{filteredPendingRecords.length} 个坐标待核验</span></>
          )}
        </p>
      </aside>

      {/* ── Center: Map canvas ── */}
      <div className="archive-maplibre-canvas-panel">
        <div className="archive-maplibre-canvas" ref={mapContainerRef} />
        {(!filteredGeoJSON.features.length || mapRuntimeError) && (
          <div className="archive-maplibre-empty">
            <b>{mapRuntimeError ? "MapLibre 暂不可用" : "暂无已核验点位"}</b>
            {mapRuntimeError ? (
              <span>当前浏览器无法创建 WebGL 地图上下文，列表和筛选仍可使用。</span>
            ) : (
              <span>
                当前筛选结果中的展馆坐标为空，或 verification_status 为 pending_verification；
                这些记录保留在右侧列表中，等待坐标核验后再进入地图图层。
              </span>
            )}
          </div>
        )}
        <div className="archive-maplibre-canvas-overlay">
          <span className="map-label">
            中国电影展示空间 · Film Exhibition Spaces in China
          </span>
        </div>
      </div>

      {/* ── Right: Museum list ── */}
      <aside className="archive-maplibre-list" aria-label="Filtered museum list">
        <div className="archive-maplibre-list-heading">
          <span>RESULTS</span>
          <b>{filteredRecords.length}</b>
          <small>{filteredRecords.length === mapData.records.length ? "全部展馆" : "筛选结果"}</small>
        </div>
        <div className="archive-maplibre-list-scroll">
          {filteredRecords.map((record) => {
            const isRenderable = hasRenderableCoordinates(record);
            const isHighlighted = highlightedId === record.id;
            const typeLabel = classificationLabel(record.classification);

            return (
              <article
                key={record.id}
                className={`museum-list-card${isHighlighted ? " highlighted" : ""}${!isRenderable ? " no-coords" : ""}`}
                onClick={() => isRenderable && flyToMuseum(record)}
                style={isRenderable ? { cursor: "pointer" } : undefined}
              >
                <div className="card-header">
                  <h3>{record.name_zh}</h3>
                  <small>{record.name_en}</small>
                </div>
                <p className="card-location">
                  {record.province} · {record.city}
                </p>
                <div className="card-meta">
                  <span className="card-type">{typeLabel}</span>
                  <span className="card-coord-system">{record.coordinate_system}</span>
                </div>
                <footer className="card-footer">
                  <div className="card-tags">
                    {record.tags.slice(0, 3).map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <strong className={`card-verification ${isRenderable ? "has-coords" : "pending"}`}>
                    {isRenderable
                      ? VERIFICATION_BADGES[record.verification_status]?.text ?? record.verification_status
                      : "坐标待核验"}
                  </strong>
                </footer>
                <Link
                  className="card-enter-link"
                  href={`/spaces/${record.id}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  进入展馆档案 →
                </Link>
              </article>
            );
          })}
        </div>
      </aside>
    </section>
  );
}
