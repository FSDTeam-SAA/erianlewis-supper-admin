/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { TrendingUp, CreditCard, Wallet, DollarSign, AlertCircle } from "lucide-react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface PaymentDataItem {
  _id: string
  count: number
}

interface PaymentChartResponse {
  success: boolean
  data: PaymentDataItem[]
}

const COLORS: Record<string, string> = {
  stripe: '#635BFF',
  cod: '#10B981',
  default: '#6B7280'
}

const PAYMENT_ICONS: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  stripe: CreditCard,
  cod: Wallet,
  default: DollarSign
}

const EachPaymentChart: React.FC = () => {
  const { data: paymentData, isLoading, error } = useQuery<PaymentChartResponse, Error>({
    queryKey: ['payment-chart'],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/summery/rider-eachpymentorder-chart`)
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    }
  })

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-3">
            <AlertCircle className="text-red-500" size={24} />
            <div>
              <h3 className="text-red-800 font-semibold">Error Loading Data</h3>
              <p className="text-red-600 text-sm">Unable to fetch payment statistics</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const rawData: PaymentDataItem[] = paymentData?.data || []

  // Transform data for chart
  const chartData = rawData.map(item => ({
    name: item._id === 'cod' ? 'Cash on Delivery' : item._id === 'stripe' ? 'Card Payment' : item._id,
    value: item.count,
    id: item._id,
    color: COLORS[item._id] || COLORS.default
  }))

  const totalOrders = chartData.reduce((sum, item) => sum + item.value, 0)

  // Calculate percentage and find trending
  const codPercentage = chartData.find(item => item.id === 'cod')?.value || 0
  const stripePercentage = chartData.find(item => item.id === 'stripe')?.value || 0
  const trendingMethod = codPercentage > stripePercentage ? 'Cash on Delivery' : 'Card Payment'
  const trendPercentage = totalOrders > 0 ? Math.round((Math.max(codPercentage, stripePercentage) / totalOrders) * 100) : 0

  const CustomTooltip: React.FC<any> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const percentage = totalOrders > 0 ? ((data.value / totalOrders) * 100).toFixed(1) : 0
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{data.name}</p>
          <p className="text-sm text-gray-600">Orders: <span className="font-bold">{data.value}</span></p>
          <p className="text-sm text-gray-600">Percentage: <span className="font-bold">{percentage}%</span></p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-800">Payment Methods</CardTitle>
            <CardDescription className="text-gray-600 mt-1">
              Distribution of payment methods used
            </CardDescription>
          </div>
          <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
            <DollarSign className="text-white" size={24} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-6">
        {chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Wallet size={48} className="mx-auto mb-3 opacity-50" />
              <p>No payment data available</p>
            </div>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={800}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Payment Method Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              {chartData.map((item, index) => {
                const Icon = PAYMENT_ICONS[item.id] || PAYMENT_ICONS.default
                const percentage = totalOrders > 0 ? ((item.value / totalOrders) * 100).toFixed(1) : 0

                return (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 bg-gradient-to-br from-white to-gray-50"
                  >
                    <div
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: `${item.color}20` }}
                    >
                      <Icon style={{ color: item.color }} size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 font-medium">{item.name}</p>
                      <p className="text-2xl font-bold text-gray-800">{item.value}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Share</p>
                      <p
                        className="text-xl font-bold"
                        style={{ color: item.color }}
                      >
                        {percentage}%
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="flex-col items-start gap-3 text-sm border-t pt-6">
        <div className="flex items-center gap-2 text-green-600 font-medium">
          <TrendingUp className="h-4 w-4" />
          <span>{trendingMethod} is leading with {trendPercentage}% of total orders</span>
        </div>
        <div className="text-gray-600">
          Total orders processed: <span className="font-bold text-gray-800">{totalOrders}</span>
        </div>
      </CardFooter>
    </Card>
  )
}

export default EachPaymentChart
