const BASE_URL = "http://127.0.0.1:8000";


// ==================================================
// GET ALL STOCK MOVEMENTS
// ==================================================

export const getStockMovements = async () => {

    const response = await fetch(
        `${BASE_URL}/inventory/movements`
    );

    if (!response.ok) {

        const error =
            await response.json().catch(() => ({}));

        throw new Error(
            error.detail ||
            "Failed to fetch stock movements"
        );
    }

    return response.json();
};


// ==================================================
// CREATE STOCK MOVEMENT
// ==================================================

export const createStockMovement = async (data) => {

    const response = await fetch(
        `${BASE_URL}/inventory/movements`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },

            body: JSON.stringify(data),
        }
    );

    if (!response.ok) {

        const error =
            await response.json().catch(() => ({}));

        throw new Error(
            error.detail ||
            "Failed to create stock movement"
        );
    }

    return response.json();
};


// ==================================================
// GET MOVEMENTS FOR ONE PRODUCT
// ==================================================

export const getProductStockMovements = async (
    productId
) => {

    const response = await fetch(
        `${BASE_URL}/inventory/products/${productId}/ledger`
    );

    if (!response.ok) {

        const error =
            await response.json().catch(() => ({}));

        throw new Error(
            error.detail ||
            "Failed to fetch product stock ledger"
        );
    }

    return response.json();
};


// ==================================================
// GET CURRENT STOCK FOR ONE PRODUCT
// ==================================================

export const getProductStock = async (
    productId
) => {

    const response = await fetch(
        `${BASE_URL}/inventory/products/${productId}/stock`
    );

    if (!response.ok) {

        const error =
            await response.json().catch(() => ({}));

        throw new Error(
            error.detail ||
            "Failed to fetch product stock"
        );
    }

    return response.json();
};


// ==================================================
// INVENTORY SUMMARY
// ==================================================

export const getInventorySummary = async () => {

    const response = await fetch(
        `${BASE_URL}/inventory/summary`
    );

    if (!response.ok) {

        const error =
            await response.json().catch(() => ({}));

        throw new Error(
            error.detail ||
            "Failed to fetch inventory summary"
        );
    }

    return response.json();
};

export const getInventoryValuation = async () => {
    const response = await fetch(
        `${BASE_URL}/inventory/valuation`
    );

    if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
            errorText || "Failed to fetch inventory valuation"
        );
    }

    return response.json();
};

export const getInventoryAlerts = async () => {
    const response = await fetch(
        `${BASE_URL}/inventory/alerts`
    );

    if (!response.ok) {
        let message = "Failed to fetch inventory alerts";

        try {
            const error = await response.json();
            message = error.detail || message;
        } catch (e) {
            // Ignore JSON parsing error
        }

        throw new Error(message);
    }

    return response.json();
};

// ==================================================
// REORDER REQUESTS
// ==================================================

export const getReorderRequests = async () => {

    const response = await fetch(
        `${BASE_URL}/inventory/reorder-requests`
    );

    if (!response.ok) {

        let message =
            "Failed to fetch reorder requests";

        try {

            const error =
                await response.json();

            message =
                error.detail || message;

        } catch (e) {
            // Ignore JSON parsing error
        }

        throw new Error(message);

    }

    return response.json();
};


export const createReorderRequest = async (data) => {

    const response = await fetch(
        `${BASE_URL}/inventory/reorder-requests`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",
            },

            body: JSON.stringify(data),
        }
    );

    if (!response.ok) {

        let message =
            "Failed to create reorder request";

        try {

            const error =
                await response.json();

            message =
                error.detail || message;

        } catch (e) {
            // Ignore JSON parsing error
        }

        throw new Error(message);

    }

    return response.json();
};


export const updateReorderRequestStatus = async (
    requestId,
    status
) => {

    const response = await fetch(
        `${BASE_URL}/inventory/reorder-requests/${requestId}/status`,
        {
            method: "PATCH",

            headers: {
                "Content-Type":
                    "application/json",
            },

            body: JSON.stringify({
                status,
            }),
        }
    );

    if (!response.ok) {

        let message =
            "Failed to update reorder request";

        try {

            const error =
                await response.json();

            message =
                error.detail || message;

        } catch (e) {
            // Ignore JSON parsing error
        }

        throw new Error(message);

    }

    return response.json();
};