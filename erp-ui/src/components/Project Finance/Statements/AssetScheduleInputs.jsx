export default function AssetScheduleInputs({

    project,
    setProject

}) {

    const assets = project?.fixed_assets || [];

    const updateAsset = (index, field, value) => {

        const updated = [...assets];

        updated[index] = {

            ...updated[index],

            [field]: value

        };

        setProject({

            ...project,

            fixed_assets: updated

        });

    };

    const addAsset = () => {

        setProject({

            ...project,

            fixed_assets: [

                ...assets,

                {

                    asset_name: "",

                    asset_category: "Plant & Machinery",

                    purchase_year: 1,

                    purchase_cost: 0,

                    useful_life: 15,

                    depreciation_method: "SLM",

                    depreciation_rate: 15,

                    salvage_value: 0,

                    is_land: false,

                    sale_year: 0,

                    sale_value: 0,

                    notes: ""

                }

            ]

        });

    };

    const deleteAsset = (index) => {

        const updated = assets.filter((_, i) => i !== index);

        setProject({

            ...project,

            fixed_assets: updated

        });

    };

    const formatCurrency = (value) => {

    if (value === "" || value === null) return "";

    return new Intl.NumberFormat(

        "en-IN",

        {

            maximumFractionDigits:0

        }

    ).format(value);

};

    const totalPurchaseCost = project.fixed_assets.reduce(
    (sum, asset) => sum + Number(asset.purchase_cost || 0),
    0
);

    return (

        <div className="asset-page">

           <div className="asset-header">

                <div className="asset-summary-card">

                    <div className="summary-title">
                        Total Purchase Cost
                    </div>

                    <div className="summary-value">
                        ₹ {formatCurrency(totalPurchaseCost)}
                    </div>

                </div>

                <button
                    onClick={addAsset}
                >
                    + Add Asset
                </button>

            </div>

            <div className="asset-form-container">

    {assets.map((asset, index) => (

        <div
            className="asset-card"
            key={index}
        >

            <h3>

                Asset {index + 1}

            </h3>

            <label>

                Asset Name

                <input

                    value={asset.asset_name ?? ""}

                    onChange={(e)=>

                        updateAsset(

                            index,

                            "asset_name",

                            e.target.value

                        )

                    }

                />

            </label>

            <label>

                Category

                <select

                    value={asset.asset_category ?? "Plant & Machinery"}

                    onChange={(e)=>

                        updateAsset(

                            index,

                            "asset_category",

                            e.target.value

                        )

                    }

                >

                    <option>Land</option>
                    <option>Building</option>
                    <option>Plant & Machinery</option>
                    <option>Electrical</option>
                    <option>Furniture</option>
                    <option>Vehicle</option>
                    <option>Computer</option>
                    <option>Other</option>

                </select>

            </label>

            <label>

                Purchase Cost

                <input

                    type="number"

                    value={asset.purchase_cost ?? 0}

                    onChange={(e)=>

                        updateAsset(

                            index,

                            "purchase_cost",

                            Number(e.target.value)

                        )

                    }

                />

            </label>

            <label>

                Purchase Year

                <input

                    type="number"

                    value={asset.purchase_year ?? 1}

                    onChange={(e)=>

                        updateAsset(

                            index,

                            "purchase_year",

                            Number(e.target.value)

                        )

                    }

                />

            </label>

            <label>

                Useful Life

                <input

                    type="number"

                    value={asset.useful_life ?? 15}

                    onChange={(e)=>

                        updateAsset(

                            index,

                            "useful_life",

                            Number(e.target.value)

                        )

                    }

                />

            </label>

            <label>

                Depreciation Method

                <select

                    value={asset.depreciation_method ?? "SLM"}

                    onChange={(e)=>

                        updateAsset(

                            index,

                            "depreciation_method",

                            e.target.value

                        )

                    }

                >

                    <option>SLM</option>

                    <option>WDV</option>

                </select>

            </label>

            <label>
                Depreciation Rate (%)

                <input
                    type="number"
                    value={asset.depreciation_rate ?? 15}
                    onChange={(e) =>
                        updateAsset(
                            index,
                            "depreciation_rate",
                            Number(e.target.value)
                        )
                    }
                />
            </label>

            <label>

                Salvage Value

                <input

                    type="number"

                    value={asset.salvage_value ?? 0}

                    onChange={(e)=>

                        updateAsset(

                            index,

                            "salvage_value",

                            Number(e.target.value)

                        )

                    }

                />

            </label>

            <label>

                Sale Year

                <input

                    type="number"

                    value={asset.sale_year ?? 0}

                    onChange={(e)=>

                        updateAsset(

                            index,

                            "sale_year",

                            Number(e.target.value)

                        )

                    }

                />

            </label>

            <label>

                Sale Value

                <input

                    type="number"

                    value={asset.sale_value ?? 0}

                    onChange={(e)=>

                        updateAsset(

                            index,

                            "sale_value",

                            Number(e.target.value)

                        )

                    }

                />

            </label>

            <button

                className="delete-btn"

                onClick={()=>

                    deleteAsset(index)

                }

            >

                Delete Asset

            </button>

        </div>

    ))}

</div>

        </div>

    );

}