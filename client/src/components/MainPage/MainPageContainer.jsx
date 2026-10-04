
import AiChecklist from "./AiChecklistSection";
import GeneratedForm from "./GeneratedFormSection";
import TopPanel from "./TopPanel";
export default function MainPageContainer({ top, left, right }) {
    return (
        <div className="min-h-screen bg-[#5e51b5] px-4 py-6 sm:px-[6%] sm:py-10 lg:px-[4%] lg:py-12 2xl:px-[3%]">
            <div className="mx-auto flex w-full max-w-[860px] flex-col gap-[3px] lg:max-w-[1100px] xl:max-w-[1280px] 2xl:max-w-[1480px]">

                <TopPanel></TopPanel>
                <div className="grid grid-cols-1 gap-[3px] lg:grid-cols-[1.85fr_1fr]">
                    <GeneratedForm></GeneratedForm>
                    <AiChecklist></AiChecklist>
                </div>
            </div>
        </div>
    );
}