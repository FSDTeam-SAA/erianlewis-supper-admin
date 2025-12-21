/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { View, User, Phone, MapPin, CreditCard, Package, Truck, Calendar, Mail } from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useState } from "react";

// Dynamically import SimpleMap to avoid SSR issues
const SimpleMap = dynamic(() => import("@/components/map/DeliveryMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
        <p className="text-gray-600 font-medium">Loading map...</p>
      </div>
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
  const rider = data?.rider;

  // Customer position from deliveryInfo location
  const customerPosition: [number, number] = [
    order?.deliveryInfo?.location?.lat || 23.8103,
    order?.deliveryInfo?.location?.lng || 90.4125,
  ];

  // Rider position (if available from API)
  const riderPosition: [number, number] | null = rider
    ? [rider.latitude || 23.8103, rider.longitude || 90.4125]
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild className="">
        <Button
          variant="outline"
          size="icon"
          className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 rounded-lg transition-all duration-200 hover:shadow-md"
        >
          <View className="w-4 h-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="w-full max-w-[30vw] lg:max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl p-0 gap-0">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-8 py-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
          <div className="relative">
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
              <Package className="w-7 h-7" />
              Order Details
            </DialogTitle>
            <DialogDescription className="text-blue-100 mt-1">
              View complete order details including customer info, products, and delivery map.
            </DialogDescription>
          </div>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
              <p className="text-gray-600 font-medium text-lg">Loading order details...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="bg-red-100 rounded-full p-4 mb-4">
                <svg className="w-12 h-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-red-600 font-semibold text-lg">Failed to load order details</p>
              <p className="text-gray-500 text-sm mt-1">Please try again later</p>
            </div>
          ) : (
            order && (
              <div className="space-y-6">
                {/* Customer Information */}
                <section className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2.5 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg shadow-md">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Customer Information</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <User className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Full Name</p>
                        <p className="text-sm font-semibold text-gray-800">{order.deliveryInfo?.fullName}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Phone className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone</p>
                        <p className="text-sm font-semibold text-gray-800">{order.deliveryInfo?.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 sm:col-span-2">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <MapPin className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Address</p>
                        <p className="text-sm font-semibold text-gray-800">
                          {order.deliveryInfo?.address}, {order.deliveryInfo?.city}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Mail className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Postal Code</p>
                        <p className="text-sm font-semibold text-gray-800">{order.deliveryInfo?.postalCode}</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Order Information */}
                <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2.5 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-md">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Order Information</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Order ID</p>
                      <p className="text-sm font-bold text-gray-800 truncate">{order._id}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Amount</p>
                      <p className="text-lg font-bold text-blue-600">{order.amount} ৳</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Payment Method</p>
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-blue-600" />
                        <p className="text-sm font-semibold text-gray-800 uppercase">{order.paymentMethod}</p>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Delivery Type</p>
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-blue-600" />
                        <p className="text-sm font-semibold text-gray-800 capitalize">{order.deliveryType}</p>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Payment Status</p>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-bold shadow-md ${
                          order.status === "paid"
                            ? "bg-gradient-to-r from-green-500 to-emerald-600"
                            : "bg-gradient-to-r from-yellow-500 to-amber-600"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                        {order.status}
                      </span>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Delivery Status</p>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-bold shadow-md ${
                          order.deliveryStatus === "in_transit"
                            ? "bg-gradient-to-r from-blue-500 to-indigo-600"
                            : order.deliveryStatus === "delivered"
                            ? "bg-gradient-to-r from-green-500 to-emerald-600"
                            : "bg-gradient-to-r from-gray-500 to-gray-600"
                        }`}
                      >
                        <Truck className="w-3 h-3" />
                        {order.deliveryStatus}
                      </span>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100 sm:col-span-2 lg:col-span-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Order Date</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <p className="text-sm font-semibold text-gray-800">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Product List */}
                <section className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2.5 bg-gradient-to-br from-green-600 to-emerald-700 rounded-lg shadow-md">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Products Ordered</h3>
                    <span className="ml-auto bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {order.products?.length} items
                    </span>
                  </div>
                  <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                    {order.products?.map((item: any, index: number) => (
                      <div
                        key={item._id}
                        className="flex items-center gap-4 bg-white rounded-xl p-4 border border-green-100 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                      >
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-green-200 shadow-md flex-shrink-0">
                          <Image
                            src={item.productId?.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute top-1 left-1 bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                            #{index + 1}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 text-base mb-1 truncate">{item.name}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="inline-flex items-center gap-1 text-gray-600">
                              <span className="font-semibold">Qty:</span>
                              <span className="bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-md">
                                {item.quantity}
                              </span>
                            </span>
                            <span className="text-green-700 font-bold text-base">
                              {item.price} ৳
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Map Section - Simple Markers Only */}
                <section className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2.5 bg-gradient-to-br from-orange-600 to-red-700 rounded-lg shadow-md">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Delivery Locations</h3>
                  </div>

                  {/* Map */}
                  <div className="w-full h-80 rounded-xl overflow-hidden border-2 border-red-200 shadow-lg">
                    <SimpleMap position={customerPosition} riderPosition={riderPosition} />
                  </div>
                </section>
              </div>
            )
          )}
        </div>

        <DialogFooter className="bg-gray-50 p-6 flex justify-end">
          <DialogClose asChild>
            <Button variant="outline" className="px-6 py-2">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}