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

const STATUS = {
    done: {
        badge: "Done",
        note: "Completed",
        badgeClass: "border-emerald-400/40 bg-emerald-500/15 text-emerald-300",
        noteClass: "text-white/50",
        icon: (
            <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-emerald-500 text-white">
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
            <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-amber-500 text-[#0f0e3a]">
                {svg(<><line x1="12" y1="6" x2="12" y2="13" /><line x1="12" y1="18" x2="12.01" y2="18" /></>, 12)}
            </span>
        ),
    },
    pending: {
        badge: "Pending",
        note: "Required document",
        badgeClass: "border-white/15 bg-white/5 text-white/60",
        noteClass: "text-white/50",
        icon: <span className="h-[22px] w-[22px] rounded-full border-2 border-white/30" />,
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

export default function AiChecklist({ items = DEFAULT_ITEMS, onReviewMissing, onItemClick }) {
    const done = items.filter((i) => i.status === "done").length;
    const total = items.length;
    const percent = total ? Math.round((done / total) * 100) : 0;

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
                        <span className="text-white/60">{done} / {total} fields completed</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                            className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                            style={{ width: `${percent}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Items */}
            <ul className="mt-3 divide-y divide-white/10 rounded-xl border border-white/10 bg-[#15144a] px-3.5">
                {items.map((item) => {
                    const s = STATUS[item.status] ?? STATUS.pending;
                    return (
                        <li key={item.id}>
                            <button
                                type="button"
                                onClick={() => onItemClick?.(item)}
                                className="flex w-full items-center gap-3 py-2.5 text-left"
                            >
                                {s.icon}
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs font-semibold">{item.label}</p>
                                    <p className={`text-[10px] ${s.noteClass}`}>{item.note ?? s.note}</p>
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