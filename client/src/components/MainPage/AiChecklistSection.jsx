import { toFieldId } from "./GeneratedFormSection";

const svg = (children, size = 14) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {children}
    </svg>
);

const DEFAULT_ITEMS = [
    { id: "fullName", label: "Full Name", status: "done" },
    { id: "dob", label: "Date of Birth", status: "done" },
    { id: "email", label: "Email Address", status: "done" },
    { id: "income", label: "Annual Family Income", status: "missing", note: "Required field - not filled" },
    { id: "incomeCert", label: "Income Certificate", status: "pending", note: "Required document" },
];

/* ------------------------------------------------------------------ */
/* Live validation (used only when `formData` is passed in)            */
/* ------------------------------------------------------------------ */

// What each kind of field needs, and how to detect what's wrong with the typed value.
// check(value) returns null when OK, or { message, fix } when not.
const RULES = {
    email: {
        expected: "A valid email like name@example.com",
        check: (v) => {
            if (/\s/.test(v)) return { message: "Email can't contain spaces.", fix: "Remove the spaces." };
            if (!v.includes("@")) return { message: "Missing the @ symbol.", fix: "Add @ and your provider, e.g. name@example.com." };
            if (v.split("@").length > 2) return { message: "Only one @ is allowed.", fix: "Remove the extra @." };
            const [local, domain] = v.split("@");
            if (!local) return { message: "Nothing before the @.", fix: "Type your username before the @." };
            if (!domain) return { message: "Nothing after the @.", fix: "Add your provider, e.g. gmail.com." };
            if (!/^[^.]+(\.[^.]+)+$/.test(domain) || domain.split(".").pop().length < 2)
                return { message: "The part after @ looks incomplete.", fix: "Use a full domain like gmail.com." };
            return null;
        },
    },
    phone: {
        expected: "10-digit mobile number (+91 optional)",
        check: (v) => {
            if (/[^\d\s+\-()]/.test(v)) return { message: "Phone number has invalid characters.", fix: "Use digits only." };
            let d = v.replace(/\D/g, "");
            if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
            if (d.length < 10) return { message: `Only ${d.length} digits so far.`, fix: `Add ${10 - d.length} more digit(s).` };
            if (d.length > 10) return { message: "Too many digits.", fix: "Use a 10-digit number." };
            if (!/^[6-9]/.test(d)) return { message: "Mobile numbers start with 6, 7, 8 or 9.", fix: "Check the first digit." };
            return null;
        },
    },
    date: {
        expected: "A real date, not in the future",
        check: (v) => {
            const d = new Date(v);
            if (Number.isNaN(d.getTime())) return { message: "This isn't a valid date.", fix: "Pick a date from the calendar." };
            if (d > new Date()) return { message: "Date is in the future.", fix: "Enter a date on or before today." };
            if (d.getFullYear() < 1900) return { message: "Year is too far back.", fix: "Check the year." };
            return null;
        },
    },
    number: {
        expected: "Numbers only (e.g. 250000)",
        check: (v) =>
            /^\d+(\.\d+)?$/.test(v.replace(/[,\s₹]/g, ""))
                ? null
                : { message: "Only numbers are allowed.", fix: "Remove letters or symbols. Commas are fine." },
    },
    name: {
        expected: "Letters only, at least 2 characters",
        check: (v) => {
            if (/\d/.test(v)) return { message: "Name can't contain numbers.", fix: "Remove the digits." };
            if (!/^[A-Za-z\u00C0-\u024F\u0900-\u097F][A-Za-z\u00C0-\u024F\u0900-\u097F\s.'-]*$/.test(v))
                return { message: "Name has invalid characters.", fix: "Use letters, spaces, . ' or - only." };
            if (v.length < 2) return { message: "Name is too short.", fix: "Enter at least 2 letters." };
            return null;
        },
    },
    address: {
        expected: "Complete address, at least 10 characters",
        check: (v) =>
            v.length >= 10
                ? null
                : { message: `Address is too short (${v.length}/10).`, fix: "Add house no., street, city and state." },
    },
    text: {
        expected: "At least 2 characters",
        check: (v) => (v.length >= 2 ? null : { message: "Too short.", fix: "Enter at least 2 characters." }),
    },
};

// Pick the rule from the backend field's name + type
const kindOf = (name = "", type = "") => {
    const n = name.toLowerCase();
    if (type === "email" || n.includes("email")) return "email";
    if (type === "tel" || /phone|mobile/.test(n)) return "phone";
    if (type === "date" || /birth|dob/.test(n)) return "date";
    if (type === "number" || /income|salary|amount/.test(n)) return "number";
    if (type === "textarea" || n.includes("address")) return "address";
    if (n.includes("name")) return "name";
    return "text";
};

// Backend payload + what the user typed -> checklist rows
function deriveItems(formData, values = {}, uploadedDocs = {}) {
    const fields = (formData.fields || []).map((f) => {
        const id = toFieldId(f.name); // same id the form input uses
        const value = String(values[id] ?? f.value ?? "").trim();
        const rule = RULES[kindOf(f.name, f.type)];
        const base = { id, label: f.name, kind: "field", value, expected: rule.expected };

        if (!value) {
            return f.required
                ? { ...base, status: "missing", message: "Not filled yet", fix: "This field is required." }
                : { ...base, status: "optional" };
        }
        const problem = rule.check(value);
        return problem ? { ...base, status: "error", ...problem } : { ...base, status: "done" };
    });

    const docs = (formData.documents || []).map((name) => ({
        id: `doc-${toFieldId(name)}`,
        label: name,
        kind: "document",
        value: uploadedDocs[name] || "",
        expected: "Upload a clear photo or PDF",
        status: uploadedDocs[name] ? "done" : "pending",
    }));

    return [...fields, ...docs];
}

/* ------------------------------------------------------------------ */
/* UI                                                                  */
/* ------------------------------------------------------------------ */

const STATUS = {
    done: {
        badge: "Done",
        note: "Completed",
        badgeClass: "border-emerald-400/40 bg-emerald-500/15 text-emerald-300",
        noteClass: "text-white/50",
        icon: (
            <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                {svg(<polyline points="20 6 9 17 4 12" />, 12)}
            </span>
        ),
    },
    missing: {
        badge: "Missing",
        note: "Required field - not filled",
        badgeClass: "border-amber-400/50 bg-amber-500/15 text-amber-300",
        noteClass: "text-amber-300",
        icon: (
            <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-amber-500 text-[#0f0e3a]">
                {svg(<><line x1="12" y1="6" x2="12" y2="13" /><line x1="12" y1="18" x2="12.01" y2="18" /></>, 12)}
            </span>
        ),
    },
    pending: {
        badge: "Pending",
        note: "Required document",
        badgeClass: "border-white/15 bg-white/5 text-white/60",
        noteClass: "text-white/50",
        icon: <span className="h-[22px] w-[22px] shrink-0 rounded-full border-2 border-white/30" />,
    },
    error: {
        badge: "Error",
        note: "Needs fixing",
        badgeClass: "border-red-400/50 bg-red-500/15 text-red-300",
        noteClass: "text-red-300",
        icon: (
            <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-red-500 text-white">
                {svg(<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>, 12)}
            </span>
        ),
    },
    optional: {
        badge: "Optional",
        note: "Optional - left blank",
        badgeClass: "border-white/15 bg-white/5 text-white/60",
        noteClass: "text-white/50",
        icon: <span className="h-[22px] w-[22px] shrink-0 rounded-full border-2 border-dashed border-white/30" />,
    },
};

function ProgressRing({ percent }) {
    const r = 30;
    const c = 2 * Math.PI * r;
    return (
        <div className="relative h-[72px] w-[72px] shrink-0">
            <svg viewBox="0 0 72 72" className="-rotate-90">
                <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="7" />
                <circle
                    cx="36" cy="36" r={r} fill="none" stroke="#6c63ff" strokeWidth="7" strokeLinecap="round"
                    strokeDasharray={c}
                    strokeDashoffset={c - (c * percent) / 100}
                    className="transition-all duration-500"
                />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                {percent}%
            </span>
        </div>
    );
}

export default function AiChecklist({
    items: itemsProp = DEFAULT_ITEMS,
    formData = null, // backend payload; when present the checklist is built from it
    values = {}, // { [fieldId]: typed value }
    uploadedDocs = {}, // { [docName]: fileName }
    activeId = null,
    onReviewMissing,
    onItemClick,
}) {
    const items = formData ? deriveItems(formData, values, uploadedDocs) : itemsProp;

    // blank optional fields don't count toward progress
    const counted = items.filter((i) => i.status !== "optional");
    const done = counted.filter((i) => i.status === "done").length;
    const total = counted.length;
    const percent = total ? Math.round((done / total) * 100) : 0;
    const errorCount = items.filter((i) => i.status === "error").length;

    return (
        <aside className="rounded-xl border border-white/10 bg-[#0f0e3a] p-4 text-white">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#1c1b55] text-white/80">
                    {svg(<><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>, 15)}
                </div>
                <div>
                    <h3 className="text-sm font-semibold leading-tight">AI Checklist</h3>
                    <p className="text-[11px] text-white/60">Track your progress and see what's missing.</p>
                </div>
            </div>

            {/* Progress card */}
            <div className="mt-4 flex items-center gap-4 rounded-xl border border-white/10 bg-[#15144a] p-3.5">
                <ProgressRing percent={percent} />
                <div className="flex-1">
                    <div className="mb-2 flex items-center justify-between text-[11px]">
                        <span className="font-semibold">Form Completion</span>
                        <span className="text-white/60">{done} / {total} completed</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                            className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                            style={{ width: `${percent}%` }}
                        />
                    </div>
                    {errorCount > 0 && (
                        <p className="mt-2 text-[10px] text-red-300">
                            {errorCount} {errorCount === 1 ? "error" : "errors"} to fix
                        </p>
                    )}
                </div>
            </div>

            {/* Items */}
            <ul aria-live="polite" className="mt-3 divide-y divide-white/10 rounded-xl border border-white/10 bg-[#15144a] px-3.5">
                {items.map((item) => {
                    const s = STATUS[item.status] ?? STATUS.pending;
                    const detailed = item.expected !== undefined; // true for rows built from formData
                    const hasValue = String(item.value ?? "").trim() !== "";
                    return (
                        <li key={item.id} className={item.id === activeId ? "-mx-3.5 bg-white/5 px-3.5" : ""}>
                            <button
                                type="button"
                                onClick={() => onItemClick?.(item)}
                                className="flex w-full items-start gap-3 py-2.5 text-left"
                            >
                                <span className="mt-0.5">{s.icon}</span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs font-semibold">{item.label}</p>

                                    {detailed ? (
                                        <div className="mt-1 space-y-1">
                                            <p className="text-[10px] text-white/50">Needs: {item.expected}</p>
                                            <p className="truncate text-[11px]">
                                                <span className="text-white/50">{item.kind === "document" ? "File: " : "Value: "}</span>
                                                {hasValue ? (
                                                    <span className="text-white/90">{String(item.value)}</span>
                                                ) : (
                                                    <span className="italic text-amber-300/90">
                                                        {item.kind === "document" ? "Not uploaded yet" : "null - not filled yet"}
                                                    </span>
                                                )}
                                            </p>
                                            {item.status === "error" && (
                                                <div className="rounded-md border border-red-400/30 bg-red-500/10 px-2 py-1.5 text-[11px]">
                                                    <p className="font-medium text-red-300">{item.message}</p>
                                                    <p className="mt-0.5 text-white/70">Fix: {item.fix}</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className={`text-[10px] ${s.noteClass}`}>{item.note ?? s.note}</p>
                                    )}
                                </div>
                                <span className={`shrink-0 rounded-md border px-2.5 py-0.5 text-[10px] font-medium ${s.badgeClass}`}>
                                    {s.badge}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>

            {/* CTA */}
            <button
                type="button"
                onClick={onReviewMissing}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-[#25246b] py-2.5 text-xs font-semibold transition hover:bg-[#2e2d7d]"
            >
                {svg(<><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></>, 14)}
                Review Missing Items
            </button>
        </aside>
    );
}
