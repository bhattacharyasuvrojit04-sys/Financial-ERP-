export default function LiabilityInput({
  item,
  index,
  updateLiability
}) {
  return (
    <div className="grid grid-cols-3 gap-3 mb-3">

      <input
        className="border p-2 rounded"
        placeholder="Liability Name"
        value={item.name}
        onChange={(e) =>
          updateLiability(index, "name", e.target.value)
        }
      />

      <input
        className="border p-2 rounded"
        type="number"
        placeholder="Amount"
        value={item.amount}
        onChange={(e) =>
          updateLiability(index, "amount", Number(e.target.value))
        }
      />

      <input
        className="border p-2 rounded"
        type="number"
        placeholder="Growth Rate"
        value={item.growth_rate}
        onChange={(e) =>
          updateLiability(
            index,
            "growth_rate",
            Number(e.target.value)
          )
        }
      />

    </div>
  );
}