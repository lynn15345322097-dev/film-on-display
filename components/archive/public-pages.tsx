import {
  Archive,
  BarChart3,
  BookOpenText,
  Database,
  Layers3,
  Map,
  Microscope,
  Route,
  ShieldCheck,
} from "lucide-react";

import { getMuseumsByIds, getSpatialStats, getVisiblePhotos } from "@/lib/museums";

import { ArchiveMapView } from "./map-view";
import { MuseumCard } from "./museum-card";
import {
  dataGovernanceItems,
  fmExhibitions,
  fmMuseums,
  fmPhotoCategoryStats,
  fmStats,
  fmTopProvinces,
  fmTypeStats,
  projectGoals,
  projectResearchQuestions,
  themeExhibitions,
} from "./fm-content";
import { PhotoGallery } from "./photo-gallery";
import { ArchiveFooter, ArchiveShell } from "./shell";

const methodSteps = [
  {
    title: "样本建档",
    body: "以 museums.json 记录空间名称、行政区划、坐标来源、机构属性、空间观察和展陈分析字段。",
  },
  {
    title: "空间编码",
    body: "用 region、province、city、type、nature 形成可统计字段，避免只依赖叙述性描述。",
  },
  {
    title: "照片元数据",
    body: "照片逐条关联 museum_id 与 exhibition_id，并记录 object_type、rights、visibility 与参考来源。",
  },
  {
    title: "主题展线",
    body: "通过 exhibitions.json 将分散机构组织为可研究的跨馆路线、章节问题和关键词集合。",
  },
  {
    title: "校验与回滚",
    body: "每次更新后运行 validate:data，保持 JSON 结构、外键和照片权利字段可追踪。",
  },
];

export function MapPage() {
  return (
    <ArchiveShell asideMode="map">
      <section className="archive-page-hero">
        <span>GIS ATLAS</span>
        <h1>电影展示空间的媒介地理</h1>
        <p>
          地图页以 museums.json 为基础，展示电影博物馆、电影厂旧址、影像档案空间、
          民间收藏空间和影视基地展示空间的全国分布。地图不是单纯导航工具，而是观察区域差异、
          空间集聚和文化资源配置的研究入口。
        </p>
      </section>
      <section className="archive-section archive-maplibre-section">
        <div className="archive-section-heading">
          <h2>MapLibre GL JS 点位图谱</h2>
          <div />
        </div>
        <ArchiveMapView />
      </section>
      <section className="archive-page-grid two">
        <article className="archive-page-panel">
          <h2>筛选维度</h2>
          <ul>
            <li>省份、城市与区域</li>
            <li>空间类型与机构属性</li>
            <li>技术遗产标签与展陈主题</li>
            <li>坐标系统、坐标来源与核验状态</li>
          </ul>
        </article>
        <article className="archive-page-panel">
          <h2>当前数据概况</h2>
          <div className="archive-page-stats">
            <b>{fmStats.museums}</b><span>展示空间</span>
            <b>{fmStats.provinces}</b><span>省级区域</span>
            <b>{fmStats.cities}</b><span>城市</span>
          </div>
        </article>
      </section>
      <section className="archive-section">
        <div className="archive-section-heading">
          <h2>区域分布</h2>
          <div />
        </div>
        <div className="archive-table-list">
          {fmTopProvinces.map((item) => (
            <article key={item.label}>
              <span>{item.label}</span>
              <b>{item.count}</b>
            </article>
          ))}
        </div>
      </section>
      <section className="archive-section">
        <div className="archive-section-heading">
          <h2>代表性空间</h2>
          <div />
        </div>
        <div className="archive-museum-grid">
          {fmMuseums.slice(0, 6).map((museum) => (
            <MuseumCard key={museum.id} museum={museum} />
          ))}
        </div>
      </section>
      <ArchiveFooter />
    </ArchiveShell>
  );
}

export function PhotosPage() {
  const visiblePhotos = getVisiblePhotos();

  return (
    <ArchiveShell>
      <section className="archive-page-hero">
        <span>FIELD PHOTO ARCHIVE</span>
        <h1>田野照片档案与元数据管理</h1>
        <p>
          本项目中的照片不是普通图片素材，而是田野调研档案。每条记录说明其所属展馆、
          关联展厅、对象类型、拍摄信息、权利状态和公开等级；默认策略为 public_thumbnail_only。
        </p>
      </section>
      <section className="archive-section">
        <div className="archive-section-heading">
          <h2>照片对象类型</h2>
          <div />
        </div>
        <div className="archive-table-list">
          {fmPhotoCategoryStats.map((item) => (
            <article key={item.label}>
              <span>{item.label}</span>
              <b>{item.count}</b>
            </article>
          ))}
        </div>
      </section>
      <PhotoGallery photos={visiblePhotos} />
      <ArchiveFooter />
    </ArchiveShell>
  );
}

export function ExhibitionsPage() {
  return (
    <ArchiveShell>
      <section className="archive-page-hero">
        <span>CURATED RESEARCH ROUTES</span>
        <h1>跨馆主题展览与电影技术遗产谱系</h1>
        <p>
          主题展览打破单馆逻辑，从技术谱系、空间类型和叙事策略出发，
          将分散在不同博物馆中的电影技术器物、地方影像记忆和展陈方式重新组织起来。
        </p>
      </section>
      <section className="archive-section">
        <div className="archive-route-grid">
          {fmExhibitions.map((route) => (
            <article key={route.id}>
              <Route size={22} />
              <span>{route.museum_ids.length} spaces / {route.chapters.length} chapters</span>
              <h2>{route.title_zh}</h2>
              <h3>{route.subtitle_zh}</h3>
              <p>{route.summary_zh}</p>
              <div className="archive-route-chapter-list">
                {route.chapters.slice(0, 3).map((chapter) => (
                  <section key={chapter.title_zh}>
                    <b>{chapter.title_zh}</b>
                    <small>{chapter.research_question}</small>
                  </section>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="archive-section">
        <div className="archive-section-heading">
          <h2>展线涉及空间</h2>
          <div />
        </div>
        <div className="archive-route-museum-grid">
          {fmExhibitions.map((route) => (
            <article key={route.id}>
              <h3>{route.title_zh}</h3>
              <p>
                {getMuseumsByIds(route.museum_ids)
                  .map((museum) => museum.name)
                  .join(" / ")}
              </p>
            </article>
          ))}
        </div>
      </section>
      <section className="archive-section archive-theme-section">
        <div className="archive-section-heading">
          <h2>后续主题</h2>
          <div />
        </div>
        <div className="archive-theme-list">
          {themeExhibitions.map((theme) => (
            <article key={theme}>
              <Archive size={18} />
              <h3>{theme}</h3>
              <p>作为后续策展页、论文图谱和研究展示的可视化入口。</p>
            </article>
          ))}
        </div>
      </section>
      <section className="archive-section">
        <div className="archive-section-heading">
          <h2>样本空间</h2>
          <div />
        </div>
        <div className="archive-museum-grid">
          {fmMuseums.slice(0, 3).map((museum) => (
            <MuseumCard key={museum.id} museum={museum} />
          ))}
        </div>
      </section>
      <ArchiveFooter />
    </ArchiveShell>
  );
}

export function AboutProjectPage() {
  return (
    <ArchiveShell>
      <section className="archive-page-hero">
        <span>ABOUT THE PROJECT</span>
        <h1>一个可展示、可研究、可协作、可持续更新的数字人文平台</h1>
        <p>
          项目将电影史研究从文本、作者和产业层面拓展到空间、器物和展陈机制层面，
          以开源数据结构、GIS 制图、照片元数据、文献索引和校验脚本搭建轻量但规范的研究样本。
        </p>
      </section>
      <section className="archive-section">
        <div className="archive-section-heading">
          <h2>研究问题</h2>
          <div />
        </div>
        <div className="archive-question-list">
          {projectResearchQuestions.map((question, index) => (
            <article key={question}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{question}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="archive-section">
        <div className="archive-section-heading">
          <h2>阶段性目标</h2>
          <div />
        </div>
        <div className="archive-goal-grid">
          {projectGoals.map((goal, index) => (
            <article key={goal}>
              <b>{index + 1}</b>
              <p>{goal}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="archive-section archive-governance-section">
        <div className="archive-section-heading">
          <h2>数据治理</h2>
          <div />
        </div>
        <div className="archive-governance-grid">
          <article className="archive-governance-card">
            <ShieldCheck size={22} />
            <h3>权利分层</h3>
            <p>代码、数据、媒体文件分别授权，照片按 photos.json 中逐张 rights 与 visibility 控制。</p>
          </article>
          <article className="archive-governance-card">
            <Database size={22} />
            <h3>校验脚本</h3>
            <p>通过 scripts/validate-data.js 检查 JSON、外键、照片权利字段和公开等级。</p>
          </article>
          {dataGovernanceItems.map((item) => (
            <article className="archive-governance-note" key={item}>
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>
      <ArchiveFooter />
    </ArchiveShell>
  );
}

export function SpatialAnalysisPage() {
  const spatialStats = getSpatialStats();
  const maxProvinceCount = Math.max(...spatialStats.provinceStats.map((item) => item.count), 1);
  const maxTypeCount = Math.max(...spatialStats.typeStats.map((item) => item.count), 1);
  const maxNatureCount = Math.max(...spatialStats.natureStats.map((item) => item.count), 1);

  return (
    <ArchiveShell asideMode="map">
      <section className="archive-page-hero">
        <span>SPATIAL ANALYSIS</span>
        <h1>电影展示空间的地区分布与类型结构</h1>
        <p>
          空间分析页将 museums.json 中的行政区划、空间类型、机构属性和田野状态转化为统计视图，
          用来观察电影展示资源的区域集聚、类型差异和后续调研优先级。
        </p>
      </section>
      <section className="archive-analysis-overview">
        <article>
          <BarChart3 size={22} />
          <b>{spatialStats.totalCount}</b>
          <span>样本空间</span>
        </article>
        <article>
          <Microscope size={22} />
          <b>{spatialStats.visitedCount}</b>
          <span>已田野调研</span>
        </article>
        <article>
          <Map size={22} />
          <b>{spatialStats.regionStats.length}</b>
          <span>区域分组</span>
        </article>
        <article>
          <Layers3 size={22} />
          <b>{spatialStats.typeStats.length}</b>
          <span>空间类型</span>
        </article>
      </section>
      <section className="archive-section">
        <div className="archive-section-heading">
          <h2>省级分布</h2>
          <div />
        </div>
        <div className="archive-stat-bars">
          {spatialStats.provinceStats.slice(0, 10).map((item) => (
            <article key={item.province}>
              <div>
                <strong>{item.province}</strong>
                <span>{item.visited} visited</span>
              </div>
              <div className="archive-stat-track">
                <i style={{ width: `${(item.count / maxProvinceCount) * 100}%` }} />
              </div>
              <b>{item.count}</b>
            </article>
          ))}
        </div>
      </section>
      <section className="archive-page-grid two archive-analysis-grid">
        <article className="archive-page-panel">
          <h2>区域分组</h2>
          <div className="archive-region-list">
            {spatialStats.regionStats.map((item) => (
              <section key={item.region}>
                <strong>{item.region}</strong>
                <span>{item.count} spaces</span>
                <small>{item.visited} visited</small>
              </section>
            ))}
          </div>
        </article>
        <article className="archive-page-panel">
          <h2>类型结构</h2>
          <div className="archive-compact-bars">
            {spatialStats.typeStats.slice(0, 8).map((item) => (
              <section key={item.type}>
                <span>{item.type}</span>
                <div>
                  <i style={{ width: `${(item.count / maxTypeCount) * 100}%` }} />
                </div>
                <b>{item.count}</b>
              </section>
            ))}
          </div>
        </article>
      </section>
      <section className="archive-section">
        <div className="archive-section-heading">
          <h2>机构属性</h2>
          <div />
        </div>
        <div className="archive-method-grid">
          {spatialStats.natureStats.map((item) => (
            <article key={item.nature}>
              <span>{item.count}</span>
              <h3>{item.nature}</h3>
              <div className="archive-stat-track">
                <i style={{ width: `${(item.count / maxNatureCount) * 100}%` }} />
              </div>
            </article>
          ))}
        </div>
      </section>
      <ArchiveFooter />
    </ArchiveShell>
  );
}

export function MethodPage() {
  return (
    <ArchiveShell>
      <section className="archive-page-hero">
        <span>RESEARCH METHOD</span>
        <h1>从空间样本到可复核档案的研究方法</h1>
        <p>
          方法页说明本项目如何把电影博物馆、档案馆、制片厂旧址、民间收藏空间和照片资料转化为
          可校验的数据结构，并为后续论文写作、展线策划和 AI 问答提供共同依据。
        </p>
      </section>
      <section className="archive-section">
        <div className="archive-method-flow">
          {methodSteps.map((step, index) => (
            <article key={step.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h2>{step.title}</h2>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="archive-page-grid two">
        <article className="archive-page-panel">
          <BookOpenText size={22} />
          <h2>核心材料</h2>
          <ul>
            <li>museums.json：空间样本、分类、坐标与研究说明</li>
            <li>photos.json：田野照片、对象类型、权利与公开等级</li>
            <li>exhibitions.json：跨馆主题展线、章节和研究问题</li>
            <li>categories.json：空间类型、机构属性和照片对象类型体系</li>
          </ul>
        </article>
        <article className="archive-page-panel">
          <Database size={22} />
          <h2>校验原则</h2>
          <ul>
            <li>坐标未核验时保留 pending_verification，不虚构精确点位</li>
            <li>照片默认只公开缩略图，权利字段必须逐条填写</li>
            <li>展线只引用已存在的 museum_id，避免断开的研究节点</li>
            <li>所有公开页面优先读取同一套数据工具函数，减少页面之间口径不一致</li>
          </ul>
        </article>
      </section>
      <section className="archive-section archive-governance-section">
        <div className="archive-section-heading">
          <h2>方法输出</h2>
          <div />
        </div>
        <div className="archive-governance-grid">
          {projectGoals.slice(0, 4).map((goal, index) => (
            <article className="archive-governance-note" key={goal}>
              <b>{String(index + 1).padStart(2, "0")}</b>
              <p>{goal}</p>
            </article>
          ))}
        </div>
      </section>
      <ArchiveFooter />
    </ArchiveShell>
  );
}
