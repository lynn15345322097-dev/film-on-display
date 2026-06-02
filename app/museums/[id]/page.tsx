import Link from "next/link";
import { notFound } from "next/navigation";

import { ArchiveFooter, ArchiveShell } from "@/components/archive/shell";
import { getAllMuseums, getMuseumById } from "@/lib/museums";

export function generateStaticParams() {
  return getAllMuseums().map((museum) => ({ id: museum.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const museum = getMuseumById(id);

  if (!museum) {
    notFound();
  }

  const verificationStatus = museum.geo?.coordinate_source ?? "pending_verification";
  const latitude = museum.geo?.latitude ?? museum.coordinates?.[0] ?? null;
  const longitude = museum.geo?.longitude ?? museum.coordinates?.[1] ?? null;

  return (
    <ArchiveShell asideMode="map">
      <section className="archive-page-hero">
        <span>MUSEUM RECORD</span>
        <h1>{museum.name_zh}</h1>
        <p>{museum.name_en}</p>
      </section>
      <section className="archive-page-grid two">
        <article className="archive-page-panel">
          <h2>空间信息</h2>
          <ul>
            <li>ID：{museum.id}</li>
            <li>省份：{museum.province}</li>
            <li>城市：{museum.city}</li>
            <li>地址：{museum.address}</li>
            <li>空间类型：{museum.classification?.type ?? museum.type}</li>
            <li>机构属性：{museum.classification?.nature ?? museum.nature}</li>
          </ul>
          <Link className="archive-primary-action" href="/map">
            返回地图
          </Link>
        </article>
        <article className="archive-page-panel">
          <h2>坐标状态</h2>
          <ul>
            <li>latitude：{latitude ?? "null"}</li>
            <li>longitude：{longitude ?? "null"}</li>
            <li>coordinate_system：{museum.geo?.coordinate_system ?? "unknown"}</li>
            <li>verification_status：{verificationStatus}</li>
            <li>{verificationStatus === "pending_verification" ? "坐标待核验" : "坐标已进入地图渲染条件"}</li>
          </ul>
        </article>
      </section>
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
      <ArchiveFooter />
    </ArchiveShell>
  );
}
