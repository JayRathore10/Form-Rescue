/**
 * Lavender outer container.
 *  - top   -> full-width panel (navbar + hero + upload strip)
 *  - left  -> Generated Form panel
 *  - right -> AI Checklist panel
 */
import { useState } from "react";
import AiChecklist from "./AiChecklistSection";
import GeneratedForm from "./GeneratedFormSection";
import { toFieldId } from "../../utils/formUtils";
import TopPanel from "./TopPanel";
import AuthModal from "./AuthModal";
import {
    analyzeFormFile,
    uploadFormFile,
    getFieldAiExplanation,
} from "../../services/mainpage";
import {
    signin,
    signup,
    logout,
    getSavedUser,
} from "../../services/auth";

export default function MainPageContainer() {
    const [formData, setFormData] = useState(null); // backend payload
    const [formKey, setFormKey] = useState(0); // remounts the form on a new scan
    const [values, setValues] = useState({}); // { [fieldId]: typed value }
    const [uploadedDocs, setUploadedDocs] = useState({}); // { [docName]: fileName }
    const [activeId, setActiveId] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    // Auth state
    const [currentUser, setCurrentUser] = useState(() => getSavedUser());
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState("signin");

    // AI Explanation state
    const [aiExplanation, setAiExplanation] = useState(null);
    const [isExplaining, setIsExplaining] = useState(false);

    const handleAnalyze = async (file) => {
        setIsUploading(true);
        setErrorMessage(null);
        try {
            const data = await analyzeFormFile(file);
            if (!data) {
                throw new Error("No form structure returned by backend");
            }
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
            setErrorMessage(
                err?.message || "Failed to analyze form. Please ensure the backend is running."
            );
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemove = () => {
        setFormData(null);
        setValues({});
        setUploadedDocs({});
        setActiveId(null);
        setErrorMessage(null);
        setAiExplanation(null);
        setFormKey((k) => k + 1);
    };

    const handleChange = (id, value) => setValues((prev) => ({ ...prev, [id]: value }));

    const handleFieldFocus = async (field) => {
        setActiveId(field.id);
        if (!field?.label && !field?.name) return;
        setIsExplaining(true);
        try {
            const text = await getFieldAiExplanation({
                fieldName: field.label || field.name,
                fieldType: field.type,
                formTitle: formData?.title || "Application Form",
                currentValue: values[field.id] || "",
            });
            setAiExplanation({
                fieldId: field.id,
                fieldName: field.label || field.name,
                text,
            });
        } catch (err) {
            console.warn("AI explanation request failed:", err);
        } finally {
            setIsExplaining(false);
        }
    };

    const handleDocumentUpload = async (name, file) => {
        try {
            setUploadedDocs((prev) => ({ ...prev, [name]: file.name }));
            // Also upload file to backend server storage
            await uploadFormFile(file);
        } catch (err) {
            console.error("Document upload failed:", err);
        }
    };

    const handleDocumentRemove = (name) => {
        setUploadedDocs((prev) => {
            const next = { ...prev };
            delete next[name];
            return next;
        });
    };

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

    // Auth handlers
    const handleLoginClick = () => {
        setAuthMode("signin");
        setAuthModalOpen(true);
    };

    const handleSignupClick = () => {
        setAuthMode("signup");
        setAuthModalOpen(true);
    };

    const handleLogout = async () => {
        await logout();
        setCurrentUser(null);
    };

    const handleAuthSuccess = () => {
        setCurrentUser(getSavedUser());
        setAuthModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-[#5e51b5] px-4 py-6 sm:px-[6%] sm:py-10 lg:px-[4%] lg:py-12 2xl:px-[3%]">
            <div className="mx-auto flex w-full max-w-[860px] flex-col gap-[3px] lg:max-w-[1100px] xl:max-w-[1280px] 2xl:max-w-[1480px]">
                <TopPanel
                    onAnalyze={handleAnalyze}
                    onRemove={handleRemove}
                    isUploading={isUploading}
                    currentUser={currentUser}
                    onLogin={handleLoginClick}
                    onSignup={handleSignupClick}
                    onLogout={handleLogout}
                />

                {errorMessage && (
                    <div className="flex items-center justify-between rounded-lg border border-red-400/40 bg-red-950/80 p-3.5 text-xs text-red-200">
                        <span>{errorMessage}</span>
                        <button
                            type="button"
                            onClick={() => setErrorMessage(null)}
                            className="ml-3 font-semibold text-red-300 hover:text-white"
                        >
                            ✕
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-[3px] lg:grid-cols-[1.85fr_1fr]">
                    <GeneratedForm
                        key={formKey}
                        formData={formData}
                        values={values}
                        onChange={handleChange}
                        onFieldFocus={handleFieldFocus}
                        onDocumentUpload={handleDocumentUpload}
                        onDocumentRemove={handleDocumentRemove}
                        aiExplanation={aiExplanation}
                        isExplaining={isExplaining}
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

            <AuthModal
                isOpen={authModalOpen}
                mode={authMode}
                onClose={() => setAuthModalOpen(false)}
                onSuccess={handleAuthSuccess}
                onSignin={signin}
                onSignup={signup}
            />
        </div>
    );
}

