import React, { useEffect, useState } from "react";

import Sidebar from "../components/Project Finance/Sidebar";
import Workspace from "../components/Project Finance/Workspace";

import "../styles/ProjectFinance.css";

import {
    getProjects,
    getProject,
    analyzeSavedProject, saveProject, updateProject, analyzeProject
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
    opex_items: [],
    capex_items: [],
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

            opex_items:
                fullProject.opex_items || [],

            capex_items:
                fullProject.capex_items || [],

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

    const handleAnalyze =
        async () => {

        try {

            const analysis =
                await analyzeProject(project);

            console.log(
                "Analysis:",
                analysis
            );

            setResult(analysis);

        } catch (err) {

            console.error(err);

        }

    };

    return (

        <div className="pf-page">

            <div className="pf-container">

                <Sidebar
                    projects={projects}

                    project={project}
                    setProject={setProject}

                    selectedProject={selectedProject}
                    onSelectProject={handleProjectSelect}

                    onAnalyze={handleAnalyze}
                    onSave={handleSave}
                />

                <Workspace
                    result={result}
                />

            </div>

        </div>

    );

}