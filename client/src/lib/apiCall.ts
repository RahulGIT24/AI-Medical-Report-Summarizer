import axios from "axios";

export async function apiCall(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
    data: any = {},
) {
    try {
        const api = axios.create({
            baseURL: import.meta.env.VITE_BASE_URL,
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
            },
        });

        const res = await api.request({
            method: method,
            url: endpoint,
            data: data,
        });
        return res.data;

    } catch (error: any) {
        if (error.response) {
            const status = error.response.status;

            if (status === 401) {
                // handle token refresh logic here
                console.warn("Unauthorized — maybe refresh token?");
            }

            throw error;
        }
    }
}

