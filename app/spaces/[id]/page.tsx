import Link from "next/link";
import { notFound } from "next/navigation";

import { ArchiveFooter, ArchiveShell } from "@/components/archive/shell";
import {
  getAllMuseums,
  getExhibitionsByMuseum,
  getMuseumById,
  getPhotosByMuseum,
} from "@/lib/museums";

export function generateStaticParams() {
  return getAllMuseums().map((museum) => ({ id: museum.id }));
}

const CLASSIFICATION_LABELS: Record<string, string> = {
  "国家级专题博物馆": "综合性电影博物馆",
  "国家": "综合性电影博物馆",
  "省级电影博物馆": "省级电影博物馆",
  "市级电影博物馆": "市级电影博物馆",
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
  "专题博物馆": "专题博物馆",
};

const VERIFICATION_LABELS: Record<string, string> = {
  pending_verification: "坐标待核验",
  gps_field_measurement: "GPS 实地测量",
  geocoding_from_address: "地址地理编码",
  manual_estimation: "人工估算",
  third_party_source: "第三方数据来源",
};

function classificationLabel(type: string): string {
  return CLASSIFICATION_LABELS[type] ?? type;
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const museum = getMuseumById(id);

  if (!museum) {
    notFound();
  }

  const photos = getPhotosByMuseum(museum.id);
  const exhibitions = getExhibitionsByMuseum(museum.id);
  const verificationStatus = museum.geo?.coordinate_source ?? "pending_verification";
  const latitude = museum.geo?.latitude ?? museum.coordinates?.[0] ?? null;
  const longitude = museum.geo?.longitude ?? museum.coordinates?.[1] ?? null;
  const hasCoordinates = typeof latitude === "number" && typeof longitude === "number";
  const canRenderOnMap = hasCoordinates && verificationStatus !== "pending_verification";
  const typeLabel = classificationLabel(museum.classification?.type ?? museum.type);

  return (
    <ArchiveShell asideMode="map">
      {/* ── Hero ── */}
      <section className="archive-page-hero">
        <span>SPACE ARCHIVE</span>
        <h1>{museum.name_zh}</h1>
        <p>{museum.name_en}</p>
      </section>

      {/* ── Core info grid ── */}
      <section className="archive-page-grid two">
        <article className="archive-page-panel">
          <h2>空间信息</h2>
          <dl className="space-dl">
            <div>
              <dt>ID</dt>
              <dd>{museum.id}</dd>
            </div>
            <div>
              <dt>省份</dt>
              <dd>{museum.province}</dd>
            </div>
            <div>
              <dt>城市</dt>
              <dd>{museum.city}</dd>
            </div>
            <div>
              <dt>地址</dt>
              <dd>{museum.address}</dd>
            </div>
            <div>
              <dt>空间类型</dt>
              <dd>{typeLabel}</dd>
            </div>
            <div>
              <dt>机构属性</dt>
              <dd>{museum.classification?.nature ?? museum.nature}</dd>
            </div>
          </dl>
        </article>

        <article className="archive-page-panel">
          <h2>坐标信息</h2>
          <dl className="space-dl">
            <div>
              <dt>纬度</dt>
              <dd>{latitude ?? "—"}</dd>
            </div>
            <div>
              <dt>经度</dt>
              <dd>{longitude ?? "—"}</dd>
            </div>
            <div>
              <dt>坐标系统</dt>
              <dd>{museum.geo?.coordinate_system ?? "unknown"}</dd>
            </div>
            <div>
              <dt>核验状态</dt>
              <dd>
                <span
                  className={`verification-badge ${
                    verificationStatus === "pending_verification" ? "badge-pending" : "badge-verified"
                  }`}
                >
                  {VERIFICATION_LABELS[verificationStatus] ?? verificationStatus}
                </span>
              </dd>
            </div>
            {canRenderOnMap && (
              <div>
                <dt>在地图中定位</dt>
                <dd>
                  <Link className="archive-inline-action" href={`/map?focus=${museum.id}`}>
                    在地图中查看 →
                  </Link>
                </dd>
              </div>
            )}
          </dl>
        </article>
      </section>

      {/* ── Tags ── */}
      {museum.tags.length > 0 && (
        <section className="archive-section">
          <div className="archive-section-heading">
            <h2>研究标签</h2>
            <div />
          </div>
          <div className="archive-tag-cloud">
            {museum.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </section>
      )}

      {/* ── Research context ── */}
      <section className="archive-section">
        <div className="archive-section-heading">
          <h2>研究说明</h2>
          <div />
        </div>
        <div className="archive-governance-grid">
          <article className="archive-governance-card wide">
            <h3>空间观察</h3>
            <p>{museum.spaceObservation}</p>
          </article>
          <article className="archive-governance-card wide">
            <h3>展陈分析</h3>
            <p>{museum.exhibitionAnalysis}</p>
          </article>
        </div>
      </section>

      {/* ── Associated exhibitions ── */}
      {exhibitions.length > 0 && (
        <section className="archive-section">
          <div className="archive-section-heading">
            <h2>关联展厅 / 主题展线</h2>
            <div />
          </div>
          <div className="archive-route-grid">
            {exhibitions.map((exhibition) => (
              <article key={exhibition.id}>
                <h3>{exhibition.title_zh}</h3>
                <p>{exhibition.subtitle_zh}</p>
                <small>{exhibition.chapters.length} 个章节 · {exhibition.museum_ids.length} 个关联空间</small>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ── Associated photos ── */}
      {photos.length > 0 && (
        <section className="archive-section">
          <div className="archive-section-heading">
            <h2>关联照片</h2>
            <div />
          </div>
          <p className="archive-section-note">
            {photos.length} 张田野照片已归档，默认仅公开缩略图（public_thumbnail_only）。
          </p>
          <div className="archive-photo-mini-grid">
            {photos.slice(0, 8).map((photo) => (
              <article key={photo.id} className="photo-mini-card">
                <span className="photo-mini-type">{photo.metadata.object_type}</span>
                <h4>{photo.metadata.title_zh}</h4>
                <p>{photo.metadata.description}</p>
                <footer>
                  <small>拍摄：{photo.metadata.photographer}</small>
                  <small>{photo.metadata.shooting_date}</small>
                </footer>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ── Back links ── */}
      <section className="archive-section">
        <div className="space-back-links">
          <Link className="archive-primary-action" href="/map">
            ← 返回地图
          </Link>
          <Link className="archive-secondary-action" href="/spatial-analysis">
            空间分析 →
          </Link>
        </div>
      </section>

      <ArchiveFooter />
    </ArchiveShell>
  );
}
