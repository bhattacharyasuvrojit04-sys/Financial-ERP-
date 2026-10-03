const BASE_URL = "http://127.0.0.1:8000";


// =====================================================
// PRODUCTS
// =====================================================

export const getProducts = async ({ search = "" } = {}) => {
    let url = `${BASE_URL}/products`;

    if (search) {
        url += `?search=${encodeURIComponent(search)}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Failed to fetch products");
    }

    return response.json();
};


export const createProduct = async (data) => {
    const response = await fetch(`${BASE_URL}/products`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to create product");
    }

    return response.json();
};


export const updateProduct = async (productId, data) => {
    const response = await fetch(`${BASE_URL}/products/${productId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to update product");
    }

    return response.json();
};


export const deactivateProduct = async (productId) => {
    const response = await fetch(
        `${BASE_URL}/products/${productId}/deactivate`,
        {
            method: "PATCH"
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to deactivate product");
    }

    return response.json();
};


// =====================================================
// CUSTOMERS
// =====================================================

export const getCustomers = async ({ search = "" } = {}) => {
    let url = `${BASE_URL}/customers`;

    if (search) {
        url += `?search=${encodeURIComponent(search)}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Failed to fetch customers");
    }

    return response.json();
};


export const createCustomer = async (data) => {
    const response = await fetch(`${BASE_URL}/customers`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to create customer");
    }

    return response.json();
};


export const updateCustomer = async (customerId, data) => {
    const response = await fetch(`${BASE_URL}/customers/${customerId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to update customer");
    }

    return response.json();
};


export const deactivateCustomer = async (customerId) => {
    const response = await fetch(
        `${BASE_URL}/customers/${customerId}/deactivate`,
        {
            method: "PATCH"
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to deactivate customer");
    }

    return response.json();
};


// =====================================================
// SUPPLIERS
// =====================================================

export const getSuppliers = async ({ search = "" } = {}) => {
    let url = `${BASE_URL}/suppliers`;

    if (search) {
        url += `?search=${encodeURIComponent(search)}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Failed to fetch suppliers");
    }

    return response.json();
};


export const createSupplier = async (data) => {
    const response = await fetch(`${BASE_URL}/suppliers`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to create supplier");
    }

    return response.json();
};


export const updateSupplier = async (supplierId, data) => {
    const response = await fetch(`${BASE_URL}/suppliers/${supplierId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to update supplier");
    }

    return response.json();
};


export const deactivateSupplier = async (supplierId) => {
    const response = await fetch(
        `${BASE_URL}/suppliers/${supplierId}/deactivate`,
        {
            method: "PATCH"
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to deactivate supplier");
    }

    return response.json();
};