import { DataTablesEnvelope, EventsParam } from "@/components/type/Datatables";
import { ApiMenu, NavItem } from "@/components/type/MenuType";
import Url from "@/Uri/url";
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


/**
 * Normalisasi nomor Indonesia menjadi format tel: +62XXXXXXXXXX
 * - Menghapus spasi, titik, dash, tanda kurung.
 * - Menangani awalan +62, 62, atau 0 (Indosat/Telkomsel, dll).
 * - Mengembalikan string "tel:+62..." jika valid, atau null jika tidak valid.
 */
export function toTelHref(raw: string): string | null {
  if (!raw) return null;

  // 1) Trim dan buang karakter non-digit kecuali tanda +
  const trimmed = raw.trim();

  // Simpan apakah ada plus di paling depan
  const hasPlus = trimmed.startsWith('+');

  // Ambil hanya digit
  const digits = trimmed.replace(/[^\d]/g, '');

  if (!digits) return null;

  let e164 = '';

  // 2) Normalisasi ke E.164 (Indonesia: kode negara 62)
  // Kasus-kasus umum:
  //  - +62 851-8258-3624  => digits: 6285182583624 (hasPlus = true)  -> +62...
  //  - 62 851 8258 3624   => digits: 6285182583624                   -> +62...
  //  - 0851 8258 3624     => digits: 085182583624                    -> +6285182583624
  if (hasPlus) {
    // Jika input sudah memakai plus (mis. "+62...")
    if (digits.startsWith('62')) {
      e164 = '+' + digits;
    } else {
      // Jika pakai plus tapi bukan 62, tetap kembalikan +digits (lebih general)
      e164 = '+' + digits;
    }
  } else {
    if (digits.startsWith('62')) {
      e164 = '+' + digits;
    } else if (digits.startsWith('0')) {
      // Buang '0' lalu ganti jadi +62
      e164 = '+62' + digits.slice(1);
    } else {
      // Tidak ada 0/62; asumsikan sudah nomor nasional tanpa leading 0 → prepend +62
      // Misal "85182583624" -> +6285182583624
      e164 = '+62' + digits;
    }
  }

  // 3) Validasi ringan (opsional): panjang wajar nomor seluler Indonesia 10–13 digit setelah +62
  // Catatan: ini hanya sanity check ringan—kebutuhan validasi bisa berbeda.
  const national = e164.replace(/^\+62/, '');
  if (national.length < 7 || national.length > 13) {
    // Kalau ingin lebih longgar, hilangkan check ini atau sesuaikan rentangnya
    // return null;
  }

  // 4) Kembalikan href tel:
  return `tel:${e164}`;
}


// Helper Untuk Fetch Data
export function getToken() {
  // Sesuaikan kalau pakai Sanctum/JWT.
  return localStorage.getItem("access_token");
}


export async function fetchJson<T>(path: string, method?: string, body?: BodyInit, init?: RequestInit): Promise<T> {
  // const token = getToken();
  // const headers: HeadersInit = {
  //   Accept: "application/json",
  //   ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
  //   ...(token ? { Authorization: `Bearer ${token}` } : {}),
  //   ...init?.headers,
  // };
  const token = `Bearer ${atob(localStorage.getItem('access_token'))}`;


  const res = await fetch(`${path}`, { ...init, method: method, body: body, headers: { "Authorization": token } });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  localStorage.setItem('access_token', btoa(res.headers.get('token')));
  return res.json();
}

export function fmtDateTimeIndo(input?: string | null) {
  if (!input) return "-";

  // Parsing input (ISO atau "YYYY-MM-DD HH:mm:ss")
  const d = new Date((input ?? "").replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return input as string;

  const bulanIndo = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const pad = (n: number) => String(n).padStart(2, "0");

  const tanggal = d.getDate();
  const bulan = bulanIndo[d.getMonth()];
  const tahun = d.getFullYear();

  const jam = pad(d.getHours());
  const menit = pad(d.getMinutes());
  const detik = pad(d.getSeconds());

  return `${tanggal} ${bulan} ${tahun} ${jam}:${menit}:${detik}`;
}


export const isRegistrationOpen = (
  nowTs: number,
  openStr?: string | null,
  closeStr?: string | null
) => {
  const openDate = parseLocal(openStr);
  const closeDate = parseLocal(closeStr);

  if (!openDate || !closeDate) return false;

  const now = nowTs;

  return now >= openDate.getTime() && now <= closeDate.getTime();
};


export function parseLocal(input?: string | null) {
  if (!input) return null;

  return new Date(input.replace(" ", "T"));
}

export function getRemaining(nowTs: number, closeStr?: string | null) {
  const parsed = parseLocal(closeStr);

  if (!parsed) return null; // ✅ FIX

  const closeTs = parsed.getTime();
  const diff = closeTs - nowTs;

  if (diff <= 0) return null;

  const s = Math.floor(diff / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;

  return { d, h, m, sec, closeTs };
}


export function isOpen(nowTs: number, closeStr: string) {
  return nowTs <= parseLocal(closeStr).getTime();
}


export function decodeHtmlEntities(s: string) {
  return s.replace('&amp;', '&').replace('&amp;', '&').replace('&amp;', '&').replace('&amp;', '&').replace('&amp;', '&').replace('&amp;', '&')
    .replace('&lt;', '<').replace('&lt;', '<').replace('&lt;', '<').replace('&lt;', '<').replace('&lt;', '<').replace('&lt;', '<')
    .replace('&gt;', '>').replace('&gt;', '>').replace('&gt;', '>').replace('&gt;', '>').replace('&gt;', '>').replace('&gt;', '>')
    .replace('&quot;', '"').replace('&quot;', '"').replace('&quot;', '"').replace('&quot;', '"').replace('&quot;', '"').replace('&quot;', '"')
    .replace('&#39;', "'").replace('&#39;', "'").replace('&#39;', "'").replace('&#39;', "'").replace('&#39;', "'").replace('&#39;', "'");
}

function buildQueryGeneric(params: any) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.perPage) qs.set("per_page", String(params.perPage));
  if (params.search) qs.set("search", params.search);
  if (params.sortBy) qs.set("sort", params.sortBy);
  if (params.sortOrder) qs.set("order", params.sortOrder);
  return `?${qs.toString()}`;
}

function buildQueryDataTables(params: any, columns: string[]) {
  const qs = new URLSearchParams();
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 10;
  const start = (page - 1) * perPage;
  qs.set("draw", "1");
  qs.set("start", String(start));
  qs.set("length", String(perPage));
  if (params.search) qs.set("search[value]", params.search);

  const colIndex = Math.max(0, columns.indexOf(params.sortBy));
  qs.set("order[0][column]", String(colIndex));
  qs.set("order[0][dir]", params.sortOrder ?? "asc");

  columns.forEach((c, idx) => {
    qs.set(`columns[${idx}][data]`, c);
    qs.set(`columns[${idx}][name]`, c);
    qs.set(`columns[${idx}][searchable]`, "true");
    qs.set(`columns[${idx}][orderable]`, "true");
    qs.set(`columns[${idx}][search][value]`, "");
    qs.set(`columns[${idx}][search][regex]`, "false");
  });

  return `?${qs.toString()}`;
}

export async function fetchPortfolio(params: any, columns: string[], datatables_query: boolean, url: string, methods: string) {
  const query = datatables_query ? buildQueryDataTables(params, columns) : buildQueryGeneric(params);
  const res = await fetchJson<DataTablesEnvelope<any>>(`${url}${query}`, methods);
  const total = res.recordsFiltered ?? res.recordsTotal ?? res.data.length;
  const perPage = params.perPage ?? 10;
  const page = params.page ?? 1;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(total, page * perPage);
  return {
    data: res.data,
    meta: {
      current_page: page,
      from,
      last_page: lastPage,
      per_page: perPage,
      to,
      total,
    },
    envelope: res,
  };
}


// Absensi
type Datum = { name: string; value: number };

export const MAX_LEGEND = 12; // tampilkan 12 teratas + "Lainnya". Ubah ke null utk semua.

export function buildTopNWithOthers(data: Datum[], topN?: number) {
  if (!topN || data.length <= topN) return data;
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const head = sorted.slice(0, topN);
  const tailSum = sorted.slice(topN).reduce((s, d) => s + (Number(d.value) || 0), 0);
  return tailSum > 0 ? [...head, { name: "Lainnya", value: tailSum }] : head;
}

export function percentLabel(data: Datum[]) {
  const total = data.reduce((s, d) => s + (Number(d.value) || 0), 0) || 1;
  return (entry: Datum) => {
    const pct = (Number(entry.value) / total) * 100;
    return pct >= 6 ? `${entry.name} (${pct.toFixed(0)}%)` : ""; // tampilkan jika >=6%
  };
}

export function shuffleArray(array: any) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}


// Color Chart
// Hijau → Oranye → Kuning → Biru → Ungu
export const COLORS_Chart = [
  // 1
  "#4caf50", "#ff5722", "#ffc107", "#2196f3", "#9c27b0",
  // 2
  "#64B85F", "#E26F22", "#EDC03F", "#469EE0", "#9A62C7",
  // 3
  "#5DB058", "#DB661E", "#E8B93A", "#3F96D9", "#925ABF",
  // 4
  "#57A851", "#D45E1A", "#E3B235", "#388ED2", "#8A52B7",
  // 5
  "#51A04B", "#CD5617", "#DEAB30", "#3186CB", "#824AAF",
  // 6
  "#4A9845", "#C64E13", "#D9A42B", "#2A7EC4", "#7A42A7",
  // 7
  "#44903F", "#BF460F", "#D49D26", "#2376BD", "#723A9F",
  // 8
  "#3E883A", "#B83E0C", "#CF9621", "#1C6EB6", "#6A3297",
  // 9
  "#78C774", "#B03709", "#CA8F1C", "#1566AF", "#622A8F",
  // 10
  "#82CE81", "#A83006", "#C58817", "#0E5EA8", "#5A2287",
  // 11
  "#5CA864", "#F08A3D", "#F6D15A", "#62B3EB", "#B27CD8",
  // 12
  "#559E5D", "#F49753", "#F8D96E", "#78C0EF", "#BB88DD",
  // 13
  "#4E9556", "#F6A468", "#F9E182", "#8FCDF3", "#C493E2",
  // 14
  "#478C4F", "#F7B27D", "#FAEA96", "#A5DAF7", "#CD9EE7",
  // 15
  "#409349", "#F7BF92", "#FBF2AA", "#BBE7FB", "#D6AAEC",
  // 16
  "#89D391", "#E87A2F", "#E8BE3B", "#3E8DC8", "#8E57BC",
  // 17
  "#7BC984", "#DD6F29", "#E0B636", "#377FC0", "#844FB3",
  // 18
  "#6EBF78", "#D36723", "#D8AE31", "#3071B7", "#7A47AA",
  // 19
  "#62B56C", "#C85F1D", "#D0A62C", "#2963AF", "#703FA1",
  // 20
  "#58AB61", "#BE5718", "#C89E27", "#2255A7", "#663798"
];

