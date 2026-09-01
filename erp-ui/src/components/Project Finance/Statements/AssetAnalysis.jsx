export default function AssetAnalysis({ result, assetSchedule }) {

    console.log("RESULT:", result);

    console.log("ASSET SCHEDULE:", result?.asset_schedule);

    const projection = result?.projection || [];
    const schedule = result?.asset_schedule || [];

    if (schedule.length === 0) {

        return (

            <div className="asset-analysis">

                <h2>Fixed Asset Schedule</h2>

                <p>No Asset Schedule Generated.</p>

            </div>

        );

    }

    return (

        <div className="asset-analysis">

            <h2>Fixed Asset Schedule</h2>

            {/* ---------------- Gross Block ---------------- */}

            <div className="asset-section">

                <h3>Gross Block</h3>

                <div className="asset-analysis-table">

                    <table>

                        <thead>

                            <tr>

                                <th>Description</th>

                                {schedule.map((row) => (

                                    <th key={row.year}>

                                        Year {row.year}

                                    </th>

                                ))}

                            </tr>

                        </thead>

                        <tbody>

                            <tr>

                                <td>Opening Gross Block</td>

                                {schedule.map((row, index) => (

                                    <td key={index}>

                                        {

                                            index === 0

                                                ? 0

                                                : schedule[index - 1].total_gross_block.toLocaleString()

                                        }

                                    </td>

                                ))}

                            </tr>

                            <tr>

                                <td>Additions</td>

                                {schedule.map((row, index) => (

                                    <td key={index}>

                                        {

                                            row.assets

                                                .reduce(

                                                    (sum, asset) =>

                                                        sum + asset.purchase,

                                                    0

                                                )

                                                .toLocaleString()

                                        }

                                    </td>

                                ))}

                            </tr>

                            <tr>

                                <td>Disposals</td>

                                {schedule.map((row, index) => (

                                    <td key={index}>

                                        {

                                            row.assets

                                                .reduce(

                                                    (sum, asset) =>

                                                        sum + asset.sale,

                                                    0

                                                )

                                                .toLocaleString()

                                        }

                                    </td>

                                ))}

                            </tr>

                            <tr>

                                <td><b>Closing Gross Block</b></td>

                                {schedule.map((row, index) => (

                                    <td key={index}>

                                        <b>

                                            {row.total_gross_block.toLocaleString()}

                                        </b>

                                    </td>

                                ))}

                            </tr>

                        </tbody>

                    </table>

                </div>

            </div>

            {/* ---------------- Depreciation ---------------- */}

            <div className="asset-section">

                <h3>Depreciation</h3>

                <div className="asset-analysis-table">

                    <table>

                        <thead>

                            <tr>

                                <th>Description</th>

                                {schedule.map((row) => (

                                    <th key={row.year}>

                                        Year {row.year}

                                    </th>

                                ))}

                            </tr>

                        </thead>

                        <tbody>

                            <tr>

                                <td>Depreciation Expense</td>

                                {schedule.map((row, index) => (

                                    <td key={index}>

                                        {

                                            row.assets

                                                .reduce(

                                                    (sum, asset) =>

                                                        sum + asset.depreciation,

                                                    0

                                                )

                                                .toLocaleString()

                                        }

                                    </td>

                                ))}

                            </tr>

                        </tbody>

                    </table>

                </div>

            </div>

            {/* ---------------- Accumulated Depreciation ---------------- */}

            <div className="asset-section">

                <h3>Accumulated Depreciation</h3>

                <div className="asset-analysis-table">

                    <table>

                        <thead>

                            <tr>

                                <th>Description</th>

                                {schedule.map((row) => (

                                    <th key={row.year}>

                                        Year {row.year}

                                    </th>

                                ))}

                            </tr>

                        </thead>

                        <tbody>

                            <tr>

                                <td>Opening Accumulated Depreciation</td>

                                {schedule.map((row, index) => (

                                    <td key={index}>

                                        {

                                            index === 0

                                                ? 0

                                                : schedule[index - 1].total_acc_dep.toLocaleString()

                                        }

                                    </td>

                                ))}

                            </tr>

                            <tr>

                                <td>Current Year Depreciation</td>

                                {schedule.map((row, index) => (

                                    <td key={index}>

                                        {

                                            row.assets

                                                .reduce(

                                                    (sum, asset) =>

                                                        sum + asset.depreciation,

                                                    0

                                                )

                                                .toLocaleString()

                                        }

                                    </td>

                                ))}

                            </tr>

                            <tr>

                                <td><b>Closing Accumulated Depreciation</b></td>

                                {schedule.map((row, index) => (

                                    <td key={index}>

                                        <b>

                                            {row.total_acc_dep.toLocaleString()}

                                        </b>

                                    </td>

                                ))}

                            </tr>

                        </tbody>

                    </table>

                </div>

            </div>

            {/* ---------------- Net Block ---------------- */}

            <div className="asset-section">

                <h3>Net Block</h3>

                <div className="asset-analysis-table">

                    <table>

                        <thead>

                            <tr>

                                <th>Description</th>

                                {schedule.map((row) => (

                                    <th key={row.year}>

                                        Year {row.year}

                                    </th>

                                ))}

                            </tr>

                        </thead>

                        <tbody>

                            <tr>

                                <td><b>Net Fixed Assets</b></td>

                                {schedule.map((row, index) => (

                                    <td key={index}>

                                        <b>

                                            {row.total_net_block.toLocaleString()}

                                        </b>

                                    </td>

                                ))}

                            </tr>

                        </tbody>

                    </table>

                </div>

            </div>

        </div>

    );

}