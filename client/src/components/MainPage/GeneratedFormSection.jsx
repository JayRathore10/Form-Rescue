import { useEffect, useRef, useState } from "react";

const icon = (children) => (
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
        {children}
    </svg>
);

const ICONS = {
    user: icon(
        <>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </>
    ),

    calendar: icon(
        <>
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </>
    ),

    mail: icon(
        <>
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-10 6L2 7" />
        </>
    ),

    phone: icon(
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    ),

    pin: icon(
        <>
            <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" />
            <circle cx="12" cy="10" r="3" />
        </>
    ),

    rupee: icon(
        <>
            <path d="M6 3h12" />
            <path d="M6 8h12" />
            <path d="M6 13h5a4 4 0 0 0 0-10" />
            <path d="m9 13 7 8" />
        </>
    ),

    text: icon(
        <>
            <polyline points="4 7 4 4 20 4 20 7" />
            <line x1="9" y1="20" x2="15" y2="20" />
            <line x1="12" y1="4" x2="12" y2="20" />
        </>
    ),

    eye: icon(
        <>
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </>
    ),

    upload: icon(
        <>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
        </>
    ),

    x: icon(
        <>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </>
    ),

    file: icon(
        <>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
        </>
    ),

    check: icon(<polyline points="20 6 9 17 4 12" />),

    bulb: icon(
        <>
            <path d="M9 18h6" />
            <path d="M10 22h4" />
            <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z" />
        </>
    ),

    arrow: icon(
        <>
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
        </>
    ),
};

const DEFAULT_SECTIONS = [
    {
        title: "1. Personal Information",
        fields: [
            {
                id: "fullName",
                label: "Full Name",
                placeholder: "Enter your full name",
                icon: "user",
                required: true,
            },
            {
                id: "dob",
                label: "Date of Birth",
                placeholder: "DD / MM / YYYY",
                icon: "calendar",
                required: true,
            },
            {
                id: "email",
                label: "Email Address",
                placeholder: "you@example.com",
                icon: "mail",
                type: "email",
                required: true,
                full: true,
            },
            {
                id: "phone",
                label: "Phone Number",
                placeholder: "+91 98765 43210",
                icon: "phone",
                type: "tel",
                required: true,
            },
            {
                id: "address",
                label: "Address",
                placeholder: "Enter your complete address",
                icon: "pin",
                required: true,
            },
        ],
    },
    {
        title: "2. Financial Details",
        fields: [
            {
                id: "income",
                label: "Annual Family Income",
                placeholder: "Enter amount in INR",
                icon: "rupee",
                required: true,
                full: true,
            },
        ],
    },
];

export const toFieldId = (name = "") =>
    name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

const pickIcon = (name = "", type = "") => {
    const n = name.toLowerCase();

    if (type === "date" || n.includes("birth") || n.includes("dob")) {
        return "calendar";
    }

    if (type === "email" || n.includes("email")) {
        return "mail";
    }

    if (type === "tel" || n.includes("phone") || n.includes("mobile")) {
        return "phone";
    }

    if (type === "textarea" || n.includes("address")) {
        return "pin";
    }

    if (
        n.includes("income") ||
        n.includes("salary") ||
        n.includes("amount")
    ) {
        return "rupee";
    }

    if (n.includes("name")) {
        return "user";
    }

    return "text";
};

const sectionsFromBackend = (formData) => {
    if (!formData || !formData.fields?.length) {
        return [];
    }

    return [
        {
            title: formData.title ? `1. ${formData.title}` : "1. Details",

            fields: formData.fields.map((f) => ({
                id: toFieldId(f.name),
                label: f.name,
                type:
                    f.type === "textarea"
                        ? "textarea"
                        : f.type || "text",
                placeholder:
                    f.type === "date"
                        ? ""
                        : `Enter ${String(f.name).toLowerCase()}`,
                icon: pickIcon(f.name, f.type),
                required: !!f.required,
                full: f.type === "textarea",
                value: f.value ?? "",
            })),
        },
    ];
};

export default function GeneratedForm({
    sections = DEFAULT_SECTIONS,

    // Form API integration
    values = {},
    onChange,

    // AI explanation API integration
    onFieldFocus,
    aiExplanation = null,
    isExplaining = false,

    // Continue / submit API integration
    onContinue,

    // Backend-generated form
    formData = null,

    // Document API integration
    onDocumentUpload,
    onDocumentRemove,
}) {
    /*
     * If formData comes from the backend,
     * backend fields are used.
     * Otherwise fallback to DEFAULT_SECTIONS / sections.
     */
    const resolvedSections = formData
        ? sectionsFromBackend(formData)
        : sections;

    const documents = formData?.documents ?? [];

    /*
     * Local document upload state.
     *
     * This is only UI state.
     * Actual API upload is still handled by:
     * onDocumentUpload(docName, file)
     */
    const [uploads, setUploads] = useState({});

    const [previewDoc, setPreviewDoc] = useState(null);

    const docInputs = useRef({});
    const blobUrls = useRef({});

    /*
     * Local form state fallback.
     *
     * If parent supplies onChange, component is controlled.
     * Otherwise fields remain usable locally.
     */
    const [localValues, setLocalValues] = useState({});

    const isControlled = typeof onChange === "function";

    const currentValues = isControlled
        ? values
        : localValues;

    /*
     * Field value change.
     *
     * Parent can connect this to:
     * POST / PATCH form response API
     */
    const handleChange = (id, value) => {
        setLocalValues((prev) => ({
            ...prev,
            [id]: value,
        }));

        onChange?.(id, value);
    };

    /*
     * Cleanup PDF blob URLs.
     */
    useEffect(() => {
        const urls = blobUrls.current;

        return () => {
            Object.values(urls).forEach((url) => {
                URL.revokeObjectURL(url);
            });
        };
    }, []);

    const revokeBlob = (docName) => {
        if (blobUrls.current[docName]) {
            URL.revokeObjectURL(blobUrls.current[docName]);

            delete blobUrls.current[docName];
        }
    };

    /*
     * Document upload.
     *
     * API callback:
     * onDocumentUpload(docName, picked)
     */
    const handleDocPick = (docName, e) => {
        const picked = e.target.files?.[0];

        e.target.value = "";

        if (!picked) return;

        const isPdf = picked.type === "application/pdf";

        const save = (url) => {
            setUploads((prev) => ({
                ...prev,
                [docName]: {
                    file: picked,
                    url,
                    isPdf,
                },
            }));
        };

        revokeBlob(docName);

        if (isPdf) {
            const url = URL.createObjectURL(picked);

            blobUrls.current[docName] = url;

            save(url);
        } else {
            const reader = new FileReader();

            reader.onload = () => {
                save(reader.result);
            };

            reader.readAsDataURL(picked);
        }

        onDocumentUpload?.(docName, picked);
    };

    /*
     * Document remove.
     *
     * API callback:
     * onDocumentRemove(docName)
     */
    const handleDocRemove = (docName) => {
        revokeBlob(docName);

        setUploads((prev) => {
            const next = { ...prev };

            delete next[docName];

            return next;
        });

        if (previewDoc === docName) {
            setPreviewDoc(null);
        }

        onDocumentRemove?.(docName);
    };

    const uploadedCount = documents.filter(
        (documentName) => uploads[documentName]
    ).length;

    const activePreview = previewDoc
        ? uploads[previewDoc]
        : null;

    return (
        <section className="w-full border border-white/10 bg-[#0f0e3a] p-4 text-white sm:p-5 lg:p-6">

            {/* Header */}
            <div className="flex items-start justify-between gap-4">

                <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#24224f] text-[#b8b3e6]">
                        {icon(
                            <>
                                <rect
                                    x="4"
                                    y="3"
                                    width="16"
                                    height="18"
                                    rx="2"
                                />
                                <line
                                    x1="8"
                                    y1="8"
                                    x2="16"
                                    y2="8"
                                />
                                <line
                                    x1="8"
                                    y1="12"
                                    x2="16"
                                    y2="12"
                                />
                                <line
                                    x1="8"
                                    y1="16"
                                    x2="12"
                                    y2="16"
                                />
                            </>
                        )}
                    </div>

                    <div>
                        <h3 className="text-base font-bold tracking-tight text-white">
                            Generated Form
                        </h3>

                        <p className="mt-0.5 text-[11px] text-[#aaa6d2]">
                            Fill in the details below. Get AI help for each field.
                        </p>
                    </div>
                </div>

                <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#8f86ff]/30 bg-[#6c63ff]/10 px-3 py-1.5 text-[10px] font-semibold text-[#b8b3ff]">
                    <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" />
                    </svg>

                    AI Powered
                </span>
            </div>

            {/* Form body */}
            <div className="mt-5 rounded-2xl border border-white/10 bg-[#24224f] p-4 sm:p-5">

                {/* AI explanation */}
                {(isExplaining || aiExplanation) && (
                    <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-[#8f86ff]/30 bg-[#6c63ff]/10 p-3">

                        <span className="mt-0.5 shrink-0 text-[#b8b3ff]">
                            {ICONS.bulb}
                        </span>

                        <div className="min-w-0">

                            {isExplaining ? (
                                <p className="text-[11px] italic text-[#aaa6d2]">
                                    Gemma is analyzing this field...
                                </p>
                            ) : (
                                <>
                                    <p className="text-[11px] font-bold text-[#aaa4ff]">
                                        {aiExplanation?.fieldName || "AI Tip"}:
                                    </p>

                                    <p className="mt-1 text-[11px] leading-relaxed text-[#ddd9ff]">
                                        {aiExplanation?.text}
                                    </p>
                                </>
                            )}

                        </div>
                    </div>
                )}

                <div className="space-y-6">

                    {/* Dynamic form sections */}
                    {resolvedSections.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-14 text-center">

                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-[#302d6c] text-[#aaa4ff]">
                                {ICONS.file}
                            </div>

                            <p className="text-sm font-semibold text-white">
                                No Form Scanned Yet
                            </p>

                            <p className="mt-1.5 max-w-[320px] text-xs leading-relaxed text-[#aaa6d2]">
                                Upload a photo or scan of your form above and click
                                &quot;Analyze form&quot;. All fields and documents
                                will be extracted here automatically.
                            </p>

                        </div>
                    ) : (
                        resolvedSections.map((section) => (
                            <div key={section.title}>

                                <h4 className="mb-3 text-[13px] font-bold tracking-tight text-[#aaa4ff]">
                                    {section.title}
                                </h4>

                                <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">

                                    {section.fields.map((f) => (
                                        <div
                                            key={f.id}
                                            className={
                                                f.full
                                                    ? "sm:col-span-2"
                                                    : ""
                                            }
                                        >

                                            <label
                                                htmlFor={f.id}
                                                className="mb-1.5 block text-[11px] font-medium text-[#ddd9ff]"
                                            >
                                                {f.label}

                                                {f.required && (
                                                    <span className="ml-0.5 text-red-300">
                                                        *
                                                    </span>
                                                )}
                                            </label>

                                            <div className="relative">

                                                <span
                                                    className={
                                                        f.type === "textarea"
                                                            ? "pointer-events-none absolute left-3 top-3 text-[#aaa6d2]"
                                                            : "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa6d2]"
                                                    }
                                                >
                                                    {ICONS[f.icon] || ICONS.text}
                                                </span>

                                                {f.type === "textarea" ? (
                                                    <textarea
                                                        id={f.id}
                                                        rows={3}
                                                        value={
                                                            currentValues[f.id] ??
                                                            f.value ??
                                                            ""
                                                        }
                                                        placeholder={f.placeholder}
                                                        onChange={(e) =>
                                                            handleChange(
                                                                f.id,
                                                                e.target.value
                                                            )
                                                        }
                                                        onFocus={() =>
                                                            onFieldFocus?.(f)
                                                        }
                                                        className="w-full resize-none rounded-xl border border-white/10 bg-[#3b3968] py-3 pl-9 pr-3 text-xs text-white placeholder:text-[#aaa6d2] outline-none transition focus:border-[#8f86ff] focus:bg-[#403d70] focus:ring-2 focus:ring-[#8f86ff]/20"
                                                    />
                                                ) : (
                                                    <input
                                                        id={f.id}
                                                        type={f.type || "text"}
                                                        value={
                                                            currentValues[f.id] ??
                                                            f.value ??
                                                            ""
                                                        }
                                                        placeholder={f.placeholder}
                                                        onChange={(e) =>
                                                            handleChange(
                                                                f.id,
                                                                e.target.value
                                                            )
                                                        }
                                                        onFocus={() =>
                                                            onFieldFocus?.(f)
                                                        }
                                                        className="w-full rounded-xl border border-white/10 bg-[#3b3968] py-3 pl-9 pr-3 text-xs text-white placeholder:text-[#aaa6d2] outline-none transition [color-scheme:dark] focus:border-[#8f86ff] focus:bg-[#403d70] focus:ring-2 focus:ring-[#8f86ff]/20"
                                                    />
                                                )}

                                            </div>
                                        </div>
                                    ))}

                                </div>
                            </div>
                        ))
                    )}

                    {/* Required documents */}
                    {documents.length > 0 && (
                        <div>

                            <div className="mb-3 flex items-center justify-between">

                                <h4 className="text-[13px] font-bold text-[#aaa4ff]">
                                    {resolvedSections.length + 1}. Required Documents
                                </h4>

                                <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] text-[#aaa6d2]">
                                    {uploadedCount} / {documents.length} uploaded
                                </span>

                            </div>

                            <ul className="divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10 bg-[#171644]">

                                {documents.map((docName) => {
                                    const up = uploads[docName];

                                    return (
                                        <li
                                            key={docName}
                                            className="flex items-center gap-3 px-3 py-3"
                                        >

                                            <span
                                                className={
                                                    up
                                                        ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300"
                                                        : "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#24224f] text-[#aaa6d2]"
                                                }
                                            >
                                                {up
                                                    ? ICONS.check
                                                    : ICONS.file}
                                            </span>

                                            <div className="min-w-0 flex-1">

                                                <p className="truncate text-xs font-semibold text-white">
                                                    {docName}
                                                </p>

                                                <p className="truncate text-[10px] text-[#aaa6d2]">
                                                    {up
                                                        ? up.file.name
                                                        : "Not uploaded yet"}
                                                </p>

                                            </div>

                                            <input
                                                ref={(el) =>
                                                    (docInputs.current[docName] =
                                                        el)
                                                }
                                                type="file"
                                                accept="image/*,application/pdf"
                                                onChange={(e) =>
                                                    handleDocPick(
                                                        docName,
                                                        e
                                                    )
                                                }
                                                className="hidden"
                                            />

                                            {up ? (
                                                <div className="flex shrink-0 items-center gap-1.5">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setPreviewDoc(
                                                                docName
                                                            )
                                                        }
                                                        title="Preview"
                                                        aria-label={`Preview ${docName}`}
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#302d6c] text-[#ddd9ff] transition hover:bg-[#393575]"
                                                    >
                                                        {ICONS.eye}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            docInputs.current[
                                                                docName
                                                            ]?.click()
                                                        }
                                                        title="Replace"
                                                        aria-label={`Replace ${docName}`}
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#302d6c] text-[#ddd9ff] transition hover:bg-[#393575]"
                                                    >
                                                        {ICONS.upload}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDocRemove(
                                                                docName
                                                            )
                                                        }
                                                        title="Remove"
                                                        aria-label={`Remove ${docName}`}
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-400/20 bg-red-500/10 text-red-300 transition hover:bg-red-500/20"
                                                    >
                                                        {ICONS.x}
                                                    </button>

                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        docInputs.current[
                                                            docName
                                                        ]?.click()
                                                    }
                                                    className="flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-[11px] font-semibold text-[#0f0e3a] transition hover:bg-[#f1efff]"
                                                >
                                                    {ICONS.upload}
                                                    Upload
                                                </button>
                                            )}

                                        </li>
                                    );
                                })}

                            </ul>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="mt-6 flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">

                    <p className="flex items-center gap-2 text-[11px] text-[#aaa6d2]">

                        <span className="text-[#b8b3ff]">
                            {ICONS.bulb}
                        </span>

                        Need help? Click on any field for an AI explanation.
                    </p>

                    <button
                        type="button"
                        onClick={onContinue}
                        className="flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-xs font-bold text-[#0f0e3a] transition hover:bg-[#f1efff]"
                    >
                        Continue

                        {ICONS.arrow}
                    </button>

                </div>
            </div>

            {/* Document preview modal */}
            {activePreview && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[#080725]/80 p-4 backdrop-blur-sm"
                    onClick={() => setPreviewDoc(null)}
                >
                    <div
                        className="w-full max-w-[640px] overflow-hidden rounded-2xl border border-white/10 bg-[#0f0e3a] p-4 text-white shadow-[0_25px_80px_rgba(0,0,0,0.45)]"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="mb-3 flex items-center justify-between gap-3">

                            <div className="min-w-0">

                                <p className="truncate text-sm font-semibold">
                                    {previewDoc}
                                </p>

                                <p className="truncate text-[11px] text-[#aaa6d2]">
                                    {activePreview.file.name}
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={() => setPreviewDoc(null)}
                                aria-label="Close preview"
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[#302d6c] text-[#ddd9ff] transition hover:bg-[#393575]"
                            >
                                {ICONS.x}
                            </button>

                        </div>

                        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#171644]">

                            {activePreview.isPdf ? (
                                <iframe
                                    src={activePreview.url}
                                    title={`${previewDoc} preview`}
                                    className="h-[70vh] w-full"
                                />
                            ) : (
                                <img
                                    src={activePreview.url}
                                    alt={`${previewDoc} preview`}
                                    className="mx-auto max-h-[70vh] w-auto object-contain"
                                />
                            )}

                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
