import { Archive, Database, Map, Route, ShieldCheck } from "lucide-react";

import { getMuseumsByIds, getVisiblePhotos } from "@/lib/museums";

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
      <section className="archive-page-grid two">
        <article className="archive-map-abstract">
          <Map size={24} />
          <h2>点位图谱</h2>
          <p>id、name_zh、name_en、administrative_division、geo、classification、academic_context。</p>
          <ArchiveMapView />
        </article>
        <article className="archive-page-panel">
          <h2>筛选维度</h2>
          <ul>
            <li>省份、城市与区域</li>
            <li>空间类型与机构属性</li>
            <li>开馆时间、改造时间与田野调研时间</li>
            <li>展陈主题、技术遗产类型与照片对象类型</li>
          </ul>
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
