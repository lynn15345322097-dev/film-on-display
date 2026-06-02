import categoriesData from "@/data/categories.json";
import exhibitionsData from "@/data/exhibitions.json";
import museumsData from "@/data/museums.json";
import photosData from "@/data/photos.json";
import type {
  CategoryData,
  ExhibitionRecord,
  Museum,
  MuseumRecord,
  PhotoRecord,
  PhotoVisibility,
} from "@/types";

const museums = museumsData as unknown as MuseumRecord[];
const photos = photosData as unknown as PhotoRecord[];
const exhibitions = exhibitionsData as unknown as ExhibitionRecord[];
const categories = categoriesData as unknown as CategoryData;

export interface CountStat {
  label: string;
  count: number;
}

export interface ProvinceStat {
  province: string;
  count: number;
  visited: number;
}

export interface RegionStat {
  region: string;
  count: number;
  visited: number;
}

export interface TypeStat {
  type: string;
  count: number;
}

export interface NatureStat {
  nature: string;
  count: number;
}

export interface SpatialStats {
  totalCount: number;
  visitedCount: number;
  provinceStats: ProvinceStat[];
  regionStats: RegionStat[];
  typeStats: TypeStat[];
  natureStats: NatureStat[];
}

export interface MuseumGeoJSONFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    id: string;
    name_zh: string;
    name_en: string | null;
    province: string;
    city: string;
    classification: string;
    classification_nature: string;
    latitude: number;
    longitude: number;
    coordinate_system: string;
    verification_status: string;
    tags: string[];
    address: string;
  };
}

export interface MuseumGeoJSON {
  type: "FeatureCollection";
  features: MuseumGeoJSONFeature[];
}

export interface MuseumMapPoint {
  id: string;
  name: string;
  nameEn: string;
  region: string;
  province: string;
  city: string;
  type: string;
  nature: string;
  visited: boolean;
  coordinates: [number, number];
  coordinateSource: string;
  color: string;
}

export interface MuseumMapRecord {
  id: string;
  name_zh: string;
  name_en: string | null;
  province: string;
  city: string;
  classification: string;
  classification_nature: string;
  latitude: number | null;
  longitude: number | null;
  coordinate_system: string;
  verification_status: string;
  tags: string[];
  address: string;
}

export interface MuseumMapData {
  geojson: MuseumGeoJSON;
  records: MuseumMapRecord[];
  pendingRecords: MuseumMapRecord[];
  filterOptions: {
    provinces: string[];
    cities: string[];
    classifications: string[];
    tags: string[];
  };
}

export const TYPE_COLORS: Record<string, string> = {
  国家: "#8b1a1a",
  国家级专题博物馆: "#8b1a1a",
  省级电影博物馆: "#d4a04a",
  市级电影博物馆: "#2563eb",
  专题博物馆: "#2563eb",
  档案与学术机构: "#7c3aed",
  "电影资料馆/影像档案": "#7c3aed",
  "电影制片厂/影视基地": "#ea580c",
  产业园区博物馆: "#ea580c",
  工业遗址博物馆: "#ea580c",
  民间收藏馆: "#16a34a",
  非国有: "#16a34a",
  高校电影博物馆: "#0891b2",
  校企共建: "#0891b2",
  影视文化中心: "#db2777",
  影视基地与主题公园: "#db2777",
};

export function countBy<T>(items: T[], getKey: (item: T) => string): CountStat[] {
  const totals = new Map<string, number>();
  for (const item of items) {
    const key = getKey(item);
    totals.set(key, (totals.get(key) ?? 0) + 1);
  }

  return Array.from(totals.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "zh-Hans-CN"));
}

export function getTypeColor(type: string): string {
  return TYPE_COLORS[type] ?? "#78716c";
}

export function getAllMuseums(): MuseumRecord[] {
  return museums;
}

export function getMuseumById(id: string): MuseumRecord | undefined {
  return museums.find((museum) => museum.id === id);
}

export function getMuseumsByIds(ids: string[]): MuseumRecord[] {
  return ids
    .map((id) => getMuseumById(id))
    .filter((museum): museum is MuseumRecord => Boolean(museum));
}

export function getMuseumsByCity(city: string): MuseumRecord[] {
  return museums.filter((museum) => museum.city === city);
}

export function getMuseumsByRegion(region: string): MuseumRecord[] {
  return museums.filter((museum) => museum.region === region);
}

export function getMuseumsByType(type: string): MuseumRecord[] {
  return museums.filter((museum) => museum.type === type);
}

export function getAllCities(): string[] {
  return [...new Set(museums.map((museum) => museum.city))].sort();
}

export function getAllRegions(): string[] {
  return [...new Set(museums.map((museum) => museum.region))].sort();
}

export function getAllProvinces(): string[] {
  return [...new Set(museums.map((museum) => museum.province))].sort();
}

export function getAllNatures(): string[] {
  return [...new Set(museums.map((museum) => museum.nature))].sort();
}

export function getAllTypes(): string[] {
  return [...new Set(museums.map((museum) => museum.type))].sort();
}

export function getAllTags(): string[] {
  return [...new Set(museums.flatMap((museum) => museum.tags))].sort();
}

export function getAllPhotos(): PhotoRecord[] {
  return photos;
}

export function getVisiblePhotos(
  visibility: PhotoVisibility[] = ["public", "public_thumbnail_only", "restricted"],
): PhotoRecord[] {
  return photos.filter((photo) => visibility.includes(photo.visibility));
}

export function getPhotoById(id: string): PhotoRecord | undefined {
  return photos.find((photo) => photo.id === id);
}

export function getPhotosByMuseum(museumId: string): PhotoRecord[] {
  return photos.filter((photo) => photo.museum_id === museumId);
}

export function getPhotosByExhibition(exhibitionId: string): PhotoRecord[] {
  return photos.filter((photo) => photo.exhibition_id === exhibitionId);
}

export function getPhotoCategoryStats(): CountStat[] {
  return countBy(photos, (photo) => photo.metadata.object_type);
}

export function getAllExhibitions(): ExhibitionRecord[] {
  return exhibitions;
}

export function getExhibitionRecordById(id: string): ExhibitionRecord | undefined {
  return exhibitions.find((exhibition) => exhibition.id === id);
}

export function getExhibitionsByMuseum(museumId: string): ExhibitionRecord[] {
  return exhibitions.filter((exhibition) => exhibition.museum_ids.includes(museumId));
}

export function getCategories(): CategoryData {
  return categories;
}

function toMuseumMapRecord(museum: MuseumRecord): MuseumMapRecord {
  const latitude = museum.geo?.latitude ?? museum.coordinates?.[0] ?? null;
  const longitude = museum.geo?.longitude ?? museum.coordinates?.[1] ?? null;
  const classification = museum.classification?.type ?? museum.type;

  return {
    id: museum.id,
    name_zh: museum.name_zh ?? museum.name,
    name_en: museum.name_en ?? museum.nameEn ?? null,
    province: museum.administrative_division?.province ?? museum.province,
    city: museum.administrative_division?.city ?? museum.city,
    classification,
    classification_nature: museum.classification?.nature ?? museum.nature,
    latitude,
    longitude,
    coordinate_system: museum.geo?.coordinate_system ?? "unknown",
    verification_status: museum.geo?.coordinate_source ?? "pending_verification",
    tags: museum.tags,
    address: museum.administrative_division?.address ?? museum.address,
  };
}

function hasRenderableCoordinates(record: MuseumMapRecord): record is MuseumMapRecord & {
  latitude: number;
  longitude: number;
} {
  return (
    typeof record.latitude === "number" &&
    Number.isFinite(record.latitude) &&
    typeof record.longitude === "number" &&
    Number.isFinite(record.longitude) &&
    record.verification_status !== "pending_verification"
  );
}

export function museumsToGeoJSON(museumList: MuseumRecord[] = museums): MuseumGeoJSON {
  const records = museumList.map(toMuseumMapRecord).filter(hasRenderableCoordinates);

  return {
    type: "FeatureCollection",
    features: records.map((record) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [record.longitude, record.latitude],
      },
      properties: {
        id: record.id,
        name_zh: record.name_zh,
        name_en: record.name_en,
        province: record.province,
        city: record.city,
        classification: record.classification,
        classification_nature: record.classification_nature,
        latitude: record.latitude,
        longitude: record.longitude,
        coordinate_system: record.coordinate_system,
        verification_status: record.verification_status,
        tags: record.tags,
        address: record.address,
      },
    })),
  };
}

export function getMuseumMapData(museumList: MuseumRecord[] = museums): MuseumMapData {
  const records = museumList.map(toMuseumMapRecord);

  return {
    geojson: museumsToGeoJSON(museumList),
    records,
    pendingRecords: records.filter((record) => !hasRenderableCoordinates(record)),
    filterOptions: {
      provinces: [...new Set(records.map((record) => record.province))].sort(),
      cities: [...new Set(records.map((record) => record.city))].sort(),
      classifications: [...new Set(records.map((record) => record.classification))].sort(),
      tags: [...new Set(records.flatMap((record) => record.tags))].sort(),
    },
  };
}

export function getMuseumMapPoints(museumList: MuseumRecord[] = museums): MuseumMapPoint[] {
  return museumList.map((museum) => ({
    id: museum.id,
    name: museum.name,
    nameEn: museum.nameEn,
    region: museum.region,
    province: museum.province,
    city: museum.city,
    type: museum.type,
    nature: museum.nature,
    visited: museum.visited ?? false,
    coordinates: museum.coordinates,
    coordinateSource: museum.geo?.coordinate_source ?? "pending_verification",
    color: getTypeColor(museum.type),
  }));
}

export function getSpatialStats(): SpatialStats {
  const totalCount = museums.length;
  const visitedCount = museums.filter((museum) => museum.visited).length;

  const provinceMap = new Map<string, { count: number; visited: number }>();
  const regionMap = new Map<string, { count: number; visited: number }>();
  const typeMap = new Map<string, number>();
  const natureMap = new Map<string, number>();

  for (const museum of museums) {
    const province = provinceMap.get(museum.province) ?? { count: 0, visited: 0 };
    province.count++;
    if (museum.visited) province.visited++;
    provinceMap.set(museum.province, province);

    const region = regionMap.get(museum.region) ?? { count: 0, visited: 0 };
    region.count++;
    if (museum.visited) region.visited++;
    regionMap.set(museum.region, region);

    typeMap.set(museum.type, (typeMap.get(museum.type) ?? 0) + 1);
    natureMap.set(museum.nature, (natureMap.get(museum.nature) ?? 0) + 1);
  }

  return {
    totalCount,
    visitedCount,
    provinceStats: Array.from(provinceMap.entries())
      .map(([province, data]) => ({ province, ...data }))
      .sort((a, b) => b.count - a.count),
    regionStats: Array.from(regionMap.entries()).map(([region, data]) => ({ region, ...data })),
    typeStats: Array.from(typeMap.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count),
    natureStats: Array.from(natureMap.entries())
      .map(([nature, count]) => ({ nature, count }))
      .sort((a, b) => b.count - a.count),
  };
}
