export default function AssetInput({
  item,
  index,
  updateAsset
}) {
  return (
    <div className="border rounded p-4 mb-4">

      <h3 className="font-semibold mb-2">
        Asset #{index + 1}
      </h3>

      <div className="grid grid-cols-4 gap-3">

        <input
          className="border p-2 rounded"
          placeholder="Asset Name"
          value={item.name}
          onChange={(e) =>
            updateAsset(index, "name", e.target.value)
          }
        />

        <input
          type="number"
          className="border p-2 rounded"
          placeholder="Amount"
          value={item.amount}
          onChange={(e) =>
            updateAsset(
              index,
              "amount",
              Number(e.target.value)
            )
          }
        />

        <input
          type="number"
          className="border p-2 rounded"
          placeholder="Growth Rate"
          value={item.growth_rate}
          onChange={(e) =>
            updateAsset(
              index,
              "growth_rate",
              Number(e.target.value)
            )
          }
        />

        <select
          className="border p-2 rounded"
          value={item.asset_type}
          onChange={(e) =>
            updateAsset(
              index,
              "asset_type",
              e.target.value
            )
          }
        >
          <option value="current">
            Current
          </option>

          <option value="non_current">
            Non Current
          </option>
        </select>

      </div>

    </div>
  );
}