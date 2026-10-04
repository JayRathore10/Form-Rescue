import { useEffect, useRef, useState } from "react";
import { toFieldId } from "../../utils/formUtils";

const icon = (children) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {children}
    </svg>
);

const ICONS = {
    user: icon(<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>),
    calendar: icon(<><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>),
    mail: icon(<><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></>),
    phone: icon(<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />),
    pin: icon(<><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></>),
    rupee: icon(<><path d="M6 3h12" /><path d="M6 8h12" /><path d="M6 13h5a4 4 0 0 0 0-10" /><path d="m9 13 7 8" /></>),
    // added for dynamic fields + documents
    text: icon(<><polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" /></>),
    eye: icon(<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>),
    upload: icon(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></>),
    x: icon(<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>),
    file: icon(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></>),
    check: icon(<polyline points="20 6 9 17 4 12" />),
};

// Pick an icon from the backend field's type / name
const pickIcon = (name = "", type = "") => {
    const n = name.toLowerCase();
    if (type === "date" || n.includes("birth") || n.includes("dob")) return "calendar";
    if (type === "email" || n.includes("email")) return "mail";
    if (type === "tel" || n.includes("phone") || n.includes("mobile")) return "phone";
    if (type === "textarea" || n.includes("address")) return "pin";
    if (n.includes("income") || n.includes("salary") || n.includes("amount")) return "rupee";
    if (n.includes("name")) return "user";
    return "text";
};

// Backend payload -> the same `sections` shape the component already uses
const sectionsFromBackend = (formData) => {
    if (!formData || !formData.fields || formData.fields.length === 0) {
        return [];
    }
    return [
        {
            title: formData.title ? `1. ${formData.title}` : "1. Details",
            fields: (formData.fields || []).map((f) => ({
                id: toFieldId(f.name),
                label: f.name,
                type: f.type === "textarea" ? "textarea" : f.type || "text",
                placeholder: f.type === "date" ? "" : `Enter ${String(f.name).toLowerCase()}`,
                icon: pickIcon(f.name, f.type),
                required: !!f.required,
                full: f.type === "textarea",
                value: f.value ?? "",
            })),
        },
    ];
};

export default function GeneratedForm({
    sections = [],
    values = {},
    onChange, // (fieldId, value) => void
    onFieldFocus, // (field) => void  -> trigger the AI explanation
    onContinue,
    formData = null, // backend payload: { title, fields: [{name,type,required,value}], documents: [names] }
    onDocumentUpload, // (docName, File) => void
    onDocumentRemove, // (docName) => void
    aiExplanation = null,
    isExplaining = false,
}) {
    // If the backend payload is present it drives the form, otherwise the sections prop is used
    const resolvedSections = formData ? sectionsFromBackend(formData) : sections;
    const documents = formData?.documents ?? [];

    const [uploads, setUploads] = useState({}); // { [docName]: { file, url, isPdf } }
    const [previewDoc, setPreviewDoc] = useState(null); // docName currently shown in the modal
    const docInputs = useRef({});
    const blobUrls = useRef({}); // PDF blob urls, so we can revoke them

    // Local typing state: used when the parent doesn't pass onChange, so the fields are still typeable
    const [localValues, setLocalValues] = useState({});
    const isControlled = typeof onChange === "function";
    const currentValues = isControlled ? values : localValues;

    const handleChange = (id, v) => {
        setLocalValues((prev) => ({ ...prev, [id]: v }));
        onChange?.(id, v);
    };

    useEffect(() => {
        const urls = blobUrls.current;
        return () => Object.values(urls).forEach((u) => URL.revokeObjectURL(u));
    }, []);

    const revokeBlob = (docName) => {
        if (blobUrls.current[docName]) {
            URL.revokeObjectURL(blobUrls.current[docName]);
            delete blobUrls.current[docName];
        }
    };

    const handleDocPick = (docName, e) => {
        const picked = e.target.files?.[0];
        e.target.value = ""; // allow re-selecting the same file
        if (!picked) return;

        const isPdf = picked.type === "application/pdf";
        const save = (url) =>
            setUploads((prev) => ({ ...prev, [docName]: { file: picked, url, isPdf } }));

        revokeBlob(docName);
        if (isPdf) {
            const url = URL.createObjectURL(picked);
            blobUrls.current[docName] = url;
            save(url);
        } else {
            // data URL for images, nothing to revoke
            const reader = new FileReader();
            reader.onload = () => save(reader.result);
            reader.readAsDataURL(picked);
        }
        onDocumentUpload?.(docName, picked);
    };

    const handleDocRemove = (docName) => {
        revokeBlob(docName);
        setUploads((prev) => {
            const next = { ...prev };
            delete next[docName];
            return next;
        });
        if (previewDoc === docName) setPreviewDoc(null);
        onDocumentRemove?.(docName);
    };

    const uploadedCount = documents.filter((d) => uploads[d]).length;
    const activePreview = previewDoc ? uploads[previewDoc] : null;

    return (
        <section className="rounded-xl border border-white/10 bg-[#0f0e3a] p-4 text-white">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#1c1b55] text-white/80">
                        {icon(<><rect x="4" y="3" width="16" height="18" rx="2" /><line x1="8" y1="8" x2="16" y2="8" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="8" y1="16" x2="12" y2="16" /></>)}
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold leading-tight">Generated Form</h3>
                        <p className="text-[11px] text-white/60">
                            Fill in the details below. Get AI help for each field.
                        </p>
                    </div>
                </div>

                <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-300">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" />
                    </svg>
                    AI Powered
                </span>
            </div>

            {/* Form body */}
            <div className="mt-4 rounded-xl border border-white/10 bg-[#15144a] p-4">
                {(isExplaining || aiExplanation) && (
                    <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-[#6c63ff]/40 bg-[#6c63ff]/10 p-3 text-xs text-white/90">
                        <span className="mt-0.5 text-amber-300">
                            {icon(<><path d="M9 18h6" /><path d="M10 22h4" /><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z" /></>)}
                        </span>
                        <div>
                            {isExplaining ? (
                                <p className="italic text-white/60">Gemma is analyzing this field...</p>
                            ) : (
                                <>
                                    <p className="font-semibold text-[#8f86ff]">{aiExplanation.fieldName} AI Tip:</p>
                                    <p className="mt-0.5 text-[11px] text-white/80">{aiExplanation.text}</p>
                                </>
                            )}
                        </div>
                    </div>
                )}
                {resolvedSections.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 text-center text-white/50">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-[#1c1b55] text-[#8f86ff]">
                            {ICONS.file}
                        </div>
                        <p className="text-sm font-semibold text-white/90">No Form Scanned Yet</p>
                        <p className="mt-1.5 max-w-[320px] text-xs leading-relaxed text-white/60">
                            Upload a photo or scan of your form above and click &quot;Analyze form&quot;. All fields and documents will be extracted here automatically.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-5">
                            {resolvedSections.map((section) => (
                                <div key={section.title}>
                                    <h4 className="mb-3 text-[13px] font-semibold text-[#8f86ff]">
                                        {section.title}
                                    </h4>

                                    <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                                        {section.fields.map((f) => (
                                            <div key={f.id} className={f.full ? "sm:col-span-2" : ""}>
                                                <label
                                                    htmlFor={f.id}
                                                    className="mb-1.5 block text-[11px] font-medium text-white/90"
                                                >
                                                    {f.label}
                                                    {f.required && <span className="ml-0.5 text-red-400">*</span>}
                                                </label>

                                                <div className="relative">
                                                    <span
                                                        className={
                                                            f.type === "textarea"
                                                                ? "pointer-events-none absolute left-3 top-3 text-white/50"
                                                                : "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/50"
                                                        }
                                                    >
                                                        {ICONS[f.icon]}
                                                    </span>

                                                    {f.type === "textarea" ? (
                                                        <textarea
                                                            id={f.id}
                                                            rows={3}
                                                            value={currentValues[f.id] ?? f.value ?? ""}
                                                            placeholder={f.placeholder}
                                                            onChange={(e) => handleChange(f.id, e.target.value)}
                                                            onFocus={() => onFieldFocus?.(f)}
                                                            className="w-full resize-none rounded-lg border border-white/10 bg-[#0f0e3a] py-2.5 pl-9 pr-3 text-xs text-white placeholder:text-white/40 outline-none transition focus:border-[#8f86ff] focus:ring-1 focus:ring-[#8f86ff]"
                                                        />
                                                    ) : (
                                                        <input
                                                            id={f.id}
                                                            type={f.type || "text"}
                                                            value={currentValues[f.id] ?? f.value ?? ""}
                                                            placeholder={f.placeholder}
                                                            onChange={(e) => handleChange(f.id, e.target.value)}
                                                            onFocus={() => onFieldFocus?.(f)}
                                                            className="w-full rounded-lg border border-white/10 bg-[#0f0e3a] py-2.5 pl-9 pr-3 text-xs text-white placeholder:text-white/40 outline-none transition [color-scheme:dark] focus:border-[#8f86ff] focus:ring-1 focus:ring-[#8f86ff]"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {/* Required documents (only when the backend sends them) */}
                            {documents.length > 0 && (
                                <div>
                                    <div className="mb-3 flex items-center justify-between">
                                        <h4 className="text-[13px] font-semibold text-[#8f86ff]">
                                            {resolvedSections.length + 1}. Required Documents
                                        </h4>
                                        <span className="text-[11px] text-white/60">
                                            {uploadedCount} / {documents.length} uploaded
                                        </span>
                                    </div>

                                    <ul className="divide-y divide-white/10 rounded-lg border border-white/10 bg-[#0f0e3a] px-3">
                                        {documents.map((docName) => {
                                            const up = uploads[docName];
                                            return (
                                                <li key={docName} className="flex items-center gap-3 py-2.5">
                                                    <span
                                                        className={
                                                            up
                                                                ? "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white"
                                                                : "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/50"
                                                        }
                                                    >
                                                        {up ? ICONS.check : ICONS.file}
                                                    </span>

                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-xs font-semibold">{docName}</p>
                                                        <p className="truncate text-[10px] text-white/50">
                                                            {up ? up.file.name : "Not uploaded yet"}
                                                        </p>
                                                    </div>

                                                    <input
                                                        ref={(el) => (docInputs.current[docName] = el)}
                                                        type="file"
                                                        accept="image/*,application/pdf"
                                                        onChange={(e) => handleDocPick(docName, e)}
                                                        className="hidden"
                                                    />

                                                    {up ? (
                                                        <div className="flex shrink-0 items-center gap-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => setPreviewDoc(docName)}
                                                                title="Preview"
                                                                aria-label={`Preview ${docName}`}
                                                                className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-[#25246b] text-white transition hover:bg-[#2e2d7d]"
                                                            >
                                                                {ICONS.eye}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => docInputs.current[docName]?.click()}
                                                                title="Replace"
                                                                aria-label={`Replace ${docName}`}
                                                                className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-[#25246b] text-white transition hover:bg-[#2e2d7d]"
                                                            >
                                                                {ICONS.upload}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDocRemove(docName)}
                                                                title="Remove"
                                                                aria-label={`Remove ${docName}`}
                                                                className="flex h-7 w-7 items-center justify-center rounded-md border border-red-400/30 bg-red-500/10 text-red-300 transition hover:bg-red-500/20"
                                                            >
                                                                {ICONS.x}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => docInputs.current[docName]?.click()}
                                                            className="flex shrink-0 items-center gap-1.5 rounded-md border border-white/10 bg-[#25246b] px-3 py-1.5 text-[11px] font-medium transition hover:bg-[#2e2d7d]"
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
                        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="flex items-center gap-2 text-[11px] text-white/60">
                                <span className="text-amber-300">
                                    {icon(<><path d="M9 18h6" /><path d="M10 22h4" /><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z" /></>)}
                                </span>
                                Need help? Click on any field for an AI explanation.
                            </p>

                            <button
                                type="button"
                                onClick={onContinue}
                                className="flex items-center justify-center gap-2 rounded-lg bg-[#6c63ff] px-6 py-2.5 text-xs font-semibold text-white transition hover:bg-[#7b73ff]"
                            >
                                Continue
                                {icon(<><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>)}
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Document preview modal (opens from the eye icon) */}
            {activePreview && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                    onClick={() => setPreviewDoc(null)}
                >
                    <div
                        className="w-full max-w-[640px] rounded-xl border border-white/10 bg-[#0f0e3a] p-4 text-white"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold">{previewDoc}</p>
                                <p className="truncate text-[11px] text-white/60">{activePreview.file.name}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setPreviewDoc(null)}
                                aria-label="Close preview"
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-[#25246b] transition hover:bg-[#2e2d7d]"
                            >
                                {ICONS.x}
                            </button>
                        </div>

                        <div className="overflow-hidden rounded-lg border border-white/10 bg-[#15144a]">
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