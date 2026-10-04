import { useState } from "react";

import AiChecklist from "./AiChecklistSection";
import GeneratedForm from "./GeneratedFormSection";
import TopPanel from "./TopPanel";
import AuthModal from "./AuthModal";

import { toFieldId } from "../../utils/formUtils";

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
    // Form state
    const [formData, setFormData] = useState(null);
    const [formKey, setFormKey] = useState(0);
    const [values, setValues] = useState({});
    const [uploadedDocs, setUploadedDocs] = useState({});
    const [activeId, setActiveId] = useState(null);

    // Loading / error state
    const [isUploading, setIsUploading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    // Auth state
    const [currentUser, setCurrentUser] = useState(() =>
        getSavedUser()
    );
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState("signin");

    // AI explanation state
    const [aiExplanation, setAiExplanation] = useState(null);
    const [isExplaining, setIsExplaining] = useState(false);

    // ---------------------------------------
    // Analyze form
    // ---------------------------------------

    const handleAnalyze = async (file) => {
        if (!file) return;

        setIsUploading(true);
        setErrorMessage(null);

        try {
            const data = await analyzeFormFile(file);

            if (!data) {
                throw new Error(
                    "No form structure returned by backend."
                );
            }

            const initial = {};

            (data.fields || []).forEach((field) => {
                initial[toFieldId(field.name)] =
                    field.value ?? "";
            });

            setFormData(data);
            setValues(initial);
            setUploadedDocs({});
            setActiveId(null);
            setAiExplanation(null);

            // Force GeneratedForm to remount
            setFormKey((key) => key + 1);
        } catch (err) {
            console.error("Analyze failed:", err);

            setErrorMessage(
                err?.message ||
                    "Failed to analyze form. Please make sure the backend is running."
            );
        } finally {
            setIsUploading(false);
        }
    };

    // ---------------------------------------
    // Remove current form
    // ---------------------------------------

    const handleRemove = () => {
        setFormData(null);
        setValues({});
        setUploadedDocs({});
        setActiveId(null);
        setAiExplanation(null);
        setErrorMessage(null);

        setFormKey((key) => key + 1);
    };

    // ---------------------------------------
    // Form field change
    // ---------------------------------------

    const handleChange = (id, value) => {
        setValues((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    // ---------------------------------------
    // Field focus + AI explanation
    // ---------------------------------------

    const handleFieldFocus = async (field) => {
        if (!field) return;

        setActiveId(field.id);

        const fieldName = field.label || field.name;

        if (!fieldName) return;

        setIsExplaining(true);

        try {
            const text = await getFieldAiExplanation({
                fieldName,
                fieldType: field.type,
                formTitle:
                    formData?.title || "Application Form",
                currentValue: values[field.id] || "",
            });

            setAiExplanation({
                fieldId: field.id,
                fieldName,
                text,
            });
        } catch (err) {
            console.warn(
                "AI explanation request failed:",
                err
            );
        } finally {
            setIsExplaining(false);
        }
    };

    // ---------------------------------------
    // Document upload
    // ---------------------------------------

    const handleDocumentUpload = async (name, file) => {
        if (!file) return;

        try {
            // Show selected file immediately
            setUploadedDocs((prev) => ({
                ...prev,
                [name]: file.name,
            }));

            // Upload actual file to backend
            await uploadFormFile(file);
        } catch (err) {
            console.error(
                "Document upload failed:",
                err
            );

            setErrorMessage(
                err?.message ||
                    "Failed to upload document."
            );

            // Remove failed upload from UI
            setUploadedDocs((prev) => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
    };

    // ---------------------------------------
    // Document remove
    // ---------------------------------------

    const handleDocumentRemove = (name) => {
        setUploadedDocs((prev) => {
            const next = { ...prev };

            delete next[name];

            return next;
        });
    };

    // ---------------------------------------
    // Focus form field
    // ---------------------------------------

    const focusField = (id) => {
        const element = document.getElementById(id);

        if (!element) return;

        element.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });

        element.focus();
    };

    // ---------------------------------------
    // Checklist item click
    // ---------------------------------------

    const handleItemClick = (item) => {
        if (!item?.id) return;

        focusField(item.id);
    };

    // ---------------------------------------
    // Review missing fields
    // ---------------------------------------

    const handleReviewMissing = () => {
        if (!formData) return;

        const missingField = (
            formData.fields || []
        ).find((field) => {
            const value = String(
                values[toFieldId(field.name)] ?? ""
            ).trim();

            return field.required && !value;
        });

        if (missingField) {
            focusField(
                toFieldId(missingField.name)
            );
        }
    };

    // ---------------------------------------
    // Authentication
    // ---------------------------------------

    const handleLoginClick = () => {
        setAuthMode("signin");
        setAuthModalOpen(true);
    };

    const handleSignupClick = () => {
        setAuthMode("signup");
        setAuthModalOpen(true);
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (err) {
            console.error("Logout failed:", err);
        } finally {
            setCurrentUser(null);
        }
    };

    const handleAuthSuccess = () => {
        const user = getSavedUser();

        setCurrentUser(user);
        setAuthModalOpen(false);
    };

    return (
        <div className="min-h-screen w-full bg-[#5e51b5]">
            <div className="flex w-full flex-col gap-[3px]">

                {/* Top navbar + hero + upload */}
                <TopPanel
                    onAnalyze={handleAnalyze}
                    onRemove={handleRemove}
                    isUploading={isUploading}
                    currentUser={currentUser}
                    onLogin={handleLoginClick}
                    onSignup={handleSignupClick}
                    onLogout={handleLogout}
                />

                {/* API / AI error */}
                {errorMessage && (
                    <div className="flex items-center justify-between rounded-lg border border-red-400/40 bg-red-950/80 p-3.5 text-xs text-red-200">
                        <span>
                            {errorMessage}
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                setErrorMessage(null)
                            }
                            className="ml-3 font-semibold text-red-300 hover:text-white"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Main content */}
                <div className="grid w-full grid-cols-1 gap-[3px] lg:grid-cols-[1.85fr_1fr]">

                    {/* Generated form */}
                    <GeneratedForm
                        key={formKey}
                        formData={formData}
                        values={values}
                        onChange={handleChange}
                        onFieldFocus={handleFieldFocus}
                        onDocumentUpload={
                            handleDocumentUpload
                        }
                        onDocumentRemove={
                            handleDocumentRemove
                        }
                        aiExplanation={aiExplanation}
                        isExplaining={isExplaining}
                    />

                    {/* AI checklist */}
                    <AiChecklist
                        formData={formData}
                        values={values}
                        uploadedDocs={uploadedDocs}
                        activeId={activeId}
                        onItemClick={handleItemClick}
                        onReviewMissing={
                            handleReviewMissing
                        }
                    />
                </div>
            </div>

            {/* Authentication modal */}
            <AuthModal
                isOpen={authModalOpen}
                mode={authMode}
                onClose={() =>
                    setAuthModalOpen(false)
                }
                onSuccess={handleAuthSuccess}
                onSignin={signin}
                onSignup={signup}
            />
        </div>
    );
}
