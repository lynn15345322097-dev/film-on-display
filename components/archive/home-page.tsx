/* eslint-disable @next/next/no-img-element */

import {
  Building2,
  Camera,
  CheckCircle2,
  Database,
  Images,
  Landmark,
  Map,
  MapPin,
  Network,
  ShieldCheck,
  Route,
  Settings2,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";

import { archiveImages } from "./data";
import {
  fmExhibitions,
  fmFeaturedMuseums,
  fmPhotoCategoryStats,
  fmStats,
  fmTopProvinces,
  fmTypeStats,
  projectGoals,
  projectResearchQuestions,
  themeExhibitions,
  dataGovernanceItems,
} from "./fm-content";
import { ArchiveFooter, ArchiveShell } from "./shell";

const stats = [
  ["展示空间", String(fmStats.museums)],
  ["图像元数据", String(fmStats.photos)],
  ["研究展线", String(fmStats.exhibitions)],
  ["覆盖城市", String(fmStats.cities)],
];

const pillars = [
  {
    icon: Landmark,
    title: "田野调研",
    copy: "记录电影博物馆、电影厂旧址、影像档案空间和民间电影技术收藏空间的现场信息。",
  },
  {
    icon: Map,
    title: "GIS 空间制图",
    copy: "通过点位、分类和区域统计观察中国电影展示空间的分布格局与空间集聚。",
    wide: true,
  },
  {
    icon: Database,
    title: "结构化资料库",
    copy: "以 JSON 管理展馆、展览单元、田野照片、分类体系和参考文献。",
  },
  {
    icon: Camera,
    title: "照片元数据",
    copy: "照片不只是素材，而是带有拍摄信息、权利状态和公开等级的田野档案。",
  },
  {
    icon: Settings2,
    title: "技术遗产分类",
    copy: "围绕摄影机、放映机、胶片洗印、录音、动画、宣传品和数字互动建立分类本体。",
  },
];

export async function ArchiveHomePage() {
  const primaryRoute = fmExhibitions[0];

  return (
    <ArchiveShell>
      <section className="archive-hero">
        <img alt="Antique film projector in a dim cinema hall" src={archiveImages.hero} />
        <div className="archive-hero-gradient" />
        <div className="archive-hero-copy">
          <span>Research Initiative No. 01</span>
          <h1>
            影迹图谱 <em>/ FilmGeo Atlas</em>
          </h1>
          <h2>让中国电影史，在空间、器物与展陈中重新展开</h2>
          <p>
            本项目以中国电影展示空间为对象，通过田野调研、GIS 空间制图、展陈信息整理和照片元数据归档，
            建立一个可持续更新的线上展览与开放资料库。
          </p>
          <div className="archive-hero-actions">
            <Link href="/map">
              <Map size={16} />
              进入地图
            </Link>
            <Link href="/exhibitions">
              <Route size={16} />
              主题展览
            </Link>
            <Link href="/about">
              <Network size={16} />
              项目方法
            </Link>
          </div>
        </div>
      </section>

      <section className="archive-stats">
        {stats.map(([label, value]) => (
          <div key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
          </div>
        ))}
      </section>

      <section className="archive-section archive-position-section">
        <div className="archive-section-heading">
          <h2>Project Positioning / 项目定位</h2>
          <div />
        </div>
        <div className="archive-position-grid">
          <article>
            <h3>数字人文资料库</h3>
            <p>通过结构化数据记录电影展示空间、展厅单元、田野照片与参考文献。</p>
          </article>
          <article>
            <h3>线上展览平台</h3>
            <p>以地图、照片墙、展馆详情页、主题策展页等形式进行可视化展示。</p>
          </article>
          <article>
            <h3>媒介地理研究工具</h3>
            <p>通过 GIS 点位与分类数据，观察电影展示空间的区域分布与空间集聚。</p>
          </article>
          <article>
            <h3>电影工业遗产档案</h3>
            <p>记录摄影机、放映机、胶片、洗印设备和声音设备如何进入博物馆展陈系统。</p>
          </article>
          <article>
            <h3>开源知识工程</h3>
            <p>公开代码、数据结构、文档规范和贡献机制，使项目具备长期扩展能力。</p>
          </article>
        </div>
      </section>

      <section className="archive-section archive-data-section">
        <div className="archive-section-heading">
          <h2>Research Dataset / 研究数据</h2>
          <div />
        </div>

        <div className="archive-data-grid">
          <article className="archive-data-panel wide">
            <div className="archive-data-panel-heading">
              <MapPin size={20} />
              <h3>省域分布</h3>
              <span>{fmStats.provinces} provinces</span>
            </div>
            <div className="archive-rank-list">
              {fmTopProvinces.map((item) => (
                <div key={item.label}>
                  <span>{item.label}</span>
                  <div>
                    <i style={{ width: `${(item.count / fmTopProvinces[0].count) * 100}%` }} />
                  </div>
                  <b>{item.count}</b>
                </div>
              ))}
            </div>
          </article>

          <article className="archive-data-panel">
            <div className="archive-data-panel-heading">
              <Building2 size={20} />
              <h3>空间类型</h3>
              <span>{fmStats.typeCount} types</span>
            </div>
            <ul className="archive-compact-list">
              {fmTypeStats.map((item) => (
                <li key={item.label}>
                  <span>{item.label}</span>
                  <b>{item.count}</b>
                </li>
              ))}
            </ul>
          </article>

          <article className="archive-data-panel">
            <div className="archive-data-panel-heading">
              <Images size={20} />
              <h3>图像分类</h3>
              <span>{fmStats.photos} records</span>
            </div>
            <ul className="archive-compact-list">
              {fmPhotoCategoryStats.map((item) => (
                <li key={item.label}>
                  <span>{item.label}</span>
                  <b>{item.count}</b>
                </li>
              ))}
            </ul>
          </article>
        </div>

        <div className="archive-museum-grid">
          {fmFeaturedMuseums.slice(0, 6).map((museum) => (
            <article className="archive-museum-card" key={museum.id}>
              <div>
                <span>{museum.province} / {museum.city}</span>
                {museum.visited && (
                  <small>
                    <CheckCircle2 size={12} />
                    已实地考察
                  </small>
                )}
              </div>
              <h3>{museum.name}</h3>
              <p>{museum.description}</p>
              <footer>
                <b>{museum.type}</b>
                <em>{museum.nature}</em>
              </footer>
            </article>
          ))}
        </div>
      </section>

      <section className="archive-section archive-research-section">
        <div className="archive-section-heading">
          <h2>Research Questions / 研究问题</h2>
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
          <h2>Core Modules / 核心内容</h2>
          <div />
        </div>
        <div className="archive-pillar-grid">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <article className={pillar.wide ? "wide" : undefined} key={pillar.title}>
                {pillar.wide && <img alt="" src={archiveImages.gis} />}
                <div>
                  <Icon size={22} />
                  <h3>{pillar.title}</h3>
                  <p>{pillar.copy}</p>
                </div>
                {pillar.wide && (
                  <Link href="/map">
                    Open Map
                    <SlidersHorizontal size={14} />
                  </Link>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="archive-section archive-goals-section">
        <div className="archive-section-heading">
          <h2>Implementation Goals / 建设目标</h2>
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

      <section className="archive-feature">
        <div className="archive-feature-copy">
          <span>Featured Research Route</span>
          <h2>{primaryRoute.title_zh}</h2>
          <p>
            {primaryRoute.summary_zh}
          </p>
          <div className="archive-feature-metrics">
            <div>
              <p>Route Sites</p>
              <strong>{primaryRoute.museum_ids.length} Spaces</strong>
            </div>
            <div>
              <p>Chapters</p>
              <strong>{primaryRoute.chapters.length} Topics</strong>
            </div>
          </div>
          <Link href="/chat">
            <Route size={16} />
            Ask in Workbench
          </Link>
        </div>
        <div className="archive-feature-image">
          <img alt="Vintage projection room control panel" src={archiveImages.controlPanel} />
        </div>
      </section>

      <section className="archive-section archive-theme-section">
        <div className="archive-section-heading">
          <h2>Thematic Exhibitions / 跨馆主题展览</h2>
          <div />
        </div>
        <div className="archive-theme-list">
          {themeExhibitions.map((theme) => (
            <article key={theme}>
              <Route size={18} />
              <h3>{theme}</h3>
              <p>以技术谱系、空间类型和叙事策略为线索，重组分散在不同展馆中的电影遗产材料。</p>
            </article>
          ))}
        </div>
      </section>

      <section className="archive-section archive-governance-section">
        <div className="archive-section-heading">
          <h2>Data Governance / 数据治理与权利策略</h2>
          <div />
        </div>
        <div className="archive-governance-grid">
          <article className="archive-governance-card">
            <ShieldCheck size={22} />
            <h3>照片默认仅公开缩略图</h3>
            <p>
              馆内展品、展陈空间、图文展板和多媒体界面默认使用 public_thumbnail_only，
              不开放原图下载。
            </p>
          </article>
          <article className="archive-governance-card wide">
            <Database size={22} />
            <h3>轻量知识图谱</h3>
            <div className="archive-knowledge-chain">
              <span>Museum</span>
              <i />
              <span>Exhibition</span>
              <i />
              <span>Photo</span>
              <i />
              <span>Reference</span>
            </div>
          </article>
          {dataGovernanceItems.map((item) => (
            <article className="archive-governance-note" key={item}>
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>

      <Link className="archive-floating-data" href="/chat">
        <Database size={18} />
        Access Raw Data
      </Link>
      <ArchiveFooter />
    </ArchiveShell>
  );
}
