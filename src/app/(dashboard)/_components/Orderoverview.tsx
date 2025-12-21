"use client"

import { useQuery } from "@tanstack/react-query"
import React from "react"
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertCircle,
  Package,
} from "lucide-react"
import {
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  TooltipProps,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// ================= TYPES =================
interface OrderOverTimeItem {
  _id: string // "YYYY-MM-DD"
  count: number
}

interface OrderOverTimeResponse {
  success: boolean
  data: OrderOverTimeItem[]
}

interface ChartDataItem {
  date: string
  displayDate: string
  dayName: string
  orders: number
  fullDate: string
}

// ================= COMPONENT =================
const OrderOverview: React.FC = () => {
  const { data, isLoading, error } = useQuery<OrderOverTimeResponse, Error>({
    queryKey: ["order-overtime"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/summery/rider-orderovertime-chart`
      )
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

  // ================= LOADING =================
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gray-100 rounded animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  // ================= ERROR =================
  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-3">
            <AlertCircle className="text-red-500" size={24} />
            <div>
              <h3 className="text-red-800 font-semibold">Error Loading Data</h3>
              <p className="text-red-600 text-sm">
                Unable to fetch order statistics
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // ================= DATA TRANSFORM =================
  const rawData: OrderOverTimeItem[] = data?.data || []

  const chartData: ChartDataItem[] = rawData.map((item) => {
    const dateObj = new Date(`${item._id}T00:00:00`) // SAFER parsing
    return {
      date: item._id,
      displayDate: dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      dayName: dateObj.toLocaleDateString("en-US", { weekday: "short" }),
      orders: item.count,
      fullDate: dateObj.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    }
  })

  // ================= STATS =================
  const totalOrders = chartData.reduce((sum, item) => sum + item.orders, 0)
  const avgOrders =
    chartData.length > 0
      ? (totalOrders / chartData.length).toFixed(1)
      : "0"

  const maxOrders =
    chartData.length > 0
      ? Math.max(...chartData.map((item) => item.orders))
      : 0

  const todayOrders =
    chartData.length > 0
      ? chartData[chartData.length - 1].orders
      : 0

  const yesterdayOrders =
    chartData.length > 1
      ? chartData[chartData.length - 2].orders
      : 0

  const trend =
    yesterdayOrders > 0
      ? (((todayOrders - yesterdayOrders) / yesterdayOrders) * 100).toFixed(1)
      : todayOrders > 0
      ? "100"
      : "0"

  const isTrendingUp = Number(trend) >= 0

  // ================= TOOLTIP =================
  const CustomTooltip: React.FC<TooltipProps<number, string>> = ({
    active,
    payload,
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataItem
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{data.fullDate}</p>
          <p className="text-sm text-gray-600">
            Day: <span className="font-bold">{data.dayName}</span>
          </p>
          <p className="text-sm text-gray-600">
            Orders: <span className="font-bold">{data.orders}</span>
          </p>
        </div>
      )
    }
    return null
  }

  // ================= UI =================
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">
              Orders Over Time
            </CardTitle>
            <CardDescription>Last 7 days order trends</CardDescription>
          </div>
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <Calendar className="text-white" size={24} />
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <Stat label="Total Orders" value={totalOrders} />
          <Stat label="Daily Average" value={avgOrders} />
          <Stat label="Peak Orders" value={maxOrders} />
        </div>
      </CardHeader>

      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-80 flex items-center justify-center text-gray-400">
            <Package size={48} />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="orders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="displayDate" />
              <YAxis allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />

              <Area
                type="monotone"
                dataKey="orders"
                stroke="#8b5cf6"
                strokeWidth={3}
                fill="url(#orders)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>

      <CardFooter className="flex-col items-start gap-3">
        <div
          className={`flex items-center gap-2 ${
            isTrendingUp ? "text-green-600" : "text-red-600"
          }`}
        >
          {isTrendingUp ? (
            <TrendingUp size={16} />
          ) : (
            <TrendingDown size={16} />
          )}
          <span>{Math.abs(Number(trend))}% from yesterday</span>
        </div>

        <div className="text-gray-600">
          Today&apos;s orders:{" "}
          <span className="font-bold">{todayOrders}</span>
        </div>
      </CardFooter>
    </Card>
  )
}

// ================= SMALL STAT CARD =================
const Stat = ({ label, value }: { label: string; value: number | string }) => (
  <div className="p-4 rounded-lg border bg-gray-50">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
)

export default OrderOverview
