
// ---------------- CONFIG ----------------
const TOTAL_PESERTA = 500; // total keseluruhan peserta (ubah sesuai kebutuhan)
const JUMLAH_ROLE = 99;    // pastikan COLORS_ROLES punya 99 warna

// Komposisi kehadiran (jumlah harus ~100%)
const PERSEN_KEHADIRAN = {
    Hadir: 0.78,
    Izin: 0.06,
    Sakit: 0.05,
    Cuti: 0.04,
    WFH: 0.05,
    Alfa: 0.02,
} as const;

// ---------------- HELPERS ----------------
// Pembulatan proporsi agar total tepat sama (Largest Remainder Method)
function splitTotalByPercent(
    total: number,
    dict: Record<string, number>
): { name: string; value: number }[] {
    const keys = Object.keys(dict);
    const raws = keys.map((k) => ({ k, raw: dict[k] * total }));
    const floors = raws.map((r) => Math.floor(r.raw));
    let remainder = total - floors.reduce((a, b) => a + b, 0);

    const order = raws
        .map((r, i) => ({ i, frac: r.raw - Math.floor(r.raw) }))
        .sort((a, b) => b.frac - a.frac);

    for (let t = 0; t < remainder; t++) {
        floors[order[t % order.length].i] += 1;
    }

    return keys.map((k, i) => ({ name: k, value: floors[i] }));
}

// Buat 99 role dengan distribusi Zipf-like, total = totalHadir, min 1 per role
function makeRolesProportional(
    n: number,
    totalHadir: number,
    exponent = 1.07 // makin besar → makin curam (role awal lebih dominan)
): { name: string; value: number }[] {
    if (totalHadir < n) {
        throw new Error(
            `totalHadir (${totalHadir}) lebih kecil dari jumlah role (${n}). 
       Naikkan TOTAL_PESERTA atau turunkan persentase "Hadir".`
        );
    }

    // Alokasikan 1 ke setiap role agar tidak ada nilai 0
    const minPerRole = 1;
    let remain = totalHadir - n * minPerRole;

    // Bobot Zipf-like
    const weights = Array.from({ length: n }, (_, i) => 1 / Math.pow(i + 1, exponent));
    const wsum = weights.reduce((a, b) => a + b, 0);

    // Skala ke 'remain' lalu bulatkan dengan largest remainder
    const raws = weights.map((w) => (w / wsum) * remain);
    const floors = raws.map((x) => Math.floor(x));
    let leftover = remain - floors.reduce((a, b) => a + b, 0);

    const order = raws
        .map((x, i) => ({ i, frac: x - Math.floor(x) }))
        .sort((a, b) => b.frac - a.frac);

    for (let t = 0; t < leftover; t++) {
        floors[order[t % order.length].i] += 1;
    }

    // Tambahkan min 1 ke setiap role
    const values = floors.map((v) => v + minPerRole);

    // Nama role: Role 01 .. Role 99 (bisa kamu ganti ke nama real)
    return values.map((v, i) => ({
        name: `Role ${String(i + 1).padStart(2, "0")}`,
        value: v,
    }));
}

// ---------------- DATA OUTPUT ----------------
// 1) Data Kehadiran (sum = TOTAL_PESERTA)
export const attendance = splitTotalByPercent(TOTAL_PESERTA, PERSEN_KEHADIRAN);

// Ambil nilai "Hadir" sebagai total untuk distribusi role
const hadirValue = attendance.find((x) => x.name === "Hadir")?.value ?? 0;

// 2) Data Role (99 item, sum = hadirValue)
export const rolesPresent = makeRolesProportional(JUMLAH_ROLE, hadirValue);
