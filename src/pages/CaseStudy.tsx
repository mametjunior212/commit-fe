import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ArrowRight, Play } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { ViewFull } from '@/components/ViewGallery';
import { Project } from '@/components/type/projectType';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AttendancePie from '@/components/AttendancePie';
import { COLORS_Chart, fmtDateTimeIndo } from '@/lib/utils';
import RegisterPie from '@/components/RegisterPie';
import Url from '@/Uri/url';
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";
import * as Progress from "@radix-ui/react-progress";
import { MenuApiResponse } from '@/components/type/MenuType';
import { sumVotes, useLiveVotes } from './RealtimeVoting';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useDetailEvent } from '@/hooks/useDetailEvent';

// Helper murni (tanpa hooks)
const getProjectById = (list: Project[], uuid?: string) =>
  uuid ? list.find((p) => p.uuid === uuid) : undefined;

type Items = { name: string, value: number };
type isiAbsen = {
  registerRole: Items[]
  registerPT: Items[]
  absenRole: Items[]
  absenPT: Items[]
  updateAt: string
}

const EMPTY_ABSEN: isiAbsen = {
  registerRole: [],
  registerPT: [],
  absenRole: [],
  absenPT: [],
  updateAt: "",
};

function isIsiAbsen(x: any): x is isiAbsen {
  const isArrOfItem = (arr: any) =>
    Array.isArray(arr) &&
    arr.every(
      (r) =>
        r &&
        typeof r === "object" &&
        typeof r.name === "string" &&
        typeof r.value === "number"
    );

  return (
    x &&
    typeof x === "object" &&
    isArrOfItem(x.registerRole) &&
    isArrOfItem(x.registerPT) &&
    isArrOfItem(x.absenRole) &&
    isArrOfItem(x.absenPT)
  );
}

const CaseStudy = () => {
  // ✅ Hooks SELALU di atas dan tanpa syarat
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Kalau tetap pakai getUuidFromPath(), taruh dia DI LUAR hooks

  if (!id) {
    return null; // atau Skeleton
  }

  const { data: apiEvent, isLoading, error } = useDetailEvent(id);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Semua derivasi pakai useMemo, TETAP dipanggil sebelum guard
  const project = useMemo(() => apiEvent, [apiEvent, id]);

  const nextProject = useMemo(
    () => apiEvent?.detailnextProject,
    [apiEvent, project?.detailnextProject]
  );

  const prevProject = useMemo(
    () => project?.detailprevProject,
    [apiEvent, project?.detailprevProject]
  );

  const isVoting = useMemo(
    () => project?.category === "Voting",
    [project?.category]
  );

  const [dataAbsen, setDataAbsen] = useState<isiAbsen>(EMPTY_ABSEN);
  const [loadingAbsen, setLoadingAbsen] = useState(true);
  const [errorAbsen, setErrorAbsen] = useState<string | null>(null);


  useEffect(() => {
    const ac = new AbortController();

    async function fetchAbsen(signal?: AbortSignal): Promise<isiAbsen> {
      // Guard kalau id belum ada
      if (!id) return EMPTY_ABSEN;

      const endpoint = `${Url.Detail_Event ?? ""}${id ?? ""}`;
      const res = await fetch(endpoint, { signal });
      if (!res.ok) {
        throw new Error(`Gagal mengambil data: ${res.status} ${res.statusText}`);
      }
      const json = (await res.json()) as MenuApiResponse;

      // Pastikan json.data sesuai bentuk isiAbsen
      const payload = (json as any)?.data;
      return isIsiAbsen(payload) ? payload : EMPTY_ABSEN;
    }

    setLoadingAbsen(true);
    setErrorAbsen(null);

    fetchAbsen(ac.signal)
      .then((arr) => setDataAbsen(arr))
      .catch((err: any) => {
        if (err?.name === "AbortError") return;
        setErrorAbsen(err?.message ?? "Terjadi kesalahan saat mengambil data.");
        setDataAbsen(EMPTY_ABSEN);
      })
      .finally(() => setLoadingAbsen(false));

    return () => ac.abort();
  }, [Url?.Detail_Event, id]);

  // Helper: filter > 0 + (opsional) sort desc
  const clean = (list: Items[]) =>
    list
      .filter((r) => (r?.value ?? 0) > 0)
      .sort((a, b) => b.value - a.value);

  // derived const
  const registerRole = useMemo(() => clean(dataAbsen.registerRole), [dataAbsen]);
  const registerPT = useMemo(() => clean(dataAbsen.registerPT), [dataAbsen]);
  const absenRole = useMemo(() => clean(dataAbsen.absenRole), [dataAbsen]);
  const absenPT = useMemo(() => clean(dataAbsen.absenPT), [dataAbsen]);

  // Voting
  const { data: dataVoting, isLoading: isLoadingVoting, error: errorVoting, usingSSE, refetch } = useLiveVotes(20000000000, { enabled: false });
  const totalVotes = useMemo(() => sumVotes(dataVoting?.data ?? []), [dataVoting]);
  const totalUsers = dataVoting?.totaluser ?? 0; // NEW: total user aktif dari API
  const votedUsers = useMemo(
    () => Math.min(totalVotes, totalUsers), // NEW: batasi agar tidak melebihi total user
    [totalVotes, totalUsers]
  );

  const lastUpdated = useMemo(() => {
    if (dataVoting?.updatedAt) return new Date(dataVoting.updatedAt);
    return new Date();
  }, [dataVoting?.updatedAt]);

  // enrich with percentage for UI
  const rows = useMemo(() => {
    const items = dataVoting?.data ?? [];
    const total = Math.max(1, totalVotes); // avoid divide-by-zero
    return items
      .slice()
      .sort((a, b) => b.votes - a.votes)
      .map((it, idx) => ({
        ...it,
        percent: (it.votes / total) * 100,
        color: COLORS_Chart[idx % COLORS_Chart.length],
      }));
  }, [dataVoting?.data, totalVotes]);

  // chart mode toggle
  const [chart, setChart] = useState<"bar" | "pie">("bar");

  // subtle pointer reactive effect for the outer wrapper
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = (clientX - left) / width;
    const y = (clientY - top) / height;
    currentTarget.style.setProperty("--mouse-x", x.toString());
    currentTarget.style.setProperty("--mouse-y", y.toString());
  }, []);

  const VIDEO_EXTENSIONS = [".mp4", ".webm", ".ogg", ".ogv", ".mov", ".m4v"];
  const isVideoUrl = (url?: string) => {
    if (!url) return false;
    const lower = url.split("?")[0].toLowerCase();
    return VIDEO_EXTENSIONS.some((ext) => lower.endsWith(ext));
  };

  // ⬇️ Setelah SEMUA hooks dipanggil, baru lakukan guard dan return
  if (isLoading && loadingAbsen) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">Loading…</div>
        <Footer />
      </div>
    );
  }

  if (error && errorAbsen) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">Terjadi kesalahan memuat data.</div>
        <Footer />
      </div>
    );
  }

  if (!project && !dataAbsen) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center min-h-full">
          <div className="text-center">
            <h1 className="text-4xl font-syne font-bold mb-4">Project Not Found</h1>
            <Link to="/" className="text-accent hover:underline flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Return Home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-background selection:bg-accent/20 flex flex-col" >
      < Navigation />
      <Helmet>
        <title>{project?.title ?? ""} | CommIT</title>
        <meta name="description" content={project?.description} />
      </Helmet>

      {/* <CustomCursor /> */}

      {/* Reading Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-accent origin-left z-50"
        style={{ scaleX }
        }
      />

      < main className="flex-1 pt-24 md:pt-32" >
        {/* Swiss Grid Layout Wrapper (Similar to Blog, but adapted for Project) */}
        < div className="container-wide max-w-[90rem] mx-auto px-4 sm:px-6 mb-20" >

          {/* Grid Container */}
          < div className="border border-foreground/10 bg-background relative z-10" >

            {/* 1. Header Grid Row */}
            < div className="grid grid-cols-1 lg:grid-cols-4 border-b border-foreground/10" >
              {/* Breadcrumbs / Back */}
              < div className="col-span-1 lg:col-span-3 p-6 border-b lg:border-b-0 lg:border-r border-foreground/10 flex items-center" >
                <Link to="/event" className="group inline-flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-accent transition-colors">
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  Back to Work
                </Link>
                <span className="mx-4 text-foreground/20">/</span>
                <span className="text-sm text-foreground/40 uppercase tracking-wider">{project?.category}</span>
              </div >

              {/* Year Cell */}
              < div className="col-span-1 p-6 flex items-center justify-between lg:justify-center text-sm font-medium text-foreground/80" >
                <span className="lg:hidden text-foreground/40 uppercase tracking-wider">Year</span>
                <div className="flex items-center gap-2 font-mono">
                  {project?.year}
                </div>
              </div >
            </div >

            {/* 2. Title Section */}
            < div className="grid grid-cols-1 lg:grid-cols-12" >
              <div className="lg:col-span-12 p-6 md:p-12 lg:p-16 border-b border-foreground/10">
                {project?.title && project?.title !== '' && (
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-syne font-bold leading-[0.9] tracking-tight text-foreground uppercase"
                  >
                    {project?.title}
                  </motion.h1>
                )}

                <div className="mt-8 md:mt-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <p className="text-lg md:text-xl text-foreground/60 max-w-4xl leading-relaxed">
                    {project?.description}
                  </p>
                  {project?.category && project?.category !== '' && (
                    <div className="flex items-center gap-3">
                      <div className="px-4 py-2 rounded-full border border-foreground/10 text-xs font-bold uppercase tracking-widest bg-foreground/5">
                        {project?.category}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div >

            {/* 3. Hero Image - Full Grid Width */}
            {
              project?.template == 'Template 1' ?
                (<div className="w-full border-b border-foreground/10 overflow-hidden bg-foreground/5">
                  <motion.div
                    initial={{ scale: 1.05, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="aspect-[21/9] w-full relative"
                  >
                    <img
                      src={import.meta.env.VITE_FONT_END + (project.heroImage ?? '')}
                      alt={project?.title ?? ''}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </motion.div>
                </div>)
                : project?.template == 'Template 2' ? (<>
                  <motion.div
                    initial={{ scale: 1.05, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="aspect-[16/9] w-full relative md:grid md:grid-cols-12 gap-2"
                  >
                    <motion.img
                      src={import.meta.env.VITE_FONT_END + (project.heroImage ?? '')}
                      alt={project?.title ?? ''}
                      className="w-full h-full object-cover md:col-span-8 rounded-lg"
                    />

                    <motion.video
                      src={import.meta.env.VITE_FONT_END + (project.herovideo ?? '')}
                      className="w-full h-full object-cover mt-5 md:mt-0 md:col-span-4 rounded-lg"
                      // autoPlay
                      loop
                      // muted
                      controls={true}
                      controlsList='nodownload'
                    ></motion.video>
                  </motion.div>
                </>)
                  : <></>
            }
            {/* 4. Content Area Split */}
            <div className=" min-h-[50vh]">
              {/* Main Content */}
              <div className="w-full lg:col-span-9 p-6 md:p-12 lg:p-16">
                <motion.article
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="prose prose-lg md:prose-xl max-w-none prose-headings:font-syne prose-headings:font-bold prose-p:text-foreground/80 prose-p:leading-relaxed prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-img:rounded-none prose-img:border prose-img:border-foreground/10"
                >
                  {/* About Section */}
                  {project?.about && project?.about !== '' &&
                    <>
                      <h3 className="text-2xl md:text-3xl font-syne font-bold mb-6">Tentang Event</h3>
                      <p className="mb-12 text-foreground/80 leading-relaxed"
                        style={{ whiteSpace: 'pre-line' }}>
                        {project?.about}
                      </p>
                    </>
                  }

                  {/* Impact / Results Highlight */}
                  {project?.results[0] !== "" ? (
                    <div className="my-16 p-8 border border-foreground/10 bg-foreground/5 rounded-none">
                      <h4 className="text-sm font-bold uppercase tracking-widest text-accent mb-8">Key Results</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose">
                        {project?.results.map((result, i) => (
                          <div key={i}>
                            <span className="block text-4xl md:text-5xl font-syne font-bold mb-2">{result.split(' ')[0]}</span>
                            <span className="text-xs font-mono uppercase tracking-widest text-foreground/60">{result.split(' ').slice(1).join(' ')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : <></>}
                </motion.article>

                {/* Gallery - Visual Archive Layout */}
                {project?.gallery.length !== 0 && (
                  <div className="mt-12">
                    <div className="flex items-end justify-between mb-16">
                      <div>
                        <span className="text-xs font-mono uppercase tracking-widest text-foreground/40 block mb-2">Visual Archive</span>
                        <h3 className="text-3xl font-syne font-bold">Dokumentasi Acara</h3>
                      </div>
                      <span className="hidden md:block text-xs font-mono uppercase tracking-widest text-foreground/40">
                        {project?.gallery.length} Assets Processed
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                      {project?.gallery.map((item: { uuid: string, path: string, alt?: string, grid: string | number, orderBy: number, type: string, hyperlink: string, show_gallery: string }, i: number) => {
                        const isObj = typeof item === 'object' && item !== null;
                        const type = isObj ? item.path : undefined;
                        const poster = isObj ? item.path : undefined;
                        const isHyperlink = item.hyperlink ?? "";
                        const isVideo = type ? item.type === 'video' : isVideoUrl(item.path);

                        const aspectClass = item.grid === 3 || item.grid === "3" ? 'aspect-[21/9]' : item.grid === 2 || item.grid === "2" ? 'aspect-[18.8/9]' : 'aspect-square';
                        if (item.show_gallery == 'y') {
                          return (
                            <ViewFull
                              key={item.uuid}
                              src={isHyperlink !== "" ? isHyperlink : import.meta.env.VITE_FONT_END + item.path}
                              poster={poster}
                              title={project?.title}
                              className={`group ${item.grid === 3 || item.grid === "3" ? 'md:col-span-3' : item.grid === 2 || item.grid === "2" ? 'md:col-span-2' : 'md:col-span-1'} ${aspectClass} relative overflow-hidden rounded-lg cursor-pointer`}
                              renderTrigger={(open) => (
                                <div className={`relative overflow-hidden bg-foreground/5 ${aspectClass}`}>
                                  {isHyperlink !== "" ? (
                                    <iframe
                                      src={isHyperlink}
                                      title={item.type}
                                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    ></iframe>
                                  ) : (isVideo ? (
                                    // Preview video (muted loop) atau cukup poster
                                    // poster ? (
                                    //   <img
                                    //     src={poster}
                                    //     alt={`Gallery video ${i + 1}`}
                                    //     className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    //     loading="lazy"
                                    //   />
                                    // ) : (
                                    <video
                                      src={isHyperlink !== "" ? item.hyperlink : import.meta.env.VITE_FONT_END + item.path}
                                      muted
                                      playsInline
                                      loop
                                      preload="metadata"
                                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    // )
                                  ) : (
                                    <img
                                      src={import.meta.env.VITE_FONT_END + item.path}
                                      alt={`Gallery image ${i + 1}`}
                                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                      loading="lazy"
                                    />
                                  ))}

                                  {/* Overlay button */}
                                  <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={open}
                                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && open()}
                                    data-cursor="view"
                                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer"
                                  >
                                    <div className="px-4 py-2 bg-background text-foreground text-xs font-bold uppercase tracking-widest transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 inline-flex items-center gap-2">
                                      {isVideo ? (
                                        <>
                                          <Play className="w-4 h-4" />
                                          Play Video
                                        </>
                                      ) : (
                                        <>View Full</>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            />
                          );
                        }
                      })}
                    </div>
                  </div>
                )}
                {/* Partner */}
                {project?.partner && project?.partner.length !== 0 && (
                  <motion.div>
                    <div className="flex items-end justify-between mt-16">
                      <div>
                        <h3 className="text-3xl font-syne font-bold">Partner</h3>
                      </div>
                      <span className="hidden md:block text-xs font-mono uppercase tracking-widest text-foreground/40">
                        {project?.partner.length}Partner
                      </span>
                    </div>
                    <motion.div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-10">
                      {project?.partner.map((e: { img: string; partner: string; link: string; }, index: number) => {
                        return <motion.div key={index} className='rounded-xl border-[#f1f0f8] relative min-w-2 border-[3px]'>
                          <motion.img
                            key={index}
                            src={import.meta.env.VITE_FONT_END + e.img}
                            alt={e.partner}
                            className="block w-full h-auto object-cover rounded-xl"
                          ></motion.img>
                        </motion.div>
                      })}
                    </motion.div>
                  </motion.div>
                )}

                {/* Media Partner */}
                {project?.media && project?.media.length !== 0 && (
                  <motion.div>
                    <div className="flex items-end justify-between mt-16">
                      <div>
                        <h3 className="text-3xl font-syne font-bold">Media Partner</h3>
                      </div>
                      <span className="hidden md:block text-xs font-mono uppercase tracking-widest text-foreground/40">
                        {project?.media.length} Media Partner
                      </span>
                    </div>
                    <motion.div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-10">
                      {project?.media.map((e: { img: string; media: string; link: string; }, index: number) => {
                        return <motion.a key={index} href={e.link} className='rounded-xl border-[#f1f0f8] relative min-w-2 border-[3px]'>
                          <motion.img
                            key={index}
                            src={import.meta.env.VITE_FONT_END + e.img}
                            alt={e.media}
                            className="block w-full h-auto object-cover rounded-xl"
                          ></motion.img>
                        </motion.a>
                      })}
                    </motion.div>
                  </motion.div>
                )}

                {/* Absensi */}
                {project?.absen && project?.absen.length !== 0 && (
                  <>
                    {/* Pendaftaran */}
                    <motion.div>
                      <Card >
                        <CardHeader><CardTitle>Pendaftaran Event</CardTitle></CardHeader>
                        <CardContent className="w-full h-full grid place-items-center">
                          <RegisterPie
                            attendance={registerPT}
                            rolesPresent={registerRole}
                            updateAt={fmtDateTimeIndo(dataAbsen.updateAt)}
                          />

                        </CardContent>
                      </Card>
                    </motion.div>
                    {/* Absensi */}
                    <motion.div>
                      <Card >
                        <CardHeader><CardTitle>Absensi Kehadiran</CardTitle></CardHeader>
                        <CardContent className="w-full h-full grid place-items-center">
                          <AttendancePie
                            attendance={absenPT}
                            rolesPresent={absenRole}
                            updateAt={fmtDateTimeIndo(dataAbsen.updateAt)}
                          />

                        </CardContent>
                      </Card>
                    </motion.div>
                  </>
                )}

                {/* Voting */}
                {dataVoting && isVoting && (
                  <>
                    <div className="flex items-end justify-between mt-16">
                      <div>
                        <h3 className="text-3xl font-syne font-bold">Perolehan Voting</h3>
                      </div>
                    </div>
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      onMouseMove={handleMouseMove}
                      className="mx-auto max-w-7xl mt-12 grid gap-6 sm:grid-cols-2"
                    >
                      {/* Chart Card */}
                      <div className="relative overflow-hidden rounded-2xl border bg-card p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <div>
                            <div className="text-sm text-muted-foreground">Total suara</div>
                            <div className="text-2xl font-semibold tabular-nums">
                              {totalVotes.toLocaleString("id-ID")}
                            </div>
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            Terakhir diperbarui
                            <br />

                            <span className="font-medium">
                              {format(lastUpdated, "dd MMM yyyy HH:mm:ss", { locale: localeID })}
                            </span>
                          </div>
                        </div>

                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            {(
                              <BarChart data={rows} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                <XAxis dataKey="candidateName" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                                <Tooltip
                                  formatter={(value: any) => [Number(value).toLocaleString("id-ID"), "Suara"]}
                                />
                                <Legend />
                                <Bar dataKey="votes" name="Suara">
                                  {rows.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Bar>
                              </BarChart>
                            )}
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* List Card */}
                      <div className="overflow-hidden rounded-2xl border bg-card p-4">
                        <div className="mb-3 text-sm font-medium">Rincian kandidat</div>
                        <div className="space-y-4">
                          {rows.map((it) => (
                            <div key={it.candidateId} className="rounded-xl border p-3">
                              <div className="mb-1 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="inline-block h-2.5 w-2.5 rounded-full"
                                    style={{ backgroundColor: it.color }}
                                  />
                                  <span className="font-medium">{it.candidateName}</span>
                                </div>
                                <div className="tabular-nums text-sm text-muted-foreground">
                                  {it.votes.toLocaleString("id-ID")}{" "}
                                  <span className="opacity-70">({it.percent.toFixed(1)}%)</span>
                                </div>
                              </div>
                              <Progress.Root className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                                <Progress.Indicator
                                  className="h-full w-full flex-1 rounded-full"
                                  style={{
                                    transform: `translateX(-${100 - it.percent}%)`,
                                    backgroundColor: it.color,
                                  }}
                                />
                              </Progress.Root>
                            </div>
                          ))}
                          {rows.length === 0 && (
                            <div className="rounded-xl border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                              Belum ada data kandidat.
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </div>
            </div>
          </div >
        </div >

        {/* Footer Navigation */}
        {
          project?.nextProject && project?.nextProject !== '' && (
            <section className="border-t border-foreground/10 bg-foreground/5 py-20">
              <div className="container-wide max-w-[90rem] mx-auto px-4 sm:px-6">
                <div className="flex items-end justify-between mb-12">
                  <h2 className="text-3xl md:text-4xl font-syne font-bold uppercase">Next Project</h2>
                  <Link to="/event" className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-accent transition-colors">
                    View All Event <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {nextProject ? (
                  <Link
                    to={`/event/${nextProject.uuid}`}
                    className="group block border border-foreground/10 bg-background p-8 hover:border-accent transition-colors relative overflow-hidden"
                  >
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div className="aspect-[16/9] overflow-hidden bg-foreground/5">
                        <img
                          src={import.meta.env.VITE_FONT_END + nextProject.heroImage}
                          alt={nextProject.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-foreground/40 mb-4">
                          <span className="text-accent">{nextProject.category}</span>
                          <span>{nextProject.year}</span>
                        </div>
                        <h3 className="text-3xl md:text-5xl font-syne font-bold leading-tight group-hover:text-accent transition-colors mb-6">
                          {nextProject.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
                          View Event <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="text-center py-12 text-foreground/40 italic">
                    End of portfolio.
                  </div>
                )}
              </div>
            </section>
          )
        }
        {
          project?.prevProject && project?.prevProject !== '' && (
            <section className="border-t border-foreground/10 bg-foreground/5 py-20">
              <div className="container-wide max-w-[90rem] mx-auto px-4 sm:px-6">
                <div className="flex items-end justify-between mb-12">
                  <h2 className="text-3xl md:text-4xl font-syne font-bold uppercase">Previous Project</h2>
                  <Link to="/event" className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-accent transition-colors">
                    View All Event <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {prevProject ? (
                  <Link
                    to={`/event/${prevProject.uuid}`}
                    className="group block border border-foreground/10 bg-background p-8 hover:border-accent transition-colors relative overflow-hidden"
                  >
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div className="aspect-[16/9] overflow-hidden bg-foreground/5">
                        <img
                          src={import.meta.env.VITE_FONT_END + prevProject.heroImage}
                          alt={prevProject.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-foreground/40 mb-4">
                          <span className="text-accent">{prevProject.category}</span>
                          <span>{prevProject.year}</span>
                        </div>
                        <h3 className="text-3xl md:text-5xl font-syne font-bold leading-tight group-hover:text-accent transition-colors mb-6">
                          {prevProject.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
                          View Event <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="text-center py-12 text-foreground/40 italic">
                    End of portfolio.
                  </div>
                )}
              </div>
            </section>
          )
        }
      </main >

      <Footer />
    </div >
  )
};

export default CaseStudy;