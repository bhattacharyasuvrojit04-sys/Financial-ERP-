export const DISPLAY_UNIT = {
    RAW: "RAW",
    LAKH: "LAKH",
    CRORE: "CRORE",
    MILLION: "MILLION",
    BILLION: "BILLION",
};

export function formatFinancialNumber(value, unit = DISPLAY_UNIT.MILLION) {

    if (value === null || value === undefined)
        return "-";

    let divisor = 1;
    let suffix = "";

    switch (unit) {

        case DISPLAY_UNIT.LAKH:
            divisor = 100000;
            suffix = " L";
            break;

        case DISPLAY_UNIT.CRORE:
            divisor = 10000000;
            suffix = " Cr";
            break;

        case DISPLAY_UNIT.MILLION:
            divisor = 1000000;
            suffix = " M";
            break;

        case DISPLAY_UNIT.BILLION:
            divisor = 1000000000;
            suffix = " B";
            break;

        default:
            divisor = 1;
            suffix = "";
    }

    return (
        (Number(value || 0) / divisor).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + suffix
    );
}