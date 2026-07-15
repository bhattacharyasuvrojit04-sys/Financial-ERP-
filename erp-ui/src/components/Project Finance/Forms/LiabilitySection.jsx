export default function LiabilitySection({
    items = [],
    setItems
}) {

    const addItem = () => {

        setItems([
            ...items,
            {
                name: "",
                amount: 0,
                growth_rate: 0
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

    const removeItem = (index) => {

        setItems(
            items.filter(
                (_, i) => i !== index
            )
        );

    };

    return (

        <div className="pf-section">

            <div className="pf-section-title">
                LIABILITIES
            </div>

            {items.map((item, index) => (

                <div
                    key={index}
                    className="pf-card"
                >

                    <input
                        placeholder="Liability Name"
                        value={item.name}
                        onChange={(e)=>

                            updateItem(
                                index,
                                "name",
                                e.target.value
                            )

                        }
                    />

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

                    <input
                        type="number"
                        placeholder="Growth %"
                        value={item.growth_rate}
                        onChange={(e)=>

                            updateItem(
                                index,
                                "growth_rate",
                                Number(e.target.value)
                            )

                        }
                    />

                    <button
                        onClick={() =>
                            removeItem(index)
                        }
                    >
                        ✕
                    </button>

                </div>

            ))}

            <button
                className="pf-chip"
                onClick={addItem}
            >
                + Add Liability
            </button>

        </div>

    );

}