/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { View } from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useState } from "react";

// Dynamically import SimpleMap to avoid SSR issues
const SimpleMap = dynamic(() => import("@/components/map/DeliveryMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
});

type ViewOrderModalProps = {
  singleorderId: string;
};

export function ViewOrderModal({ singleorderId }: ViewOrderModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["single-order", singleorderId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/payment/singeorder/${singleorderId}`
      );
      if (!res.ok) throw new Error("Failed to fetch order");
      return res.json();
    },
    enabled: !!singleorderId && isOpen,
  });

  const order = data?.order;

  // Default position (Dhaka)
  const position: [number, number] = [
    order?.deliveryInfo?.latitude || 23.8103,
    order?.deliveryInfo?.longitude || 90.4125,
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg"
        >
          <View className="w-4 h-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Order Details
          </DialogTitle>
          <DialogDescription>
            View complete order details including customer info, products, and
            delivery map.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="text-center text-gray-500 py-4">Loading...</p>
        ) : isError ? (
          <p className="text-center text-red-500 py-4">Failed to load order.</p>
        ) : (
          order && (
            <div className="space-y-6">
              {/* Customer Information */}
              <section className="border p-4 rounded-lg bg-gray-50">
                <h3 className="font-semibold text-blue-700 mb-2">
                  🧍 Customer Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {order.deliveryInfo?.fullName}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {order.deliveryInfo?.phone}
                  </p>
                  <p>
                    <span className="font-medium">Address:</span>{" "}
                    {order.deliveryInfo?.address}, {order.deliveryInfo?.city}
                  </p>
                  <p>
                    <span className="font-medium">Postal Code:</span>{" "}
                    {order.deliveryInfo?.postalCode}
                  </p>
                </div>
              </section>

              {/* Order Information */}
              <section className="border p-4 rounded-lg bg-gray-50">
                <h3 className="font-semibold text-blue-700 mb-2">
                  📦 Order Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <p>
                    <span className="font-medium">Order ID:</span> {order._id}
                  </p>
                  <p>
                    <span className="font-medium">Amount:</span> {order.amount}{" "}
                    ৳
                  </p>
                  <p>
                    <span className="font-medium">Payment Method:</span>{" "}
                    {order.paymentMethod}
                  </p>
                  <p>
                    <span className="font-medium">Delivery Type:</span>{" "}
                    {order.deliveryType}
                  </p>
                  <p>
                    <span className="font-medium">Payment Status:</span>{" "}
                    <span
                      className={`px-2 py-1 rounded text-white ${
                        order.status === "paid"
                          ? "bg-green-600"
                          : "bg-yellow-500"
                      }`}
                    >
                      {order.status}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium">Delivery Status:</span>{" "}
                    <span
                      className={`px-2 py-1 rounded text-white ${
                        order.deliveryStatus === "in_transit"
                          ? "bg-blue-600"
                          : "bg-gray-500"
                      }`}
                    >
                      {order.deliveryStatus}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium">Date:</span>{" "}
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
              </section>

              {/* Product List */}
              <section className="border p-4 rounded-lg bg-gray-50">
                <h3 className="font-semibold text-blue-700 mb-3">
                  🛍️ Products
                </h3>
                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                  {order.products?.map((item: any) => (
                    <div
                      key={item._id}
                      className="flex items-center gap-3 border rounded-lg p-2 bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="relative w-16 h-16 rounded-md overflow-hidden border">
                        <Image
                          src={item.productId?.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 text-sm">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                        <p className="text-gray-700 font-semibold">
                          Price: {item.price} ৳
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Map Section */}
              <section className="border p-4 rounded-lg bg-gray-50">
                <h3 className="font-semibold text-blue-700 mb-3">
                  🗺️ Delivery Location / Tracking
                </h3>
                <div className="h-[350px] rounded-lg overflow-hidden border">
                  {isOpen && (
                    <SimpleMap
                      position={position}
                      zoom={13}
                      popupText="Customer Delivery Location"
                    />
                  )}
                </div>
              </section>
            </div>
          )
        )}



        

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}