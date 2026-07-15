export default function LineItemSection({
    title,
    items,
    setItems,
    defaultItem
}) {

    const addItem = () => {

        setItems([
            ...items,
            defaultItem
        ]);

    };

    const updateItem = (
        index,
        field,
        value
    ) => {

        const updated = [...items];

        updated[index][field] = value;

        setItems(updated);

    };

    const removeItem = (index) => {

        const updated =
            items.filter(
                (_, i) => i !== index
            );

        setItems(updated);

    };

    return (

        <div className="pf-line-section">

            <button
                className="pf-chip"
                onClick={addItem}
            >
                + {title}
            </button>

            {

                items.map((item, index) => (

                    <div
                        key={index}
                        className="pf-line-item"
                    >

                        <input
                            placeholder="Name"
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
                                    Number(
                                        e.target.value
                                    )
                                )
                            }
                        />

                        <input
                            type="number"
                            placeholder="Growth %"
                            value={
                                item.growth_rate || 0
                            }
                            onChange={(e)=>
                                updateItem(
                                    index,
                                    "growth_rate",
                                    Number(
                                        e.target.value
                                    )
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

                ))

            }

        </div>

    );

}