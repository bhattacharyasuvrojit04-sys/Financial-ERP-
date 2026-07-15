export default function WorkingCapitalInput({
  workingCapital,
  setWorkingCapital
}) {
  return (
    <div className="grid grid-cols-3 gap-4">

      <input
        className="border p-2 rounded"
        type="number"
        placeholder="Receivable Days"
        value={workingCapital.receivable_days}
        onChange={(e) =>
          setWorkingCapital({
            ...workingCapital,
            receivable_days: Number(e.target.value)
          })
        }
      />

      <input
        className="border p-2 rounded"
        type="number"
        placeholder="Payable Days"
        value={workingCapital.payable_days}
        onChange={(e) =>
          setWorkingCapital({
            ...workingCapital,
            payable_days: Number(e.target.value)
          })
        }
      />

      <input
        className="border p-2 rounded"
        type="number"
        placeholder="Inventory Days"
        value={workingCapital.inventory_days}
        onChange={(e) =>
          setWorkingCapital({
            ...workingCapital,
            inventory_days: Number(e.target.value)
          })
        }
      />

    </div>
  );
}