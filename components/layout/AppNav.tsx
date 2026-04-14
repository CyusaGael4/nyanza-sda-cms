"use client";

import type { Route } from "next";
import { usePathname } from "next/navigation";
import { LoadingLink } from "@/components/NavigationProgress";
import { hasPermission } from "@/lib/permissions";
import { Permissions, UserRole } from "@/types";

const links: { href: Route; label: string; permission: keyof Permissions }[] = [
  { href: "/dashboard", label: "Ahabanza", permission: "dashboard" },
  { href: "/members", label: "Abanyamuryango", permission: "members" },
  { href: "/attendance", label: "Ubwitabire", permission: "attendance" },
  { href: "/groups", label: "Amatsinda", permission: "groups" },
  { href: "/announcements", label: "Amatangazo", permission: "announcements" },
  { href: "/finance", label: "Amaturo", permission: "finance" },
  { href: "/users", label: "Abakoresha", permission: "users" }
];

export function AppNav({
  user
}: {
  user:
    | {
        role: UserRole;
        permissions: Permissions;
      }
    | null;
}) {
  const pathname = usePathname();

  return (
    <nav className="nav" aria-label="Ibyiciro bya sisitemu">
      {links
        .filter(
          (link) =>
            hasPermission(user, link.permission) &&
            !(link.href === "/users" && user?.role !== "super_admin")
        )
        .map((link) => (
          <LoadingLink
            key={link.href}
            href={link.href}
            className={pathname.startsWith(link.href) ? "active" : ""}
          >
            {link.label}
          </LoadingLink>
        ))}
    </nav>
  );
}
