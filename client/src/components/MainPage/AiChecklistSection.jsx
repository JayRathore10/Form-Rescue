
import { useCallback, useEffect, useMemo, useState } from "react";
import { toFieldId } from "../../utils/formUtils";

// Configure these paths to match your backend.
const API = {
    form: (id) => `/api/v1/forms/${id}`,
    save: (id) => `/api/v1/forms/${id}`,
    upload: (id) => `/api/v1/forms/${id}/documents`,
    deleteDocument: (id, name) =>
        `/api/v1/forms/${id}/documents/${encodeURIComponent(name)}`,
    submit: (id) => `/api/v1/forms/${id}/submit`,
};

const DEFAULT_ITEMS = [
    { id: "fullName", label: "Full Name", status: "done" },
    { id: "dob", label: "Date of Birth", status: "done" },
    { id: "email", label: "Email Address", status: "done" },
    {
        id: "income",
        label: "Annual Family Income",
        status: "missing",
        note: "Required field - not filled",
    },
    {
        id: "incomeCert",
        label: "Income Certificate",
        status: "pending",
        note: "Required document",
    },
];

const svg = (children, size = 14) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        {children}
    </svg>
);

const RULES = {
    email: (value) => {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return "Enter a valid email address.";
        }
        return null;
    },
    phone: (value) => {
        const digits = value.replace(/\D/g, "");
        const number =
            digits.length === 12 && digits.startsWith("91")
                ? digits.slice(2)
                : digits;
        if (!/^[6-9]\d{9}$/.test(number)) {
            return "Enter a valid 10-digit mobile number.";
        }
        return null;
    },
    date: (value) => {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "Enter a valid date.";
        if (date > new Date()) return "Date cannot be in the future.";
        if (date.getFullYear() < 1900) return "Check the year.";
        return null;
    },
    number: (value) => {
        if (!/^\d+(\.\d+)?$/.test(value.replace(/[,\s₹]/g, ""))) {
            return "Enter a valid number.";
        }
        return null;
    },
    name: (value) => {
        if (!/^[\p{L}][\p{L}\s.'-]*$/u.test(value) || value.length < 2) {
            return "Enter a valid name.";
        }
        return null;
    },
    address: (value) =>
        value.length < 10 ? "Enter a more complete address." : null,
    text: (value) =>
        value.length < 2 ? "Enter at least 2 characters." : null,
};

function getKind(name = "", type = "") {
    const n = name.toLowerCase();

    if (type === "email" || n.includes("email")) return "email";
    if (type === "tel" || /phone|mobile/.test(n)) return "phone";
    if (type === "date" || /birth|dob/.test(n)) return "date";
    if (type === "number" || /income|salary|amount/.test(n)) return "number";
    if (type === "textarea" || n.includes("address")) return "address";
    if (n.includes("name")) return "name";

    return "text";
}

function deriveItems(formData, values = {}, uploadedDocs = {}) {
    const fields = (formData?.fields || []).map((field) => {
        const id = toFieldId(field.name);
        const value = String(values[id] ?? field.value ?? "").trim();
        const kind = getKind(field.name, field.type);
        const error = value ? RULES[kind](value) : null;

        let status = "done";
        let note = "Completed";

        if (!value) {
            status = field.required ? "missing" : "optional";
            note = field.required
                ? "Required field - not filled"
                : "Optional - left blank";
        } else if (error) {
            status = "error";
            note = error;
        }

        return {
            id,
            label: field.name,
            kind: "field",
            fieldType: field.type,
            value,
            expected: kind,
            status,
            note,
            required: Boolean(field.required),
        };
    });

    const documents = (formData?.documents || []).map((document) => {
        const name =
            typeof document === "string" ? document : document.name;
        const uploaded = uploadedDocs[name];

        return {
            id: `doc-${toFieldId(name)}`,
            label: name,
            kind: "document",
            value: uploaded?.name || uploaded || "",
            status: uploaded ? "done" : "pending",
            note: uploaded ? "Document uploaded" : "Required document",
            required: true,
        };
    });

    return [...fields, ...documents];
}

const STATUS = {
    done: {
        badge: "Done",
        noteClass: "text-[#aaa6d2]",
        badgeClass:
            "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
        icon: (
            <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-emerald-400 text-[#111035]">
                {svg(<polyline points="20 6 9 17 4 12" />, 12)}
            </span>
        ),
    },
    missing: {
        badge: "Missing",
        noteClass: "text-amber-300",
        badgeClass: "border-amber-400/30 bg-amber-400/10 text-amber-300",
        icon: (
            <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-amber-400 text-[#111035]">
                {svg(
                    <>
                        <line x1="12" y1="6" x2="12" y2="13" />
                        <line x1="12" y1="18" x2="12.01" y2="18" />
                    </>,
                    12
                )}
            </span>
        ),
    },
    pending: {
        badge: "Pending",
        noteClass: "text-[#77749f]",
        badgeClass: "border-white/10 bg-white/5 text-[#aaa6d2]",
        icon: (
            <span className="h-[22px] w-[22px] shrink-0 rounded-full border-2 border-[#625f8f]" />
        ),
    },
    error: {
        badge: "Error",
        noteClass: "text-red-300",
        badgeClass: "border-red-400/30 bg-red-400/10 text-red-300",
        icon: (
            <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-red-400 text-[#111035]">
                {svg(
                    <>
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </>,
                    12
                )}
            </span>
        ),
    },
    optional: {
        badge: "Optional",
        noteClass: "text-[#aaa6d2]",
        badgeClass: "border-white/10 bg-white/5 text-[#aaa6d2]",
        icon: (
            <span className="h-[22px] w-[22px] shrink-0 rounded-full border-2 border-dashed border-[#625f8f]" />
        ),
    },
};

function ProgressRing({ percent }) {
    const radius = 30;
    const circumference = 2 * Math.PI * radius;

    return (
        <div className="relative h-[72px] w-[72px] shrink-0">
            <svg viewBox="0 0 72 72" className="-rotate-90">
                <circle
                    cx="36"
                    cy="36"
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.10)"
                    strokeWidth="7"
                />
                <circle
                    cx="36"
                    cy="36"
                    r={radius}
                    fill="none"
                    stroke="#8f87ff"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={
                        circumference - (circumference * percent) / 100
                    }
                    className="transition-all duration-500"
                />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
                {percent}%
            </span>
        </div>
    );
}

export default function AiChecklist({
    formId,
    apiBaseUrl = "",
    token = "",
    items: itemsProp,
    formData: initialFormData = null,
    values: initialValues = {},
    uploadedDocs: initialUploadedDocs = {},
    activeId = null,
    autoFetch = true,
    onItemClick,
    onReviewMissing,
    onFormLoaded,
    onValuesSaved,
    onDocumentUploaded,
    onDocumentDeleted,
    onSubmitSuccess,
}) {
    const [formData, setFormData] = useState(initialFormData);
    const [values, setValues] = useState(initialValues);
    const [uploadedDocs, setUploadedDocs] = useState(initialUploadedDocs);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [apiError, setApiError] = useState("");
    const [success, setSuccess] = useState("");
    const [expandedId, setExpandedId] = useState(null);

    const baseUrl =
        apiBaseUrl ||
        (typeof process !== "undefined"
            ? process.env.REACT_APP_API_URL || ""
            : "");

    const request = useCallback(
        async (path, options = {}) => {
            const headers = {
                ...(options.body instanceof FormData
                    ? {}
                    : { "Content-Type": "application/json" }),
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...options.headers,
            };

            const response = await fetch(`${baseUrl}${path}`, {
                ...options,
                headers: {
                    ...headers,
                    ...(options.body instanceof FormData
                        ? {}
                        : options.body
                          ? { "Content-Type": "application/json" }
                          : {}),
                },
            });

            const contentType = response.headers.get("content-type") || "";
            const data = contentType.includes("application/json")
                ? await response.json()
                : await response.text();

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                        data?.error ||
                        `Request failed (${response.status})`
                );
            }

            return data;
        },
        [baseUrl, token]
    );

    // Fetch form data from the backend.
    const fetchForm = useCallback(async () => {
        if (!formId || !autoFetch) return;

        setLoading(true);
        setApiError("");

        try {
            const result = await request(API.form(formId));
            const data = result?.data?.form || result?.form || result?.data || result;

            setFormData(data);

            if (data?.values) setValues(data.values);
            if (data?.uploadedDocs) setUploadedDocs(data.uploadedDocs);

            onFormLoaded?.(data);
        } catch (error) {
            setApiError(error.message || "Unable to load form.");
        } finally {
            setLoading(false);
        }
    }, [formId, autoFetch, request, onFormLoaded]);

    useEffect(() => {
        if (initialFormData) {
            setFormData(initialFormData);
        }
    }, [initialFormData]);

    useEffect(() => {
        setValues(initialValues || {});
    }, [initialValues]);

    useEffect(() => {
        setUploadedDocs(initialUploadedDocs || {});
    }, [initialUploadedDocs]);

    useEffect(() => {
        fetchForm();
    }, [fetchForm]);

    const items = useMemo(() => {
        if (itemsProp) return itemsProp;
        if (formData) return deriveItems(formData, values, uploadedDocs);
        return DEFAULT_ITEMS;
    }, [itemsProp, formData, values, uploadedDocs]);

    const countedItems = items.filter((item) => item.status !== "optional");
    const done = countedItems.filter((item) => item.status === "done").length;
    const total = countedItems.length;
    const percent = total ? Math.round((done / total) * 100) : 0;

    const missingItems = items.filter(
        (item) =>
            item.status === "missing" ||
            item.status === "pending" ||
            item.status === "error"
    );

    // Save form values.
    const saveValues = useCallback(
        async (nextValues) => {
            if (!formId) {
                setValues(nextValues);
                return;
            }

            setSaving(true);
            setApiError("");
            setSuccess("");

            try {
                await request(API.save(formId), {
                    method: "PATCH",
                    body: JSON.stringify({ values: nextValues }),
                });

                setValues(nextValues);
                onValuesSaved?.(nextValues);
                setSuccess("Form progress saved.");
            } catch (error) {
                setApiError(error.message || "Unable to save values.");
            } finally {
                setSaving(false);
            }
        },
        [formId, request, onValuesSaved]
    );

    // Upload a document.
    const uploadDocument = async (item, file) => {
        if (!file || !formId) return;

        setUploading((prev) => ({ ...prev, [item.id]: true }));
        setApiError("");
        setSuccess("");

        try {
            const body = new FormData();
            body.append("file", file);
            body.append("documentName", item.label);

            const result = await request(API.upload(formId), {
                method: "POST",
                body,
            });

            const uploaded =
                result?.data?.document ||
                result?.document ||
                result?.data ||
                result;

            setUploadedDocs((prev) => ({
                ...prev,
                [item.label]:
                    uploaded?.filename ||
                    uploaded?.fileName ||
                    uploaded?.name ||
                    file.name,
            }));

            onDocumentUploaded?.(item, uploaded);
            setSuccess(`${item.label} uploaded successfully.`);
        } catch (error) {
            setApiError(error.message || "Document upload failed.");
        } finally {
            setUploading((prev) => ({ ...prev, [item.id]: false }));
        }
    };

    // Delete an uploaded document.
    const deleteDocument = async (item) => {
        if (!formId) return;

        setApiError("");
        setSuccess("");

        try {
            await request(API.deleteDocument(formId, item.label), {
                method: "DELETE",
            });

            setUploadedDocs((prev) => {
                const next = { ...prev };
                delete next[item.label];
                return next;
            });

            onDocumentDeleted?.(item);
            setSuccess("Document removed.");
        } catch (error) {
            setApiError(error.message || "Unable to delete document.");
        }
    };

    // Submit the completed form.
    const submitForm = async () => {
        if (!formId) {
            setApiError("A form ID is required to submit.");
            return;
        }

        if (missingItems.length > 0) {
            setApiError("Please complete all required fields and documents.");
            return;
        }

        setSubmitting(true);
        setApiError("");
        setSuccess("");

        try {
            const result = await request(API.submit(formId), {
                method: "POST",
                body: JSON.stringify({ values }),
            });

            setSuccess("Form submitted successfully.");
            onSubmitSuccess?.(result);
        } catch (error) {
            setApiError(error.message || "Form submission failed.");
        } finally {
            setSubmitting(false);
        }
    };

    const reviewMissing = () => {
        if (missingItems.length > 0) {
            const first = missingItems[0];
            setExpandedId(first.id);
            onItemClick?.(first);
        }
        onReviewMissing?.(missingItems);
    };

    return (
        <aside className="w-full border border-white/10 bg-[#0f0e3a] p-5 text-white sm:p-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#29274f] text-[#c2bfff]">
                    {svg(
                        <>
                            <path d="M9 11l3 3L22 4" />
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                        </>,
                        15
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold leading-tight">
                        AI Checklist
                    </h3>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-[#aaa6d2]">
                        Track your progress and see what's missing.
                    </p>
                </div>
                {formId && (
                    <button
                        type="button"
                        onClick={fetchForm}
                        disabled={loading}
                        className="rounded-lg border border-white/10 p-2 text-[#aaa6d2] transition hover:bg-white/10 disabled:opacity-50"
                        title="Refresh checklist"
                    >
                        {svg(
                            <path d="M20 7v5h-5M4 17v-5h5M5.6 9a7 7 0 0 1 11.6-2L20 12M4 12l2.8 5a7 7 0 0 0 11.6-2" />,
                            15
                        )}
                    </button>
                )}
            </div>

            {/* API feedback */}
            {loading && (
                <p className="mt-4 rounded-lg bg-white/5 p-3 text-xs text-[#aaa6d2]">
                    Loading form checklist...
                </p>
            )}
            {apiError && (
                <div
                    role="alert"
                    className="mt-4 rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-300"
                >
                    {apiError}
                </div>
            )}
            {success && (
                <div
                    role="status"
                    className="mt-4 rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-3 text-xs text-emerald-300"
                >
                    {success}
                </div>
            )}

            {/* Progress card */}
            <div className="mt-5 flex items-center gap-4 rounded-2xl border border-white/10 bg-[#24224f] p-4">
                <ProgressRing percent={percent} />
                <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center justify-between gap-2 text-[11px]">
                        <span className="font-semibold">Form Completion</span>
                        <span className="whitespace-nowrap text-[#aaa6d2]">
                            {done} / {total} fields completed
                        </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                            className="h-full rounded-full bg-[#8f87ff] transition-all duration-500"
                            style={{ width: `${percent}%` }}
                        />
                    </div>
                    {saving && (
                        <p className="mt-2 text-[10px] text-[#aaa6d2]">
                            Saving progress...
                        </p>
                    )}
                </div>
            </div>

            {/* Checklist items */}
            {items.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-white/10 bg-[#24224f] p-6 text-center text-xs text-[#aaa6d2]">
                    No checklist items available.
                </div>
            ) : (
                <ul className="mt-4 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-[#24224f] px-4">
                    {items.map((item) => {
                        const status = STATUS[item.status] || STATUS.pending;
                        const expanded = expandedId === item.id;
                        const isDocument = item.kind === "document";

                        return (
                            <li key={item.id}>
                                <div className="flex items-center gap-3 py-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setExpandedId(
                                                expanded ? null : item.id
                                            );
                                            onItemClick?.(item);
                                        }}
                                        className="group flex min-w-0 flex-1 items-center gap-3 text-left"
                                    >
                                        {status.icon}
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-xs font-semibold text-white transition group-hover:text-[#d8d4ff]">
                                                {item.label}
                                            </span>
                                            <span
                                                className={`mt-0.5 block truncate text-[10px] ${status.noteClass}`}
                                            >
                                                {item.note || status.badge}
                                            </span>
                                        </span>
                                        <span
                                            className={`shrink-0 rounded-lg border px-2.5 py-1 text-[10px] font-semibold ${status.badgeClass}`}
                                        >
                                            {status.badge}
                                        </span>
                                    </button>
                                </div>

                                {expanded && (
                                    <div className="mb-3 ml-8 space-y-2">
                                        {isDocument ? (
                                            <>
                                                {item.value && (
                                                    <p className="break-all text-[10px] text-emerald-300">
                                                        Uploaded: {item.value}
                                                    </p>
                                                )}
                                                <div className="flex flex-wrap gap-2">
                                                    <label className="cursor-pointer rounded-lg bg-white px-3 py-2 text-[10px] font-semibold text-[#111035] hover:bg-[#f0efff]">
                                                        {uploading[item.id]
                                                            ? "Uploading..."
                                                            : item.value
                                                              ? "Replace file"
                                                              : "Upload document"}
                                                        <input
                                                            type="file"
                                                            accept=".pdf,image/*"
                                                            disabled={
                                                                uploading[
                                                                    item.id
                                                                ]
                                                            }
                                                            className="hidden"
                                                            onChange={(event) => {
                                                                const file =
                                                                    event.target
                                                                        .files?.[0];
                                                                if (file) {
                                                                    uploadDocument(
                                                                        item,
                                                                        file
                                                                    );
                                                                }
                                                                event.target.value =
                                                                    "";
                                                            }}
                                                        />
                                                    </label>
                                                    {item.value && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                deleteDocument(
                                                                    item
                                                                )
                                                            }
                                                            className="rounded-lg border border-red-400/30 px-3 py-2 text-[10px] text-red-300 hover:bg-red-400/10"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-[10px] text-[#aaa6d2]">
                                                    Expected: {item.expected}
                                                </p>
                                                <p className="break-words text-[11px] text-white/80">
                                                    Value:{" "}
                                                    {item.value || "Not filled"}
                                                </p>
                                                {item.status === "error" && (
                                                    <p className="text-[10px] text-red-300">
                                                        {item.note}
                                                    </p>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}

            {/* Actions */}
            <button
                type="button"
                onClick={reviewMissing}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-xs font-bold text-[#111035] transition hover:bg-[#f0efff] active:scale-[0.99]"
            >
                {svg(
                    <>
                        <line x1="8" y1="6" x2="21" y2="6" />
                        <line x1="8" y1="12" x2="21" y2="12" />
                        <line x1="8" y1="18" x2="21" y2="18" />
                        <line x1="3" y1="6" x2="3.01" y2="6" />
                        <line x1="3" y1="12" x2="3.01" y2="12" />
                        <line x1="3" y1="18" x2="3.01" y2="18" />
                    </>,
                    14
                )}
                {missingItems.length
                    ? `Review Missing Items (${missingItems.length})`
                    : "Review Checklist"}
            </button>

            {formId && (
                <button
                    type="button"
                    onClick={submitForm}
                    disabled={
                        submitting ||
                        loading ||
                        missingItems.length > 0 ||
                        total === 0
                    }
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#29274f] py-3 text-xs font-bold text-white transition hover:bg-[#353264] disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {submitting ? "Submitting..." : "Submit Form"}
                </button>
            )}
        </aside>
    );
}