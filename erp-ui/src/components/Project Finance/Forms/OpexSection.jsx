export default function OpexSection({
    items = [],
    setItems
}) {

    const addItem = () => {

        setItems([
            ...items,
            {
                name: "",
                amount: 0,
                escalation_rate: 0
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
                OPEX
            </div>

            {items.map((item, index) => (

                <div
                    key={index}
                    className="pf-card"
                >

                    <input
                        placeholder="Expense Name"
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
                        placeholder="Escalation %"
                        value={item.escalation_rate}
                        onChange={(e)=>

                            updateItem(
                                index,
                                "escalation_rate",
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
                + Add Opex
            </button>

        </div>

    );

}