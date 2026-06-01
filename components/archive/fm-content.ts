import {
  countBy,
  getAllExhibitions,
  getAllMuseums,
  getAllPhotos,
  getCategories,
  getPhotoCategoryStats,
} from "@/lib/museums";
import type { MuseumRecord } from "@/types";

export type { ExhibitionRecord, MuseumRecord, PhotoRecord } from "@/types";

export const fmMuseums = getAllMuseums();
export const fmPhotos = getAllPhotos();
export const fmExhibitions = getAllExhibitions();
export const fmCategories = getCategories();

const featuredIds = [
  "cn-film-museum",
  "sh-film-museum",
  "cc-film-museum",
  "hk-film-archive",
  "xi-film-museum",
  "qd-film-museum",
];

export const fmStats = {
  museums: fmMuseums.length,
  photos: fmPhotos.length,
  exhibitions: fmExhibitions.length,
  visited: fmMuseums.filter((museum) => museum.visited).length,
  provinces: new Set(fmMuseums.map((museum) => museum.province)).size,
  cities: new Set(fmMuseums.map((museum) => museum.city)).size,
  typeCount: new Set(fmMuseums.map((museum) => museum.type)).size,
};

export const fmTopProvinces = countBy(fmMuseums, (museum) => museum.province).slice(0, 6);

export const fmTypeStats = countBy(fmMuseums, (museum) => museum.type).slice(0, 6);

export const fmPhotoCategoryStats = getPhotoCategoryStats().slice(0, 5);

export const fmFeaturedMuseums = featuredIds
  .map((id) => fmMuseums.find((museum) => museum.id === id))
  .filter((museum): museum is MuseumRecord => Boolean(museum));

export const fmWorkbenchContext = {
  stats: fmStats,
  featuredMuseum: fmFeaturedMuseums[0],
  topProvinces: fmTopProvinces,
  photoCategories: fmPhotoCategoryStats,
  routeTitles: fmExhibitions.map((route) => route.title_zh),
};

export const projectResearchQuestions = [
  "中国电影展示空间在地理上如何分布，哪些区域形成了明显的文化资源集聚？",
  "不同类型的电影博物馆、电影厂旧址和影像档案空间如何组织电影史叙事？",
  "摄影机、放映机、胶片、洗印设备和声音设备如何从生产系统进入展陈系统？",
  "地方影像记忆、电影厂史和民族影像记忆如何在展陈空间中被建构？",
  "数字互动、沉浸式影像和线上展览如何改变电影遗产的展示方式？",
  "如何通过开源数据结构，使电影博物馆研究具备可复现、可协作和可持续更新的基础？",
];

export const projectGoals = [
  "建立中国电影展示空间基础数据库，记录名称、地址、类型、机构属性、研究标签和参考来源。",
  "搭建 GIS 空间制图与线上展览平台，支持按空间类型、地区、展陈主题和技术遗产类型浏览。",
  "建立展厅与展陈单元资料库，关注叙事策略、关键展品、互动技术和媒介呈现方式。",
  "建立田野照片元数据档案，逐张记录拍摄信息、权利状态、公开等级和参考来源。",
  "建立电影技术遗产分类体系，覆盖摄影、放映、胶片洗印、录音、动画、宣传品和沉浸式展陈。",
  "建立 README、CONTRIBUTING、LICENSE、数据模型文档和校验脚本构成的开源治理机制。",
];

export const themeExhibitions = [
  "从摄影机到放映机：电影技术器物的博物馆化",
  "电影厂旧址与中国电影工业记忆",
  "地方影像记忆与城市文化展示",
  "胶片、洗印与后期制作的技术系统",
  "电影博物馆中的场景复原与历史再现",
  "数字互动与沉浸式电影展陈",
  "民间收藏空间与电影技术遗产的补充保存",
];

export const dataGovernanceItems = [
  "核心数据集中在 data/：museums、exhibitions、photos、categories、references.csl。",
  "Museum → Exhibition → Photo → Reference 构成轻量知识图谱，后续可扩展到 Object 和 Theme。",
  "坐标未核验时宁可填 null，也不虚构；必须标注 coordinate_source。",
  "照片默认 visibility 为 public_thumbnail_only，不默认公开高清图和下载。",
  "每张照片必须包含 photographer_copyright、institutional_restriction、personality_rights。",
  "提交前运行 npm run validate:data 检查死链、缺字段、visibility 与权利字段。",
];
