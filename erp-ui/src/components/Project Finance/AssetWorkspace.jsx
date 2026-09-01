import AssetAnalysis from "./Statements/AssetAnalysis";

export default function AssetWorkspace({

    result, assetSchedule

}){

    return(

        <div className="asset-workspace">

            <AssetAnalysis

                result={result}
                assetSchedule={assetSchedule}

            />

        </div>

    );

}