import { Archive, Beaker, Film, FolderOpen, MapPinned, Volume2 } from "lucide-react";
import { ReactNode } from "react";

import { ArchiveNav } from "./nav";

const indexItems = [
  { icon: FolderOpen, label: "全部展示空间", active: true },
  { icon: Film, label: "电影博物馆" },
  { icon: MapPinned, label: "档案与学术机构" },
  { icon: Volume2, label: "制片厂旧址" },
  { icon: Beaker, label: "民间收藏空间" },
];

export async function ArchiveShell({
  children,
  asideMode = "index",
  isSignedIn = false,
}: {
  children: ReactNode;
  asideMode?: "index" | "map" | "profile";
  isSignedIn?: boolean;
}) {
  return (
    <div className="archive-app-shell">
      <ArchiveNav isSignedIn={isSignedIn} />
      <aside className="archive-sidebar">
        <div className="archive-sidebar-title">
          <h2>ARCHIVAL INDEX</h2>
          <p>Systematic Classification</p>
        </div>
        {asideMode === "map" ? <MapFilters /> : <IndexFilters />}
        <button className="archive-filter-button" type="button">
          FILTER DATA
        </button>
      </aside>
      <main className="archive-main">{children}</main>
    </div>
  );
}

function IndexFilters() {
  return (
    <nav className="archive-index-list" aria-label="Archive index">
      {indexItems.map((item) => {
        const Icon = item.icon;
        return (
          <button className={item.active ? "active" : undefined} key={item.label} type="button">
            <Icon size={18} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function MapFilters() {
  return (
    <div className="archive-map-filters">
      <section>
        <label>Space Type</label>
        {["电影博物馆", "影像档案", "制片厂旧址", "民间收藏"].map((item, index) => (
          <button className={index === 0 ? "active" : undefined} key={item} type="button">
            <FolderOpen size={18} />
            {item}
          </button>
        ))}
      </section>
      <section>
        <label htmlFor="region">Region</label>
        <select id="region">
          <option>全国</option>
          <option>北京</option>
          <option>上海</option>
          <option>广东</option>
          <option>四川</option>
        </select>
      </section>
    </div>
  );
}

export function ArchiveFooter() {
  return (
    <footer className="archive-footer">
      <div>
        <strong>FILM ON DISPLAY</strong>
        <p>© 2026 Film on Display. Digital Humanities Research Archive.</p>
      </div>
      <nav>
        <a href="#">Rights Management</a>
        <a href="#">Contribution Guidelines</a>
        <a href="#">Institutional Credits</a>
        <a href="#">Metadata Schema</a>
      </nav>
      <Archive size={18} />
    </footer>
  );
}
