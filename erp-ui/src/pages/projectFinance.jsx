import React, { useEffect, useState } from "react";

import Sidebar from "../components/Project Finance/Sidebar";
import Workspace from "../components/Project Finance/Workspace";
import AssetSidebar from "../components/Project Finance/AssetSidebar";

import "../styles/ProjectFinance.css";

import {
    getProjects,
    getProject,
    analyzeSavedProject, saveProject, updateProject, analyzeProject, buildAssetSchedule, exportProjectExcel
} from "../services/api";



export default function ProjectFinance() {

    const [projects, setProjects] = useState([]);

    const [project, setProject] = useState({

    name: "",

    project_type: "solar",

    project_life: 25,

    tax_rate: 30,

    discount_rate: 10,

    debt_amount: 0,

    interest_rate: 10,

    loan_tenor: 10,

    construction_period_months: 12,

    moratorium_months: 0,

    repayment_frequency: "Monthly",

    repayment_type: "Equal Principal",

    interest_type: "Fixed",

    interest_capitalized: false,

    debt_drawdowns: [
        {
            year: 1,
            drawdown_months: 1,
            drawdown_amount: 0
        }
    ],

    depreciation_years: 15,

    revenue_items: [],
    cogs_items: [],
    opex_items: [],
    fixed_assets: [],
    asset_items: [],
    liability_items: [],
    equity_items: [],

    working_capital: {

        receivable_days: 30,

        payable_days: 30,

        inventory_days: 0

    }
});

    const [selectedProject,
        setSelectedProject] = useState(null);

    const [result, setResult] = useState(null);
    console.log("PROJECT FINANCE RENDER");
    console.log("Current result:", result);

    useEffect(() => {
        console.log("RESULT CHANGED:", result);
    }, [result]);

    const [assetSchedule, setAssetSchedule] = useState([]);
    const [activeTab, setActiveTab] = useState("income");

    const [displayUnit, setDisplayUnit] = useState("million");


    useEffect(() => {

        loadProjects();

    }, []);

    const loadProjects = async () => {

        try {

            const data =
                await getProjects();

            console.log(
                "Projects:",
                data
            );

            setProjects(data);

        } catch (err) {

            console.error(err);

        }

    };

   const handleSave = async()=>{

    if(!result){

        alert("Run the model before saving.");

        return;

    }

    try{

        let saved;

        if(project.id){

            saved = await updateProject(project.id,project);

        }else{

            saved = await saveProject(project);

            setProject(prev => ({
                ...prev,
                id: saved.project_id
            }));


        }

        alert("Project Saved");

        loadProjects();

    }catch(err){

        console.error(err);

    }

}

    const handleProjectSelect =
        async (project) => {

        try {

            const fullProject =
                await getProject(project.id);

            console.log(
                "Selected:",
                fullProject
            );

            setSelectedProject(
                fullProject
            );

            setProject({

            ...project,

            ...fullProject,

            revenue_items:
                fullProject.revenue_items || [],

            cogs_items:
                fullProject.cogs_items || [],

            opex_items:
                fullProject.opex_items || [],

            fixed_assets:
                fullProject.fixed_assets || [],

            asset_items:
                fullProject.asset_items || [],

            liability_items:
                fullProject.liability_items || [],

            equity_items:
                fullProject.equity_items || [],

            debt_drawdowns:
                fullProject.debt_drawdowns || [
                    {
                        year:1,
                        drawdown_months:1,
                        drawdown_amount:0
                    }
                ],

            moratorium_months:
                fullProject.moratorium_months ?? 0,

            repayment_frequency:
                fullProject.repayment_frequency || "Monthly",

            repayment_type:
                fullProject.repayment_type || "Equal Principal",

            interest_type:
                fullProject.interest_type || "Fixed",

            interest_capitalized:
                fullProject.interest_capitalized || false,

            working_capital:
                fullProject.working_capital || {

                    receivable_days: 30,
                    payable_days: 30,
                    inventory_days: 0

                }

        });

        } catch (err) {

            console.error(err);

        }

    };

   const handleAnalyze = async () => {

    try {

        // Send the latest project (including asset schedule)
        const payload = {
            ...project,
            fixed_assets: project.fixed_assets,
            revenue_items: project.revenue_items,
            cogs_items: project.cogs_items, 
            opex_items: project.opex_items,
            asset_items: project.asset_items,
            liability_items: project.liability_items,
            equity_items: project.equity_items,
            debt_drawdowns: project.debt_drawdowns,
            working_capital: project.working_capital,
        };

        console.log("Sending Payload:");
        console.log(payload);

        const analysis = await analyzeProject(payload);

        console.log("Revenue Breakdown:");
        console.log(analysis.projection[1].revenue_breakdown);

        console.log("Analysis Result:");
        console.log(analysis);

        console.log("Projection length:", analysis.projection?.length);
        console.log("Asset Schedule length:", analysis.asset_schedule?.length);

        console.log("Year 1 Projection");
        console.log(analysis.projection?.[0]);
        

        setResult(analysis);

        console.log("Returned Analysis:", analysis);
        console.log("Returned Asset Schedule:", analysis.asset_schedule);
        console.log(
        "YEAR 2 KEYS:",
        Object.keys(analysis.projection[1])
    );

        console.table(analysis.projection[1]);

    } catch (err) {

        console.error("Project Analysis Failed:", err);

    }

};

   const handleExcelDownload = async () => {

    if (!project?.id) {

        alert(
            "Please save the project before downloading the Excel model."
        );

        return;

    }

    try {

        const blob =
            await exportProjectExcel(
                project.id
            );

        const url =
            window.URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            `${project.name || "Project"}_Financial_Model.xlsx`;

        document.body.appendChild(link);

        link.click();

        link.remove();

        window.URL.revokeObjectURL(url);

    } catch (err) {

        console.error(
            "Excel Download Failed:",
            err
        );

        alert(
            "Failed to download Excel model."
        );

    }

};

   const handleRunAssets = async () => {

    try {
        console.log("========== PROJECT SENT ==========");
        console.log(JSON.stringify(project, null, 2));
        

        const response = await buildAssetSchedule(project);

        console.log(response);
        console.log(response.asset_schedule);

        setAssetSchedule(response.asset_schedule);

    } catch(err){

        console.error(err);

    }

}

    return (

        <div className="pf-page">

            <div className="pf-container">

               {

                activeTab === "asset"

                ?

                <AssetSidebar

                    project={project}

                    setProject={setProject}

                    onAnalyze={handleAnalyze}
                     
                    onSave={handleSave}

                />

                :

                <Sidebar

                    projects={projects}

                    project={project}

                    setProject={setProject}

                    selectedProject={selectedProject}

                    onSelectProject={handleProjectSelect}

                    onAnalyze={handleAnalyze}

                    onSave={handleSave}

                />

}

                <Workspace
                    result={result}
                    project={project}
                    setProject={setProject}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    assetSchedule={assetSchedule}
                    displayUnit={displayUnit}
                    setDisplayUnit={setDisplayUnit}
                    onExcelDownload={handleExcelDownload}
                />

            </div>

        </div>

    );

}