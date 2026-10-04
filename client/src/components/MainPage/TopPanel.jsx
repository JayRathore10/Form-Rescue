import { useEffect, useRef, useState } from "react";

const UploadIcon = () => (
    <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);

const ScanIcon = () => (
    <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M3 7V5a2 2 0 0 1 2-2h2" />
        <path d="M17 3h2a2 2 0 0 1 2 2v2" />
        <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
        <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
        <line x1="7" y1="12" x2="17" y2="12" />
    </svg>
);

const TrashIcon = () => (
    <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
);

const formatSize = (bytes) =>
    bytes < 1024 * 1024
        ? `${(bytes / 1024).toFixed(0)} KB`
        : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

export default function TopPanel({
    onFileSelect,
    onAnalyze,
    onRemove,
    onScanSample,
    onLogin,
    onSignup,
    onLogout,
    onHowItWorks,
    currentUser = null,
    isUploading = false,
}) {
    const fileRef = useRef(null);

    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // ---------------------------------------
    // Create preview
    // ---------------------------------------

    useEffect(() => {
        if (!file) {
            setPreviewUrl(null);
            return;
        }

        const url = URL.createObjectURL(file);

        setPreviewUrl(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [file]);

    const isPdf = file?.type === "application/pdf";

    // ---------------------------------------
    // File selection
    // ---------------------------------------

    const handleFile = (e) => {
        const picked = e.target.files?.[0];

        if (picked) {
            setFile(picked);
            onFileSelect?.(picked);
        }

        // Allow selecting the same file again
        e.target.value = "";
    };

    // ---------------------------------------
    // Remove file
    // ---------------------------------------

    const handleRemove = () => {
        setFile(null);
        onRemove?.();
    };

    return (
        <section className="relative w-full overflow-hidden rounded-b-[28px] bg-[#0f0e3a] text-white shadow-[0_20px_60px_rgba(15,14,58,0.25)]">

            {/* Background geometry */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-[8%] -top-[35%] h-[125%] w-[48%] rotate-[14deg] bg-[#24224f]/70"
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute right-[8%] top-[-20%] h-[120%] w-[18%] rotate-[14deg] bg-[#29275a]/55"
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-[8%] bottom-[-50%] h-[80%] w-[30%] rounded-[60px] bg-[#302d6c]/35"
            />

            {/* ================= NAVBAR ================= */}

            <nav className="relative z-10 flex items-center justify-between border-b border-white/10 px-6 py-4 sm:px-8 lg:px-10">

                {/* Logo + How it works */}
                <div className="flex items-center gap-8">

                    <button
                        type="button"
                        className="text-[18px] font-bold tracking-[-0.04em] text-white"
                    >
                        formrescue
                        <sup className="ml-0.5 align-super text-[7px] font-normal">
                            ™
                        </sup>
                    </button>

                    <button
                        type="button"
                        onClick={onHowItWorks}
                        className="text-sm font-medium text-[#b8b3e6] transition hover:text-white"
                    >
                        How it works
                    </button>

                </div>

                {/* ================= AUTH ================= */}

                <div className="flex items-center gap-2.5">

                    {currentUser ? (
                        <div className="flex items-center gap-2.5">

                            {/* User */}
                            <div className="hidden max-w-[180px] truncate rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2.5 text-sm font-semibold text-emerald-300 sm:block">
                                {currentUser.name ||
                                    currentUser.email ||
                                    currentUser.username}
                            </div>

                            {/* Logout */}
                            <button
                                type="button"
                                onClick={onLogout}
                                className="rounded-xl border border-white/10 bg-[#24224f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2d2b5d]"
                            >
                                Log out
                            </button>

                        </div>
                    ) : (
                        <>
                            {/* Login */}
                            <button
                                type="button"
                                onClick={onLogin}
                                className="rounded-xl border border-white/10 bg-[#24224f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2d2b5d]"
                            >
                                Log in
                            </button>

                            {/* Signup */}
                            <button
                                type="button"
                                onClick={onSignup}
                                className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#0f0e3a] transition hover:bg-[#f1efff]"
                            >
                                Sign up
                            </button>
                        </>
                    )}

                </div>
            </nav>

            {/* ================= HERO ================= */}

            <div className="relative z-10 px-6 pb-8 pt-10 text-center sm:px-8 sm:pb-10 sm:pt-12">

                <h1 className="text-[42px] font-bold leading-none tracking-[-0.045em] sm:text-[48px]">
                    formrescue
                    <sup className="ml-0.5 align-super text-[9px] font-normal">
                        ™
                    </sup>
                </h1>

                <h2 className="mt-6 text-xl font-bold tracking-tight text-white sm:text-[22px]">
                    Photograph the form. Get a plain checklist.
                </h2>

                <p className="mx-auto mt-3 max-w-[620px] text-sm leading-6 text-[#b8b3e6]">
                    Photograph a confusing form. Gemma 4 reads the page,
                    boxes every field it finds, and explains each one from
                    the printed text. If something is smudged or unclear,
                    it says so instead of guessing.
                </p>

            </div>

            {/* ================= FORM UPLOAD ================= */}

            <div className="relative z-10 px-5 pb-6 sm:px-7 lg:px-8">

                <div className="overflow-hidden rounded-[20px] border border-white/10 bg-[#24224f] shadow-[0_12px_35px_rgba(8,7,40,0.25)]">

                    {/* Toolbar */}
                    <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">

                        <div className="min-w-0 text-left">

                            <p className="text-base font-semibold text-white">
                                Your form
                            </p>

                            <p className="mt-1 truncate text-xs text-[#aaa6d2]">
                                {file
                                    ? `${file.name} · ${formatSize(file.size)}`
                                    : "Upload a photo or scan of the form to get started."}
                            </p>

                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">

                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*,application/pdf"
                                capture="environment"
                                onChange={handleFile}
                                className="hidden"
                            />

                            {/* Upload */}
                            <button
                                type="button"
                                onClick={() =>
                                    fileRef.current?.click()
                                }
                                disabled={isUploading}
                                className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#302d6c] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#393575] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <UploadIcon />

                                {file
                                    ? "Replace file"
                                    : "Take or upload photo"}
                            </button>

                            {/* Scan sample */}
                            <button
                                type="button"
                                onClick={onScanSample}
                                className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-[#0f0e3a] transition hover:bg-[#f1efff]"
                            >
                                <ScanIcon />
                                Scan sample form
                            </button>

                            {/* File actions */}
                            {file && (
                                <>
                                    {/* Remove */}
                                    <button
                                        type="button"
                                        onClick={handleRemove}
                                        disabled={isUploading}
                                        className="flex items-center gap-2 rounded-xl border border-red-300/20 bg-red-400/10 px-4 py-2.5 text-xs font-semibold text-red-200 transition hover:bg-red-400/20 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <TrashIcon />
                                        Remove
                                    </button>

                                    {/* Analyze */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onAnalyze?.(file)
                                        }
                                        disabled={isUploading}
                                        className="flex items-center gap-2 rounded-xl bg-[#6c63ff] px-4 py-2.5 text-xs font-semibold text-white shadow-[0_6px_18px_rgba(108,99,255,0.25)] transition hover:bg-[#7971ff] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {isUploading
                                            ? "Analyzing…"
                                            : "Analyze form"}
                                    </button>
                                </>
                            )}

                        </div>
                    </div>

                    {/* ================= PREVIEW ================= */}

                    {file && previewUrl && (
                        <div className="border-t border-white/10 bg-[#171644] p-4 sm:p-5">

                            <div className="relative overflow-hidden rounded-[16px] border border-white/10 bg-[#0f0e3a] shadow-inner">

                                {isPdf ? (
                                    <iframe
                                        src={previewUrl}
                                        title="Uploaded form preview"
                                        className="h-[360px] w-full"
                                    />
                                ) : (
                                    <img
                                        src={previewUrl}
                                        alt="Uploaded form preview"
                                        className="mx-auto max-h-[360px] w-auto object-contain"
                                    />
                                )}

                                {/* Analyzing overlay */}
                                {isUploading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-[#0f0e3a]/75 text-sm font-semibold text-white backdrop-blur-[2px]">

                                        <div className="rounded-xl border border-white/10 bg-[#24224f]/90 px-5 py-3 shadow-xl">
                                            Reading your form…
                                        </div>

                                    </div>
                                )}

                            </div>
                        </div>
                    )}

                </div>
            </div>
        </section>
    );
}
