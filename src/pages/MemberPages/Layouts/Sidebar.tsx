import React, { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ChevronDown,
  User,
  FileUser,
  Settings,
  Calendar1,
  type LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMenuMember } from "@/hooks/menuMember";
import { ApiMenuResponse, ApiNode, MenuItem } from "@/components/type/MemuMemberType";

/* =========================
 * 2) Helpers: normalizer, parser, icon map
 * ========================= */

function hasActiveDescendant(item: MenuItem, pathname: string): boolean {
  // cocokkan leaf
  if (item.to && pathEquals(item.to, pathname)) return true;
  // cek anak-anak
  if (item.children) {
    return item.children.some(child => hasActiveDescendant(child, pathname));
  }
  return false;
}

function normalizeUrl(url?: string | null): string | null {
  if (!url) return null;
  let u = url.trim();
  if (!u.startsWith("/")) u = `/${u}`;
  // Optional: convert {id} -> :id so we can pattern-match with actual pathname
  u = u.replace(/{(\w+)}/g, JSON.parse(localStorage.getItem('data_user')).username);
  return u;
}

function parseActions(action?: string | null): string[] {
  if (!action) return [];
  return action
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// Map icon string dari backend → lucide-react icon
const ICON_MAP: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  event: Calendar1,
  users: Users,
  settings: Settings,
  user: User,
  "file-user": FileUser,
};

function mapIcon(name?: string | null): LucideIcon | undefined {
  if (!name) return undefined;
  const key = name.toLowerCase().replace(/\s+/g, "-");
  return ICON_MAP[key];
}

/* =========================
 * 3) Mapper API → MenuItem[]
 * ========================= */
function mapNode(node: ApiNode): MenuItem {
  const to = normalizeUrl(node.route?.url ?? null);

  const mapped: MenuItem = {
    uuid: node.uuid,
    label: node.name,
    icon: mapIcon(node.icon ?? undefined),
    to,
    actions: parseActions(node.action),
    method: node.route?.method ?? null,
    routesExtra: (node.routes || []).map((r) => ({
      name: r.name,
      url: normalizeUrl(r.url),
      method: r.method,
    })),
    order: node.order ?? 0,
    children: (node.children || []).map(mapNode),
  };

  if (mapped.children && mapped.children.length > 0) {
    mapped.children.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }
  return mapped;
}

function mapMenuFromApi(api: ApiMenuResponse | null | undefined): MenuItem[] {
  if (!api?.data) return [];
  const res = api.data.map(mapNode);
  res.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return res;
}

/* =========================
 * 4) useAccordion hook (state open/close generik)
 * ========================= */
function useAccordion(defaultOpenIds: string[] = []) {
  const [openIds, setOpenIdsState] = useState<Set<string>>(
    new Set(defaultOpenIds)
  );

  const toggle = useCallback((id: string) => {
    setOpenIdsState((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const isOpen = useCallback((id: string) => openIds.has(id), [openIds]);

  // Setter langsung menerima Set agar bisa diisi hasil perhitungan ancestors
  const setOpenIds = useCallback((ids: Set<string>) => {
    setOpenIdsState(new Set(ids));
  }, []);

  return { openIds, isOpen, toggle, setOpenIds };
}

/* =========================
 * 5) Path helpers: cocokkan placeholder :id
 * ========================= */
function pathEquals(to: string, pathname: string): boolean {
  const normTo = to.trim().toLowerCase();
  const normPath = pathname.trim().toLowerCase();

  if (normTo === normPath) return true;

  const toParts = normTo.split("/").filter(Boolean);
  const pathParts = normPath.split("/").filter(Boolean);
  if (toParts.length !== pathParts.length) return false;

  for (let i = 0; i < toParts.length; i++) {
    const a = toParts[i];
    const b = pathParts[i];
    if (a.startsWith(":")) continue; // placeholder segmen apa pun
    if (a !== b) return false;
  }
  return true;
}

function findAncestorsForPath(
  items: MenuItem[],
  pathname: string,
  trail: string[] = []
): string[] | null {
  for (const it of items) {
    const nextTrail = [...trail, it.uuid];

    if (it.to && pathEquals(it.to, pathname)) {
      return nextTrail; // ketemu leaf
    }

    if (it.children && it.children.length > 0) {
      const res = findAncestorsForPath(it.children, pathname, nextTrail);
      if (res) return res;
    }
  }
  return null;
}

/* =========================
 * 6) Item komponen (leaf)
 * ========================= */
function LeafItem({
  to,
  icon: Icon,
  label,
  paddingLeft,
}: {
  to: string;
  icon?: LucideIcon;
  label: string;
  paddingLeft: number;
}) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        [
          "flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-sidebar-accent",
          isActive ? "bg-sidebar-accent text-foreground" : "text-sidebar-foreground",
        ].join(" ")
      }
      style={{ paddingLeft }}
      aria-label={label}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span className="transition-transform duration-300 group-hover:translate-x-0.5">
        {label}
      </span>
    </NavLink>
  );
}

/* =========================
 * 7) SidebarItem rekursif (Group + Leaf)
 * ========================= */
const groupVariants = {
  initial: { height: 0, opacity: 0 },
  animate: { height: "auto", opacity: 1 },
  exit: { height: 0, opacity: 0 },
};

function SidebarItem({
  item,
  depth = 0,
  isOpen,
  toggle,
  currentPath, // <-- tambahan
}: {
  item: MenuItem;
  depth?: number;
  isOpen: (id: string) => boolean;
  toggle: (id: string) => void;
  currentPath: string; // <-- tambahan
}) {
  const paddingLeft = 12 + depth * 16;
  const Icon = item.icon;

  const isGroup = !!(item.children && item.children.length > 0);

  if (isGroup) {
    const opened = isOpen(item.uuid);
    const activeGroup = hasActiveDescendant(item, currentPath); // <-- aktif jika ada anak aktif

    return (
      <div className="space-y-1">
        <button
          className={[
            "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm hover:bg-sidebar-accent",
            activeGroup ? "bg-sidebar-accent text-foreground" : "text-sidebar-foreground",
          ].join(" ")}
          style={{ paddingLeft }}
          onClick={() => toggle(item.uuid)}
          aria-expanded={opened}
          aria-controls={`grp-${item.uuid}`}
        >
          <span className="flex items-center gap-3">
            {Icon && <Icon className="w-4 h-4" />}
            {item.label}
          </span>
          <motion.span animate={{ rotate: opened ? 180 : 0 }}>
            <ChevronDown className="w-4 h-4" />
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {opened && (
            <motion.div
              id={`grp-${item.uuid}`}
              key={`grp-${item.uuid}`}
              variants={groupVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="space-y-1">
                {item.children!.map((child) => (
                  <SidebarItem
                    key={child.uuid}
                    item={child}
                    depth={depth + 1}
                    isOpen={isOpen}
                    toggle={toggle}
                    currentPath={currentPath} // <-- teruskan
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // === Leaf ===
  if (item.to) {
    return (
      <LeafItem
        to={item.to}
        icon={Icon}
        label={item.label}
        paddingLeft={paddingLeft}
      />
    );
  }

  // === Inert / Label-only ===
  // Opsi A (disembunyikan):
  return null;

  // Opsi B (tampilkan non-klik):
  // return (
  //   <div
  //     className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground opacity-70 cursor-default"
  //     style={{ paddingLeft }}
  //     aria-label={item.label}
  //   >
  //     {Icon && <Icon className="w-4 h-4" />}
  //     {item.label}
  //   </div>
  // );
}

/* =========================
 * 8) Sidebar utama
 * ========================= */
export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { data: apiResponse, isLoading, error } = useMenuMember(); // EXPECT: ApiMenuResponse
  const menu = useMemo(() => mapMenuFromApi(apiResponse), [apiResponse]);

  const { isOpen, toggle, setOpenIds } = useAccordion();
  const location = useLocation();
  const currentPath = location.pathname;

  // Auto-open parent chain untuk route aktif
  useEffect(() => {
    if (!menu || menu.length === 0) return;
    const pathname = location.pathname || "";
    const ancestors = findAncestorsForPath(menu, pathname);
    if (ancestors && ancestors.length > 0) {
      // buka semua parent group (kecuali leaf terakhir bila leaf)
      const onlyGroups = new Set(ancestors.slice(0, -1));
      setOpenIds(onlyGroups);
    }
  }, [menu, location.pathname, setOpenIds]);


  return (
    <aside
      className={`border-r bg-sidebar p-4 md:p-6 md:sticky md:top-16 md:h-[calc(100vh-64px)]
                  overflow-y-auto ${open ? "block" : "hidden"} md:block`}
    >
      {/* Entrance animation */}
      <motion.div
        initial={{ x: -16, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
        className="space-y-1"
      >
        {isLoading && (
          <div className="text-sm text-muted-foreground px-3 py-2">Loading menu…</div>
        )}
        {error && (
          <div className="text-sm text-red-500 px-3 py-2">Gagal memuat menu</div>
        )}


        {!isLoading &&
          menu.map((item) => (
            <SidebarItem
              key={item.uuid}
              item={item}
              isOpen={isOpen}
              toggle={toggle}
              currentPath={currentPath}   // <-- kirimkan path aktif
            />
          ))}
      </motion.div>

      {/* Overlay untuk mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
    </aside>
  );
}