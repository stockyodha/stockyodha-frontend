import apiClient from '@/config/api';
import { OrderCreate, OrderRead } from '@/types/orderTypes';

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

// TODO: Add functions for getOrders, getOrderDetails, cancelOrder later if needed 