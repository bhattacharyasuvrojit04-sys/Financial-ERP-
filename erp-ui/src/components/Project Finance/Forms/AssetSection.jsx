export default function AssetSection({
    items = [],
    setItems
}) {

    const addItem = () => {

        setItems([
            ...items,
            {
                name: "",
                amount: 0,
                growth_rate: 0,
                asset_type: "investment"
            }
        ]);

    };

    const updateItem = (
        index,
        field,
        value
    ) => {

        const updated = [...items];

        updated[index] = {
            ...updated[index],
            [field]: value
        };

        setItems(updated);

    };

    return (

        <div className="pf-section">

            <div className="pf-section-title">
                ASSETS
            </div>

            {items.map((item, index) => (

                <div
                    key={index}
                    className="pf-card"
                >

                    <input
                        placeholder="Asset Name"
                        value={item.name}
                        onChange={(e)=>

                            updateItem(
                                index,
                                "name",
                                e.target.value
                            )

                        }
                    />

                    <select
                        value={item.asset_type}
                        onChange={(e)=>

                            updateItem(
                                index,
                                "asset_type",
                                e.target.value
                            )

                        }
                    >

                        <option value="investment">
                            Investment
                        </option>

                        <option value="cash">
                            Cash
                        </option>

                        <option value="fixed_asset">
                            Fixed Asset
                        </option>

                    </select>

                    <input
                        type="number"
                        placeholder="Amount"
                        value={item.amount}
                        onChange={(e)=>

                            updateItem(
                                index,
                                "amount",
                                Number(e.target.value)
                            )

                        }
                    />

                </div>

            ))}

            <button
                className="pf-chip"
                onClick={addItem}
            >
                + Add Asset
            </button>

        </div>

    );

}