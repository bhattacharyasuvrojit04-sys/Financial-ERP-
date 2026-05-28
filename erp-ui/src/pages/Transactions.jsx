import { useEffect, useState } from "react";
import Layout from "../components/Layout";

import {
    getTransactions,
    deleteTransaction
} from "../services/api";

export default function Transactions() {

    const [transactions, setTransactions] = useState([]);

    const [search, setSearch] = useState("");

    const loadData = async () => {

        try {

            const data = await getTransactions();

            setTransactions(data);

        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDelete = async (id) => {

        const confirmDelete = window.confirm(
            "Delete transaction?"
        );

        if (!confirmDelete) return;

        try {

            await deleteTransaction(id);

            setTransactions(prev =>
                prev.filter(t => t.id !== id)
            );

        } catch (err) {
            console.error(err);
        }
    };

    const filtered = transactions.filter((t) =>
        t.description
            ?.toLowerCase()
            .includes(search.toLowerCase())
    );

    return (
        <Layout title="Transactions">

            <div
                className="card"
                style={{ padding: "20px" }}
            >

                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "20px"
                }}>

                    <h2>Transactions</h2>

                    <input
                        placeholder="Search transaction..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        style={{
                            padding: "10px",
                            borderRadius: "8px",
                            border: "1px solid #ddd",
                            width: "250px"
                        }}
                    />

                </div>

                <table style={tableStyle}>

                    <thead>
                        <tr>
                            <th style={thStyle}>Date</th>
                            <th style={thStyle}>Description</th>
                            <th style={thStyle}>Amount</th>
                            <th style={thStyle}>Actions</th>
                        </tr>
                    </thead>

                    <tbody>

                        {filtered.map((t) => (

                            <tr key={t.id}>

                                <td style={tdStyle}>
                                    {
                                        new Date(
                                            t.date
                                        ).toLocaleDateString()
                                    }
                                </td>

                                <td style={tdStyle}>
                                    {t.description}
                                </td>

                                <td style={tdStyle}>
                                    ₹ {Number(t.amount)
                                        .toLocaleString("en-IN")}
                                </td>

                                <td style={tdStyle}>

                                    <button
                                        style={editBtn}
                                    >
                                        ✏️
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleDelete(t.id)
                                        }
                                        style={deleteBtn}
                                    >
                                        🗑️
                                    </button>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </Layout>
    );
}

/* ================= STYLES ================= */

const tableStyle = {
    width: "100%",
    borderCollapse: "collapse"
};

const thStyle = {
    textAlign: "left",
    padding: "12px",
    background: "#f8f9fa",
    borderBottom: "1px solid #ddd"
};

const tdStyle = {
    padding: "12px",
    borderBottom: "1px solid #eee"
};

const editBtn = {
    marginRight: "10px",
    border: "none",
    background: "#3b82f6",
    color: "white",
    padding: "8px 10px",
    borderRadius: "6px",
    cursor: "pointer"
};

const deleteBtn = {
    border: "none",
    background: "#ef4444",
    color: "white",
    padding: "8px 10px",
    borderRadius: "6px",
    cursor: "pointer"
};