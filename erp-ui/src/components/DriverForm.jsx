import { useState } from "react";
import { createDriver } from "../services/api";

export default function DriverForm({ onSaved }) {
  const [form, setForm] = useState({
    users: "",
    user_growth: "",
    arpu: "",
    arpu_growth: "",
    fixed_cost: "",
    variable_cost_pct: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: Number(e.target.value),
    });
  };

  const handleSubmit = async () => {
  try {
    const payload = {
      users: Number(form.users),
      user_growth: Number(form.user_growth),
      arpu: Number(form.arpu),
      arpu_growth: Number(form.arpu_growth),
      fixed_cost: Number(form.fixed_cost),
      variable_cost_pct: Number(form.variable_cost_pct),
    };

    console.log("SENDING DRIVER:", payload); // 🔥 DEBUG

    await createDriver(payload);

    alert("Driver saved!");
    onSaved && onSaved();
  } catch (err) {
    console.error(err);
    alert("Error saving driver");
   }
 };

  return (
    <div className="border p-4 rounded mb-4">
      <h3 className="font-bold mb-2">Driver Inputs</h3>

      {Object.keys(form).map((key) => (
        <input
          key={key}
          name={key}
          placeholder={key}
          onChange={handleChange}
          className="border p-1 m-1"
        />
      ))}

      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white px-3 py-1 rounded mt-2"
      >
        Save Driver
      </button>
    </div>
  );
}