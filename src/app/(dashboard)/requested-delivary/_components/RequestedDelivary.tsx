/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ChevronRight, CheckCircle, CircleCheckBig } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

// 🔹 API Response Types
interface Product {
  _id: string;
  productId: {
    _id: string;
    name: string;
    discountPrice: number;
    image: string;
  };
  name: string;
  quantity: number;
  price: number;
  createdBy: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface Order {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  deliveryInfo?: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
  products: Product[];
  amount: number;
  deliveryType: string;
  status: string;
  deliveryStatus?: string;
  paymentMethod?: string;
  isAccepted?: boolean;
  otpVerified?: boolean;
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  totalOrders: number;
  totalAmount: number;
  orders: Order[];
}

const DeliveryOrderList: React.FC = () => {
  const { data: session } = useSession();
  const user = session?.user as any;
  const token = user?.accessToken;

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useQuery<ApiResponse>({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/payment/getorders`
      );
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const handleDeleteClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedOrderId) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/orders/${selectedOrderId}`,
        { method: "DELETE", headers: { "Content-Type": "application/json" } }
      );
      if (!res.ok) throw new Error("Failed to delete order");
      setDeleteModalOpen(false);
      setSelectedOrderId(null);
      refetch();
    } catch (error) {
      console.error(error);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/delivary/accept-delivary/${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to accept order");
      await res.json();
      refetch();
    } catch (error) {
      console.error(error);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p className="text-red-500">Error loading orders</p>;

  // Filter only delivery orders
  const deliveryOrders = (response?.orders || []).filter(
    (order) => order.deliveryType === "delivery"
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Delivery Orders
          </h1>
          <nav className="flex items-center text-sm text-gray-500 mt-2">
            <Link
              href="/dashboard"
              className="hover:text-gray-700 transition-colors"
            >
              Dashboard
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            <span className="text-gray-900 font-medium">Delivery Orders</span>
          </nav>
        </div>
      </div>

      {/* Table */}
      {deliveryOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center py-10">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No delivery orders found
          </h3>
          <p className="text-gray-500 mb-6">
            Orders with delivery type will appear here
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="grid grid-cols-13 gap-6 px-6 py-4">
              <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase">
                Customer
              </div>
              <div className="col-span-3 text-xs font-semibold text-gray-600 uppercase">
                Items
              </div>
              <div className="col-span-1 text-xs font-semibold text-gray-600 uppercase text-center">
                Date
              </div>
              <div className="col-span-1 text-xs font-semibold text-gray-600 uppercase text-center">
                Total
              </div>
              <div className="col-span-1 text-xs font-semibold text-gray-600 uppercase text-center">
                Status
              </div>
              <div className="col-span-1 text-xs font-semibold text-gray-600 uppercase text-center">
                Delivery Status
              </div>
              <div className="col-span-1 text-xs font-semibold text-gray-600 uppercase text-center">
                Payment
              </div>
              <div className="col-span-3 text-xs font-semibold text-gray-600 uppercase text-end">
                Actions
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {deliveryOrders.map((order, index) => (
              <div
                key={order._id}
                className={`grid grid-cols-13 gap-6 px-6 py-5 hover:bg-gray-50 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                }`}
              >
                {/* Customer */}
                <div className="col-span-2 flex flex-col">
                  <span className="font-semibold text-gray-900 text-base truncate">
                    {order.deliveryInfo?.fullName || order.userId.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {order.deliveryInfo?.phone || order.userId.email}
                  </span>
                </div>

                {/* Items */}
                <div className="col-span-3 flex flex-wrap gap-2">
                  {order.products.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center gap-2 border border-gray-200 px-2 py-1 rounded-lg"
                    >
                      <span className="text-sm">
                        {item.productId.name} x{item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Date */}
                <div className="col-span-1 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">
                    {formatDate(order.createdAt)}
                  </span>
                </div>

                {/* Total */}
                <div className="col-span-1 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">
                    ${order.amount}
                  </span>
                </div>

                {/* Status */}
                <div className="col-span-1 flex items-center justify-center">
                  <span className="text-sm font-medium text-green-600 capitalize">
                    {order.status}
                  </span>
                </div>

                {/* Delivery Status */}
                <div className="col-span-1 flex items-center justify-center">
                  <span className="text-sm font-medium text-yellow-600 capitalize">
                    {order.deliveryStatus || "pending"}
                  </span>
                </div>

                {/* Payment Method */}
                <div className="col-span-1 flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600 capitalize">
                    {order.paymentMethod || "cod"}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-3 flex items-center justify-end gap-3">
                  {order.isAccepted ? (
                    <div className="flex items-center gap-2 text-green-600 font-semibold">
                      <CircleCheckBig className="w-6 h-6" />
                      <span>Accepted</span>
                    </div>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-3 flex items-center"
                      onClick={() => handleAcceptOrder(order._id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Accept
                    </Button>
                  )}

                  <Link href={`/orders/edit/${order._id}`}>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    size="icon"
                    className="border-red-200 text-red-600 hover:bg-red-50 rounded-lg"
                    onClick={() => handleDeleteClick(order._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryOrderList;
