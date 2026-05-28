import React, {useState} from "react";
import { addTransaction } from "../services/api";

export default function TransactionForm (){
    const[description, setDescription] = useState("");
    const[amount, setAmount] = useState("");
    const [date, setDate] = useState("");

    const handleSubmit = async()=>{
        await addTransaction({
            description,
            amount: Number(amount),
            date
        });
        setDescription("");
        setAmount("");
        setDate("");
        alert("Transaction Added");
    };

    return (
    <div className="bg-white shadow-md rounded-xl p-5">
      <h2 className="text-xl font-bold mb-4">Add Transaction</h2>

      <input
        className="w-full border p-2 mb-3 rounded"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        className="w-full border p-2 mb-3 rounded"
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <input
        className="w-full border p-2 mb-3 rounded"
        type="date"
        placeholder="Date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-500 text-white p-2 rounded"
      >
        Add
      </button>
    </div>
  );
}