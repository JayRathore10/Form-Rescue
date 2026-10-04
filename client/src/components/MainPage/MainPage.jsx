/**
 * Lavender outer container.
 *  - top   -> full-width panel (navbar + hero + upload strip)
 *  - left  -> Generated Form panel
 *  - right -> AI Checklist panel
 */
import { useState } from "react";
import AiChecklist from "./AiChecklistSection";
import GeneratedForm, { toFieldId } from "./GeneratedFormSection";
import TopPanel from "./TopPanel";

// Example of what your backend returns (used by the stub below).
const SAMPLE_FORM = {
    title: "Application Form",
    fields: [
        { name: "Name", type: "text", required: true, value: "" },
        { name: "Date of Birth", type: "date", required: true, value: "" },
        { name: "Address", type: "textarea", required: true, value: "" },
    ],
    documents: ["Aadhaar Card", "Photograph", "Signature"],
};

// >>> REPLACE THE BODY OF THIS FUNCTION with your existing backend call.
// It receives the File and must return the JSON shape shown in SAMPLE_FORM.
async function analyzeForm(file) {
    return SAMPLE_FORM;
}

export default function MainPageContainer({ top, left, right }) {
    const [formData, setFormData] = useState(null); // backend payload
    const [formKey, setFormKey] = useState(0); // remounts the form on a new scan
    const [values, setValues] = useState({}); // { [fieldId]: typed value }
    const [uploadedDocs, setUploadedDocs] = useState({}); // { [docName]: fileName }
    const [activeId, setActiveId] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleAnalyze = async (file) => {
        setIsUploading(true);
        try {
            const data = await analyzeForm(file);
            const initial = {};
            (data.fields || []).forEach((f) => {
                initial[toFieldId(f.name)] = f.value ?? "";
            });
            setFormData(data);
            setValues(initial);
            setUploadedDocs({});
            setActiveId(null);
            setFormKey((k) => k + 1);
        } catch (err) {
            console.error("Analyze failed:", err);
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemove = () => {
        setFormData(null);
        setValues({});
        setUploadedDocs({});
        setActiveId(null);
        setFormKey((k) => k + 1);
    };

    const handleChange = (id, value) => setValues((prev) => ({ ...prev, [id]: value }));

    const focusField = (id) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            el.focus();
        }
    };

    // Checklist row click -> focus that input in the form
    const handleItemClick = (item) => focusField(item.id);

    // Jump to the first empty required field (works for the form's own ids)
    const handleReviewMissing = () => {
        if (!formData) return;
        const bad = (formData.fields || []).find((f) => {
            const v = String(values[toFieldId(f.name)] ?? "").trim();
            return f.required && !v;
        });
        if (bad) focusField(toFieldId(bad.name));
    };

    return (
        <div className="min-h-screen bg-[#5e51b5] px-4 py-6 sm:px-[6%] sm:py-10 lg:px-[4%] lg:py-12 2xl:px-[3%]">
            <div className="mx-auto flex w-full max-w-[860px] flex-col gap-[3px] lg:max-w-[1100px] xl:max-w-[1280px] 2xl:max-w-[1480px]">

                <TopPanel
                    onAnalyze={handleAnalyze}
                    onRemove={handleRemove}
                    isUploading={isUploading}
                />
                <div className="grid grid-cols-1 gap-[3px] lg:grid-cols-[1.85fr_1fr]">
                    <GeneratedForm
                        key={formKey}
                        formData={formData}
                        values={values}
                        onChange={handleChange}
                        onFieldFocus={(f) => setActiveId(f.id)}
                        onDocumentUpload={(name, file) =>
                            setUploadedDocs((prev) => ({ ...prev, [name]: file.name }))
                        }
                        onDocumentRemove={(name) =>
                            setUploadedDocs((prev) => {
                                const next = { ...prev };
                                delete next[name];
                                return next;
                            })
                        }
                    />
                    <AiChecklist
                        formData={formData}
                        values={values}
                        uploadedDocs={uploadedDocs}
                        activeId={activeId}
                        onItemClick={handleItemClick}
                        onReviewMissing={handleReviewMissing}
                    />
                </div>
            </div>
        </div>
    );
}
