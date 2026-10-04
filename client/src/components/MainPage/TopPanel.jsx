import { useRef } from "react";

const UploadIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);

const ScanIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7V5a2 2 0 0 1 2-2h2" />
        <path d="M17 3h2a2 2 0 0 1 2 2v2" />
        <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
        <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
        <line x1="7" y1="12" x2="17" y2="12" />
    </svg>
);

export default function TopPanel({
    onFileSelect, // (File) => void
    onScanSample, // () => void
    onLogin,
    onSignup,
    onHowItWorks,
}) {
    const fileRef = useRef(null);

    const handleFile = (e) => {
        const file = e.target.files?.[0];
        if (file) onFileSelect?.(file);
        e.target.value = ""; // allow re-selecting the same file
    };

    return (
        <section className="relative overflow-hidden rounded-b-xl border border-t-0 border-white/10 bg-[#0f0e3a] text-white">
            {/* diagonal sheen */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-[10%] top-0 h-full w-3/5 -skew-x-[20deg] bg-gradient-to-r from-transparent via-[#786edc]/15 to-transparent"
            />

            {/* Navbar */}
            <nav className="relative flex items-center justify-between border-b border-white/10 px-5 py-3">
                <div className="flex items-center gap-5">
                    <span className="text-[17px] font-bold tracking-tight">
                        formrescue<sup className="ml-px text-[7px] font-normal">™</sup>
                    </span>
                    <button
                        onClick={onHowItWorks}
                        className="text-xs text-white/80 transition hover:text-white"
                    >
                        How it works
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onLogin}
                        className="rounded-md border border-white/10 bg-[#1c1b55] px-4 py-1.5 text-xs font-medium transition hover:bg-[#25246b]"
                    >
                        Log in
                    </button>
                    <button
                        onClick={onSignup}
                        className="rounded-md bg-white px-4 py-1.5 text-xs font-semibold text-[#0f0e3a] transition hover:bg-white/90"
                    >
                        Sign up
                    </button>
                </div>
            </nav>

            {/* Hero */}
            <div className="relative px-6 pb-6 pt-8 text-center">
                <h1 className="text-[34px] font-bold leading-none tracking-tight sm:text-[40px]">
                    formrescue<sup className="ml-0.5 align-super text-[10px] font-normal">™</sup>
                </h1>

                <h2 className="mt-6 text-lg font-bold sm:text-xl">
                    Photograph the form. Get a plain checklist.
                </h2>

                <p className="mx-auto mt-3 max-w-[560px] text-[11px] leading-relaxed text-white/70">
                    Photograph a confusing form. Gemma 4 reads the page, boxes every field
                    it finds, and explains each one from the printed text. If something is
                    smudged or unclear, it says so instead of guessing.
                </p>
            </div>

            {/* Your form strip */}
            <div className="relative px-5 pb-5">
                <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#171650] px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-left">
                        <p className="text-sm font-semibold">Your form</p>
                        <p className="text-[11px] text-white/60">
                            Upload a photo or scan of the form to get started.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleFile}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileRef.current?.click()}
                            className="flex items-center gap-2 rounded-md border border-white/10 bg-[#25246b] px-4 py-2 text-xs font-medium transition hover:bg-[#2e2d7d]"
                        >
                            <UploadIcon />
                            Take or upload photo
                        </button>
                        <button
                            onClick={onScanSample}
                            className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-xs font-semibold text-[#0f0e3a] transition hover:bg-white/90"
                        >
                            <ScanIcon />
                            Scan sample form
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}