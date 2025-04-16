import apiClient from '@/config/api';
import { OrderCreate, OrderRead, OrderStatus } from '@/types/orderTypes';

const API_BASE_URL = '/orders';

/**
 * Places a new stock order.
 * Corresponds to POST /api/v1/orders
 *
 * @param orderData The order details.
 * @returns A promise that resolves to the created order details.
 */
export const placeOrder = async (orderData: OrderCreate): Promise<OrderRead> => {
    try {
        const response = await apiClient.post<OrderRead>(API_BASE_URL, orderData);
        return response.data;
    } catch (error) {
        console.error("Error placing order:", error);
        // Rethrow the error to be handled by the calling component (e.g., react-query mutation)
        throw error;
    }
};

/**
 * Fetches a list of user orders.
 * Corresponds to GET /api/v1/orders
 *
 * @param status Optional status to filter orders by.
 * @param skip Optional number of orders to skip (for pagination).
 * @param limit Optional maximum number of orders to return (for pagination).
 * @returns A promise that resolves to an array of orders.
 */
export const getOrders = async (
    status?: OrderStatus | null,
    skip: number = 0,
    limit: number = 50
): Promise<OrderRead[]> => {
    try {
        const params: Record<string, any> = { skip, limit };
        if (status) {
            params.status = status;
        }
        const response = await apiClient.get<OrderRead[]>(API_BASE_URL, { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching orders:", error);
        throw error; // Re-throw for handling in UI
    }
};

/**
 * Cancels a pending order.
 * Corresponds to DELETE /api/v1/orders/{order_id}
 *
 * @param orderId The ID of the order to cancel.
 * @returns A promise that resolves to the cancelled order details (confirming the cancellation).
 */
export const cancelOrder = async (orderId: string): Promise<OrderRead> => {
    try {
        const response = await apiClient.delete<OrderRead>(`${API_BASE_URL}/${orderId}`);
        return response.data; // API returns the updated order (status: CANCELLED)
    } catch (error) {
        console.error(`Error cancelling order ${orderId}:`, error);
        throw error; // Re-throw for handling in UI
    }
};

// TODO: Add functions for getOrders, getOrderDetails, cancelOrder later if needed 