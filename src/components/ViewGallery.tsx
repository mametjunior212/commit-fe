
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
// (opsional) framer-motion jika kamu masih pakai versi ViewFullModal

type ViewFullProps = {
    /** Jika kontennya gambar/video, isi URL src. Jika bukan media, gunakan children. */
    src?: string;
    /** Alt untuk image */
    alt?: string;
    /** Poster untuk video (opsional) */
    poster?: string;
    /** Konten non-media */
    children?: React.ReactNode;
    /** Judul opsional di header modal */
    title?: string;
    /** Trigger kustom: terima fungsi open() yang membuka modal */
    renderTrigger?: (open: () => void) => React.ReactNode;
    /** Kelas tambahan untuk wrapper trigger */
    className?: string;
};

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.avif', '.svg'];
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.ogv', '.mov', '.m4v'];

function endsWithExt(url: string, exts: string[]) {
    const lower = url.split('?')[0].toLowerCase();
    return exts.some((ext) => lower.endsWith(ext));
}
function isImageUrl(url?: string) {
    if (!url) return false;
    return endsWithExt(url, IMAGE_EXTENSIONS);
}
function isVideoUrl(url?: string) {
    if (!url) return false;
    return endsWithExt(url, VIDEO_EXTENSIONS);
}



export const ViewFull: React.FC<ViewFullProps> = ({ src, alt = '', poster, children, title, renderTrigger, className = '' }) => {
    const [open, setOpen] = useState(false);
    const handleOpen = useCallback(() => setOpen(true), []);
    const handleClose = useCallback(() => setOpen(false), []);
    const isImage = useMemo(() => isImageUrl(src), [src]);
    const isVideo = useMemo(() => isVideoUrl(src), [src]);

    // Portal container → ke body
    const [mounted, setMounted] = useState(false);
    const portalElRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setMounted(true);
        const el = document.createElement('div');
        el.setAttribute('data-viewfull-portal', '');
        portalElRef.current = el;
        document.body.appendChild(el);
        return () => {
            try { if (portalElRef.current) document.body.removeChild(portalElRef.current); } catch { }
            portalElRef.current = null;
        };
    }, []);

    // Lock scroll ketika modal open
    useEffect(() => {
        if (!open) return;
        const original = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = original; };
    }, [open]);

    return (
        <>
            {/* Trigger */}
            <div className={`relative ${className}`}>
                {renderTrigger ? renderTrigger(handleOpen) : (
                    <>
                        {src && isImage ? (
                            <img src={src} alt={alt} className="block w-full h-auto object-cover" />
                        ) : src && isVideo ? (
                            <video
                                src={src}
                                poster={poster}
                                muted
                                playsInline
                                loop
                                preload="metadata"
                                className="block w-full h-auto object-cover"
                            />
                        ) : (src !== "" ? (
                            <iframe
                                src={src}
                                title={alt}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            ></iframe>) : null)}
                        <button onClick={handleOpen} className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-3 py-1.5 rounded">
                            View Full
                        </button>
                    </>
                )}
            </div>

            {/* ===== Modal sederhana via Portal ===== */}
            {open && mounted && portalElRef.current
                ? createPortal(
                    <div
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 100,
                            background: 'rgba(0,0,0,0.7)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onClick={handleClose}
                    >
                        <div
                            onClick={e => e.stopPropagation()}
                            style={{
                                maxWidth: '95vw',
                                maxHeight: '92vh',
                                width: '100%',
                                background: 'rgba(0,0,0,0.25)',
                                backdropFilter: 'blur(6px)',
                                borderRadius: 12,
                                overflow: 'hidden',
                                border: '1px solid rgba(255,255,255,0.12)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', alignItems: 'center' }}>
                                <div style={{ color: '#fff', fontSize: 14, opacity: 0.9, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {title || 'View Full'}
                                </div>
                                <button onClick={handleClose} style={{ color: '#fff', fontSize: 13, background: 'rgba(255,255,255,0.12)', padding: '4px 8px', borderRadius: 6 }}>
                                    Close
                                </button>
                            </div>

                            {/* Body */}
                            <div style={{ padding: 12, maxHeight: '76vh', overflow: 'auto' }}>
                                {isImage && src ? (
                                    <ImageZoomCanvas src={src} alt={alt} />
                                ) : isVideo && src ? (
                                    <VideoPlayer src={src} poster={poster} />
                                ) : (src !== "" ? (
                                    <iframe
                                        src={src}
                                        title={alt}
                                        className="w-full h-[76vh]"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    ></iframe>) : <div style={{ color: '#fff' }}>{children}</div>)}
                            </div>
                        </div>
                    </div>,
                    portalElRef.current
                )
                : null}
        </>
    );
};

/** Pemutar video sederhana untuk modal */
const VideoPlayer: React.FC<{ src: string; poster?: string; autoPlay?: boolean }> = ({ src, poster, autoPlay = true }) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        const v = videoRef.current;
        // coba autoplay (mobile sering perlu user gesture, jadi kita catch)
        if (autoPlay && v) v.play().catch(() => { });
        return () => {
            if (v) {
                v.pause();
                try { v.currentTime = 0; } catch { }
            }
        };
    }, [src, autoPlay]);

    return (
        <div style={{ background: '#000', display: 'flex', justifyContent: 'center' }}>
            {/* <video
                ref={videoRef}
                src={src}
                poster={poster}
                controls
                playsInline
                style={{ maxWidth: '100%', maxHeight: '76vh', width: '100%' }}
                preload="metadata"
            /> */}
            <video
                src={src}
                ref={videoRef}
                poster={poster}
                loop
                autoPlay={false}
                controls={true}
                controlsList='nodownload'
                className="h-full rounded-lg object-cover mb-8"
            />
        </div>
    );
};


/** Canvas zoom/pan untuk image */
const ImageZoomCanvas: React.FC<{ src: string; alt?: string }> = ({ src, alt = '' }) => {
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);

    const [loaded, setLoaded] = useState(false);
    const [natural, setNatural] = useState({ w: 0, h: 0 });

    // Transform
    const [scale, setScale] = useState(1);
    const [tx, setTx] = useState(0);
    const [ty, setTy] = useState(0);

    const minScaleRef = useRef(1);
    const maxScaleRef = useRef(6);

    const draggingRef = useRef(false);
    const lastPtRef = useRef<{ x: number; y: number } | null>(null);

    const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
    const basePinchRef = useRef<{
        dist: number;
        scale: number;
        center: { x: number; y: number };
        tx: number;
        ty: number;
    } | null>(null);

    useEffect(() => {
        if (!loaded) return;
        fitToScreen();
    }, [loaded]);

    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

    const fitToScreen = useCallback(() => {
        const wrapper = wrapperRef.current;
        const img = imgRef.current;
        if (!wrapper || !img) return;

        const rect = wrapper.getBoundingClientRect();
        const vw = rect.width;
        const vh = rect.height;

        const { w, h } = natural;
        if (!w || !h) return;

        const scaleFit = Math.min(vw / w, vh / h, 1);
        minScaleRef.current = Math.max(scaleFit, 0.1);

        setScale(scaleFit);
        setTx(0);
        setTy(0);
    }, [natural]);

    const onImgLoad = useCallback(() => {
        const img = imgRef.current;
        if (!img) return;
        setNatural({ w: img.naturalWidth, h: img.naturalHeight });
        setLoaded(true);
    }, []);

    const getWrapperPoint = (clientX: number, clientY: number) => {
        const rect = wrapperRef.current!.getBoundingClientRect();
        return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const zoomAt = (delta: number, centerClient: { x: number; y: number }) => {
        // delta > 0 -> zoom in, delta < 0 -> zoom out
        const factor = Math.exp(delta * 0.0018);
        const newScale = clamp(scale * factor, minScaleRef.current, maxScaleRef.current);

        const { x: cx, y: cy } = getWrapperPoint(centerClient.x, centerClient.y);

        // Jaga titik di bawah kursor tetap sama
        const preX = (cx - tx) / scale;
        const preY = (cy - ty) / scale;
        const nextTx = cx - preX * newScale;
        const nextTy = cy - preY * newScale; // <-- pastikan TIDAK typo

        setScale(newScale);
        setTx(nextTx);
        setTy(nextTy);
    };

    // **Lebih prioritas dari parent scroll**
    const onWheelCapture = (e: React.WheelEvent) => {
        e.preventDefault(); // blok scroll halaman
        const delta = -e.deltaY;
        zoomAt(delta, { x: e.clientX, y: e.clientY });
    };

    const onPointerDown = (e: React.PointerEvent) => {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (pointersRef.current.size === 1 && scale > minScaleRef.current) {
            draggingRef.current = true;
            lastPtRef.current = { x: e.clientX, y: e.clientY };
        }

        if (pointersRef.current.size === 2) {
            const pts = Array.from(pointersRef.current.values());
            const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
            const center = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
            basePinchRef.current = { dist, scale, center, tx, ty };
        }
    };

    const onPointerMove = (e: React.PointerEvent) => {
        if (!pointersRef.current.has(e.pointerId)) return;
        pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

        // Pinch 2 jari
        if (pointersRef.current.size === 2 && basePinchRef.current) {
            const pts = Array.from(pointersRef.current.values());
            const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
            const center = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };

            const base = basePinchRef.current;
            const ratio = dist / base.dist;
            const newScale = clamp(base.scale * ratio, minScaleRef.current, maxScaleRef.current);

            const { x: cx, y: cy } = center;
            const preX = (cx - base.tx) / base.scale;
            const preY = (cy - base.ty) / base.scale;

            const nextTx = cx - preX * newScale;
            const nextTy = cy - preY * newScale;

            setScale(newScale);
            setTx(nextTx);
            setTy(nextTy);
            return;
        }

        // Pan 1 jari
        if (draggingRef.current && lastPtRef.current) {
            const dx = e.clientX - lastPtRef.current.x;
            const dy = e.clientY - lastPtRef.current.y;
            setTx((p) => p + dx);
            setTy((p) => p + dy);
            lastPtRef.current = { x: e.clientX, y: e.clientY };
        }
    };

    const onPointerUpOrCancel = (e: React.PointerEvent) => {
        pointersRef.current.delete(e.pointerId);
        if (pointersRef.current.size < 2) basePinchRef.current = null;
        if (pointersRef.current.size === 0) {
            draggingRef.current = false;
            lastPtRef.current = null;
        }
    };

    const onDoubleClick = (e: React.MouseEvent) => {
        const desired =
            scale <= minScaleRef.current * 1.05 ? Math.min(2, maxScaleRef.current) : minScaleRef.current;
        const delta = Math.log(desired / scale) / 0.0018;
        zoomAt(delta, { x: e.clientX, y: e.clientY });
    };

    const reset = () => {
        setScale(minScaleRef.current);
        setTx(0);
        setTy(0);
    };
    const oneToOne = () => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;
        const rect = wrapper.getBoundingClientRect();
        const newScale = clamp(1, minScaleRef.current, maxScaleRef.current);
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const preX = (cx - tx) / scale;
        const preY = (cy - ty) / scale;
        const nextTx = cx - preX * newScale;
        const nextTy = cy - preY * newScale;
        setScale(newScale);
        setTx(nextTx);
        setTy(nextTy);
    };
    const zoomIn = () => {
        const rect = wrapperRef.current!.getBoundingClientRect();
        zoomAt(120, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    };
    const zoomOut = () => {
        const rect = wrapperRef.current!.getBoundingClientRect();
        zoomAt(-120, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    };

    return (
        <div className="relative w-full h-[76vh] bg-black">
            {/* Controls */}
            <div className="absolute z-10 top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-2 py-1">
                <button onClick={reset} className="px-2 py-1 text-white text-xs hover:bg-white/20 rounded-full">Fit</button>
                <button onClick={oneToOne} className="px-2 py-1 text-white text-xs hover:bg-white/20 rounded-full">1:1</button>
                <button onClick={zoomOut} className="px-2 py-1 text-white text-xs hover:bg:white/20 rounded-full">−</button>
                <button onClick={zoomIn} className="px-2 py-1 text-white text-xs hover:bg-white/20 rounded-full">+</button>
                <span className="px-2 py-1 text-white/80 text-xs">{(scale * 100).toFixed(0)}%</span>
            </div>

            {/* Canvas */}
            <div
                ref={wrapperRef}
                className="absolute inset-0 overflow-hidden"
                // **IZINKAN PINCH & DRAG**
                style={{ touchAction: 'none', cursor: scale > minScaleRef.current ? 'grab' : 'zoom-in' }}
                onWheelCapture={onWheelCapture} // **pakai capture**
                onDoubleClick={onDoubleClick}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUpOrCancel}
                onPointerCancel={onPointerUpOrCancel}
            >
                <img
                    ref={imgRef}
                    src={src}
                    alt={alt}
                    onLoad={onImgLoad}
                    draggable={false}
                    className="select-none max-w-none w-full"
                    style={{
                        transform: `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`,
                        transformOrigin: '0 0',
                        willChange: 'transform',
                    }}
                />
            </div>
        </div>
    );
};

export default ViewFull;