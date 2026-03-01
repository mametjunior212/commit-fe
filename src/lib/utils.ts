import { ApiMenu, NavItem } from "@/components/type/MenuType";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// src/utils/menuMapping.ts

const sortByOrderThenName = (a: ApiMenu, b: ApiMenu) => {
  if (a.order !== b.order) return a.order - b.order;
  return a.name.localeCompare(b.name);
};

const toTwoDigits = (n: number) => String(n).padStart(2, '0');

export function mapApiToNav(items: ApiMenu[], level = 0): NavItem[] {
  const sorted = [...items].sort(sortByOrderThenName);
  return sorted.map((item, idx) => ({
    uuid: item.uuid,
    name: item.name,
    href: item.route?.url ?? null,
    number: toTwoDigits(idx + 1),
    children: item.children?.length ? mapApiToNav(item.children, level + 1) : [],
  }));
}