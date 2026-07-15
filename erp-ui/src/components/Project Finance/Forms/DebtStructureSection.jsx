import React from "react";
import { FiTrash2 } from "react-icons/fi";

export default function DebtStructureSection({ project, setProject }) {

    const updateDrawdown = (index, field, value) => {

        const updated = [...(project.debt_drawdowns || [])];

        updated[index] = {
            ...updated[index],
            [field]:
                field === "drawdown_amount"
                    ? Number(value)
                    : Number(value)
        };

        setProject({
            ...project,
            debt_drawdowns: updated
        });

    };

    const addDrawdown = () => {

        setProject({

            ...project,

            debt_drawdowns: [

                ...(project.debt_drawdowns || []),

                {

                    year: 1,

                    drawdown_months: 1,

                    drawdown_amount: 0

                }

            ]

        });

    };

    const removeDrawdown = (index) => {

        const updated =
            [...project.debt_drawdowns];

        updated.splice(index, 1);

        setProject({

            ...project,

            debt_drawdowns: updated

        });

    };

    return (

        <div className="pf-section">

            <div className="pf-section-title">
                DEBT STRUCTURE
            </div>

            <label>Debt Amount</label>

            <input
                type="number"
                value={project.debt_amount || 0}
                onChange={(e)=>

                    setProject({

                        ...project,

                        debt_amount:
                            Number(e.target.value)

                    })

                }
            />

            <label>Interest Rate (%)</label>

            <input
                type="number"
                value={project.interest_rate || 0}
                onChange={(e)=>

                    setProject({

                        ...project,

                        interest_rate:
                            Number(e.target.value)

                    })

                }
            />

            <label>Loan Tenor (Years)</label>

            <input
                type="number"
                value={project.loan_tenor || 0}
                onChange={(e)=>

                    setProject({

                        ...project,

                        loan_tenor:
                            Number(e.target.value)

                    })

                }
            />

            <div className="pf-field">
            <label>Construction Period (Months)</label>

            <input
                type="number"
                value={project.construction_period_months}
                onChange={(e)=>

                    setProject({

                        ...project,

                        construction_period_months:
                        Number(e.target.value)

                    })

                }
            />
        </div>

            <label>Moratorium (Months)</label>

            <input
                type="number"
                value={project.moratorium_months || 0}
                onChange={(e)=>

                    setProject({

                        ...project,

                        moratorium_months:
                            Number(e.target.value)

                    })

                }
            />

            <label>Repayment Frequency</label>

            <select

                value={project.repayment_frequency || "Monthly"}

                onChange={(e)=>

                    setProject({

                        ...project,

                        repayment_frequency:
                            e.target.value

                    })

                }

            >

                <option>Monthly</option>
                <option>Quarterly</option>
                <option>Half Yearly</option>
                <option>Yearly</option>

            </select>

            <label>Repayment Type</label>

            <select

                value={project.repayment_type || "Equal Principal"}

                onChange={(e)=>

                    setProject({

                        ...project,

                        repayment_type:
                            e.target.value

                    })

                }

            >

                <option>Equal Principal</option>
                <option>EMI</option>
                <option>Bullet</option>

            </select>

            <label>Interest Type</label>

            <select

                value={project.interest_type || "Fixed"}

                onChange={(e)=>

                    setProject({

                        ...project,

                        interest_type:
                            e.target.value

                    })

                }

            >

                <option>Fixed</option>
                <option>Floating</option>

            </select>

                <div className="pf-checkbox-row">

                    <input
                        id="capitalizedInterest"
                        type="checkbox"
                        checked={project.interest_capitalized || false}
                        onChange={(e)=>
                            setProject({
                                ...project,
                                interest_capitalized:e.target.checked
                            })
                        }
                    />

                    <label htmlFor="capitalizedInterest">
                        Capitalize Interest During Moratorium
                    </label>

                </div>

            <hr />

            <div className="pf-section-title">

                Debt Drawdowns

            </div>

            <div className="pf-drawdown-header">
                <span>Year</span>
                <span>Month</span>
                <span>Amount</span>
                <span></span>
            </div>

            {(project.debt_drawdowns || []).map(

                (row, index)=>(

                    <div
                        key={index}
                        className="pf-drawdown-row"
                    >

                        <input
                            className="pf-small-input"

                            type="number"

                            placeholder="Year"

                            value={row.year}

                            onChange={(e)=>

                                updateDrawdown(

                                    index,

                                    "year",

                                    e.target.value

                                )

                            }

                        />

                        <input
                            className="pf-small-input"

                            type="number"

                            placeholder="Month"

                            value={row.drawdown_months}

                            onChange={(e)=>

                                updateDrawdown(

                                    index,

                                    "drawdown_months",

                                    e.target.value

                                )

                            }

                        />

                        <input
                            className="pf-small-input"

                            type="number"

                            placeholder="Amount"

                            value={row.drawdown_amount}

                            onChange={(e)=>

                                updateDrawdown(

                                    index,

                                    "drawdown_amount",

                                    e.target.value

                                )

                            }

                        />

                        <button
                            className="pf-delete-btn"
                            onClick={() => removeDrawdown(index)}
                        >
                            <FiTrash2 />
                        </button>

                    </div>

                )

            )}

            <button
                type="button"
                className="pf-add-btn"
                onClick={addDrawdown}
            >

                + Add Drawdown

            </button>

        </div>

    );

}