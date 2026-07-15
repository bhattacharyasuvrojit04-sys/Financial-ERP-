export default function OpexInput({
  item,
  index,
  updateOpex
}) {
  return (
    <div className="grid grid-cols-3 gap-3 mb-3">

      <input
        className="border p-2 rounded"
        placeholder="Expense Name"
        value={item.name}
        onChange={(e) =>
          updateOpex(index, "name", e.target.value)
        }
      />

      <input
        className="border p-2 rounded"
        type="number"
        placeholder="Amount"
        value={item.amount}
        onChange={(e) =>
          updateOpex(index, "amount", Number(e.target.value))
        }
      />

      <input
        className="border p-2 rounded"
        type="number"
        placeholder="Escalation %"
        value={item.escalation_rate}
        onChange={(e) =>
          updateOpex(
            index,
            "escalation_rate",
            Number(e.target.value)
          )
        }
      />

    </div>
  );
}