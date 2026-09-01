import AssetScheduleInputs from "./Statements/AssetScheduleInputs";

export default function AssetSidebar({
    project,
    setProject,
    onAnalyze,
    onSave
}) {

    return (

        <div className="pf-sidebar">

            <div className="pf-sidebar-scroll">

                <AssetScheduleInputs
                    project={project}
                    setProject={setProject}
                />

            </div>

            <div className="pf-sidebar-footer">

                <button
                    className="pf-save-btn"
                    onClick={onSave}
                >
                    Save Project
                </button>

                <button
                    className="pf-run-btn"
                    onClick={onAnalyze}
                >
                    Run Analysis
                </button>

            </div>

        </div>

    );

}