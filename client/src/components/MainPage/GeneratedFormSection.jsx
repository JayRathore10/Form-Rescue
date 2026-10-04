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
};

const DEFAULT_SECTIONS = [
    {
        title: "1. Personal Information",
        fields: [
            { id: "fullName", label: "Full Name", placeholder: "Enter your full name", icon: "user", required: true },
            { id: "dob", label: "Date of Birth", placeholder: "DD / MM / YYYY", icon: "calendar", required: true },
            { id: "email", label: "Email Address", placeholder: "you@example.com", icon: "mail", type: "email", required: true, full: true },
            { id: "phone", label: "Phone Number", placeholder: "+91 98765 43210", icon: "phone", type: "tel", required: true },
            { id: "address", label: "Address", placeholder: "Enter your complete address", icon: "pin", required: true },
        ],
    },
    {
        title: "2. Financial Details",
        fields: [
            { id: "income", label: "Annual Family Income", placeholder: "Enter amount in INR", icon: "rupee", required: true, full: true },
        ],
    },
];

export default function GeneratedForm({
    sections = DEFAULT_SECTIONS,
    values = {},
    onChange, // (fieldId, value) => void
    onFieldFocus, // (field) => void  -> trigger the AI explanation
    onContinue,
}) {
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
                <div className="space-y-5">
                    {sections.map((section) => (
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
                                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
                                                {ICONS[f.icon]}
                                            </span>
                                            <input
                                                id={f.id}
                                                type={f.type || "text"}
                                                value={values[f.id] ?? ""}
                                                placeholder={f.placeholder}
                                                onChange={(e) => onChange?.(f.id, e.target.value)}
                                                onFocus={() => onFieldFocus?.(f)}
                                                className="w-full rounded-lg border border-white/10 bg-[#0f0e3a] py-2.5 pl-9 pr-3 text-xs text-white placeholder:text-white/40 outline-none transition focus:border-[#8f86ff] focus:ring-1 focus:ring-[#8f86ff]"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
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
            </div>
        </section>
    );
}