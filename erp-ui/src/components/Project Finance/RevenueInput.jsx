export default function RevenueInput({
  item,
  index,
  updateRevenue
}) {

  return (

    <div className="grid grid-cols-8 gap-2 mb-2">

      <input
        className="border p-2"
        placeholder="Name"
        value={item.name}
        onChange={(e)=>
          updateRevenue(index,"name",e.target.value)
        }
      />

      <select
        className="border p-2"
        value={item.revenue_type}
        onChange={(e)=>
          updateRevenue(index,"revenue_type",e.target.value)
        }
      >
        <option value="solar">
          Solar
        </option>

        <option value="hotel">
          Hotel
        </option>

        <option value="generic">
          Generic
        </option>
      </select>

      <input
        type="number"
        className="border p-2"
        placeholder="MW"
        value={item.capacity_mw}
        onChange={(e)=>
          updateRevenue(
            index,
            "capacity_mw",
            Number(e.target.value)
          )
        }
      />

      <input
        type="number"
        className="border p-2"
        placeholder="Hours"
        value={item.operating_hours}
        onChange={(e)=>
          updateRevenue(
            index,
            "operating_hours",
            Number(e.target.value)
          )
        }
      />

      <input
        type="number"
        className="border p-2"
        placeholder="CUF"
        value={item.cuf}
        onChange={(e)=>
          updateRevenue(
            index,
            "cuf",
            Number(e.target.value)
          )
        }
      />

      <input
        type="number"
        className="border p-2"
        placeholder="Tariff"
        value={item.tariff}
        onChange={(e)=>
          updateRevenue(
            index,
            "tariff",
            Number(e.target.value)
          )
        }
      />

      <input
        type="number"
        className="border p-2"
        placeholder="Esc%"
        value={item.tariff_escalation}
        onChange={(e)=>
          updateRevenue(
            index,
            "tariff_escalation",
            Number(e.target.value)
          )
        }
      />

      <input
        type="number"
        className="border p-2"
        placeholder="Deg%"
        value={item.degradation_rate}
        onChange={(e)=>
          updateRevenue(
            index,
            "degradation_rate",
            Number(e.target.value)
          )
        }
      />

    </div>
  );
}