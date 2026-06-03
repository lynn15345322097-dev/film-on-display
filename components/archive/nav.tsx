"use client";

import { Archive, Bot, Globe2, Search, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "首页", active: (pathname: string) => pathname === "/" },
  { href: "/map", label: "地图", active: (pathname: string) => pathname.startsWith("/map") },
  { href: "/photos", label: "照片档案", active: (pathname: string) => pathname.startsWith("/photos") },
  {
    href: "/exhibitions",
    label: "主题展览",
    active: (pathname: string) => pathname.startsWith("/exhibitions"),
  },
  {
    href: "/spatial-analysis",
    label: "空间分析",
    active: (pathname: string) => pathname.startsWith("/spatial-analysis"),
  },
  { href: "/method", label: "方法", active: (pathname: string) => pathname.startsWith("/method") },
  { href: "/about", label: "关于", active: (pathname: string) => pathname.startsWith("/about") },
  {
    href: "/account",
    label: "用户中心",
    active: (pathname: string) => pathname.startsWith("/account"),
  },
];

export function ArchiveNav({ isSignedIn }: { isSignedIn: boolean }) {
  const pathname = usePathname();

  return (
    <header className="archive-topbar">
      <Link className="archive-brand" href="/">
        影迹图谱 <span>FilmGeo Atlas</span>
      </Link>
      <nav className="archive-navlinks" aria-label="Main navigation">
        {navItems.map((item) => {
          const isActive = item.active(pathname);
          return (
            <Link
              className={isActive ? "active" : undefined}
              href={item.href}
              key={`${item.label}-${item.href}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="archive-top-actions">
        <button aria-label="Language" className="archive-icon-button" type="button">
          <Globe2 size={18} />
        </button>
        <button aria-label="Search" className="archive-icon-button" type="button">
          <Search size={18} />
        </button>
        {isSignedIn ? (
          <Link className="archive-account-link" href="/account">
            <UserRound size={16} />
            Center
          </Link>
        ) : (
          <Link className="archive-primary-action" href="/auth/login">
            <Archive size={16} />
            Login
          </Link>
        )}
        <Link className="archive-primary-action archive-chat-shortcut" href="/chat">
          <Bot size={16} />
          Workbench
        </Link>
      </div>
    </header>
  );
}
