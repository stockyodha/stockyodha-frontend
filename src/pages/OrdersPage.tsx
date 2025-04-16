import { useState, useEffect, useCallback } from 'react';
import { getOrders, cancelOrder } from '@/services/orderService';
import { OrderRead, OrderStatus } from '@/types/orderTypes';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns'; // For date formatting
import { Badge } from '@/components/ui/badge';
import { Loader2, Ban } from 'lucide-react'; // Icons

const ORDER_STATUS_OPTIONS: (OrderStatus | 'ALL')[] = ['ALL', 'PENDING', 'EXECUTED', 'CANCELLED', 'FAILED'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRead[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null); // null means 'ALL'
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null); // Track which order is being cancelled

  const fetchOrders = useCallback(async (status: OrderStatus | null) => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedOrders = await getOrders(status);
      // Sort orders by creation date, newest first
      fetchedOrders.sort((a, b) => parseISO(b.created_at).getTime() - parseISO(a.created_at).getTime());
      setOrders(fetchedOrders);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Failed to load orders. Please try again later.');
      toast.error('Failed to load orders.');
      setOrders([]); // Clear orders on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(selectedStatus);
  }, [selectedStatus, fetchOrders]);

  const handleCancelOrder = async (orderId: string) => {
    setCancellingOrderId(orderId);
    try {
      await cancelOrder(orderId);
      toast.success('Order cancelled successfully!');
      // Refresh the list to show the updated status
      fetchOrders(selectedStatus);
    } catch (err: any) { // Type assertion needed for error handling
      console.error(`Failed to cancel order ${orderId}:`, err);
      const errorMessage = err.response?.data?.detail || 'Failed to cancel order.';
      toast.error(errorMessage);
    } finally {
      setCancellingOrderId(null);
    }
  };

  const handleStatusChange = (statusValue: string) => {
    setSelectedStatus(statusValue === 'ALL' ? null : statusValue as OrderStatus);
  };

  const getStatusBadgeVariant = (status: OrderStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'PENDING': return 'secondary';
      case 'EXECUTED': return 'default'; // Using default (often blue/primary) for success
      case 'CANCELLED': return 'outline';
      case 'FAILED': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6">Order History</h1>

      <div className="mb-4">
        <Tabs defaultValue="ALL" onValueChange={handleStatusChange}>
          <TabsList>
            {ORDER_STATUS_OPTIONS.map((status) => (
              <TabsTrigger key={status} value={status}>
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Loading orders...</p>
        </div>
      ) : error ? (
        <div className="text-center text-destructive py-10">
          <p>{error}</p>
          <Button onClick={() => fetchOrders(selectedStatus)} variant="outline" className="mt-4">
            Retry
          </Button>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center text-muted-foreground py-10">
          <p>No orders found{selectedStatus ? ` with status ${selectedStatus}` : ''}.</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date/Time</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Side</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(parseISO(order.created_at), 'PPpp')}
                  </TableCell>
                  <TableCell className="font-medium">
                    {order.stock_symbol} <span className="text-xs text-muted-foreground">({order.stock_exchange.toUpperCase()})</span>
                  </TableCell>
                  <TableCell>{order.order_type}</TableCell>
                  <TableCell className={order.transaction_type === 'BUY' ? 'text-green-600' : 'text-red-600'}>
                    {order.transaction_type}
                  </TableCell>
                  <TableCell className="text-right">{order.quantity}</TableCell>
                  <TableCell className="text-right">
                    {order.order_type === 'LIMIT' ? `Limit: ${order.limit_price ?? 'N/A'}` : 'Market'}
                    {order.status === 'EXECUTED' && <div className="text-xs text-muted-foreground">Executed: {order.executed_price ?? 'N/A'}</div>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {order.status === 'PENDING' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancellingOrderId === order.id}
                      >
                        {cancellingOrderId === order.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <Ban className="h-4 w-4 mr-1" />
                        )}
                        Cancel
                      </Button>
                    )}
                    {/* Add View Details button later if needed */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
} 