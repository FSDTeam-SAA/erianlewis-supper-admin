/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ChevronRight, Trash2 } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ViewOrderModal } from "@/components/modal/ViewOrderModal";

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

const deliveryStatusOptions = [
  "pending",
  "processing",
  "in_transit",
  "delivered",
  "failed",
  "cancelled",
];

const MyDelivary: React.FC = () => {
  const { data: session } = useSession();
  const user = session?.user as any;
  const token = user?.accessToken;

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useQuery<ApiResponse>({
    queryKey: ["ordersbyemail"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/payment/singleorderbyemail/${user.email}`
      );
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
  });

  const handleDeliveryStatusChange = async (
    orderId: string,
    status: string
  ) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/delivary/updatedelivarystatus/${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ deliveryStatus: status }),
        }
      );
      if (!res.ok) throw new Error("Failed to update delivery status");
      await res.json();
      refetch();
    } catch (err) {
      console.error(err);
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

  const deliveryOrders = (response?.orders || []).filter(
    (order) => order.deliveryType === "delivery"
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
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
              <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase text-center">
                Payment
              </div>
              <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase text-center">
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
                  <Select
                    value={order.deliveryStatus || "pending"}
                    onValueChange={(value) =>
                      handleDeliveryStatusChange(order._id, value)
                    }
                  >
                    <SelectTrigger className="w-[200px] border border-gray-300 px-2 py-1 text-sm">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {deliveryStatusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Payment Method */}
                <div className="col-span-2 flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600 capitalize ">
                    {order.paymentMethod || "cod"}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-center justify-center gap-3">
                  <ViewOrderModal singleorderId={order._id} />

                  <Button
                    variant="outline"
                    size="icon"
                    className="border-red-200 text-red-600 hover:bg-red-50 rounded-lg"
                    onClick={() => console.log("Delete function")}
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

export default MyDelivary;
