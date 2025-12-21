"use client"
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { Package, Clock, Truck, CheckCircle, Users, DollarSign, TrendingUp, AlertCircle } from 'lucide-react'

function DeliverySummaryCard() {
  const { data: deliverySummaryCard, isLoading, error } = useQuery({
    queryKey: ['summery-card'],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/summery/rider-summery-cards`)
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    }
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
            <div className="h-12 w-12 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-3">
          <AlertCircle className="text-red-500" size={24} />
          <div>
            <h3 className="text-red-800 font-semibold">Error Loading Data</h3>
            <p className="text-red-600 text-sm">Unable to fetch dashboard statistics</p>
          </div>
        </div>
      </div>
    )
  }

  const stats = deliverySummaryCard?.data || {}

  const cards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders || 0,
      icon: Package,
      gradient: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600',
      iconBg: 'bg-blue-100'
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders || 0,
      icon: Clock,
      gradient: 'from-amber-500 to-orange-600',
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-600',
      iconBg: 'bg-amber-100'
    },
    {
      title: 'Active Deliveries',
      value: stats.activeDeliveries || 0,
      icon: Truck,
      gradient: 'from-purple-500 to-purple-600',
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-600',
      iconBg: 'bg-purple-100'
    },
    {
      title: 'Delivered Orders',
      value: stats.deliveredOrders || 0,
      icon: CheckCircle,
      gradient: 'from-green-500 to-green-600',
      bgLight: 'bg-green-50',
      textColor: 'text-green-600',
      iconBg: 'bg-green-100'
    },
    {
      title: 'Delivery Boys',
      value: stats.deliveryBoys || 0,
      icon: Users,
      gradient: 'from-indigo-500 to-indigo-600',
      bgLight: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      iconBg: 'bg-indigo-100'
    },
    {
      title: 'Total Revenue',
      value: `৳${stats.totalRevenue?.toLocaleString() || 0}`,
      icon: DollarSign,
      gradient: 'from-emerald-500 to-emerald-600',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      iconBg: 'bg-emerald-100',
      isRevenue: true
    }
  ]

  return (
    <div className="">
      <div className="">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
            >
              <div className={`h-2 bg-gradient-to-r ${card.gradient}`}></div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${card.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                    <card.icon className={card.textColor} size={24} />
                  </div>
                  {card.isRevenue && (
                    <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                      <TrendingUp size={16} />
                      <span>+0%</span>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">{card.title}</p>
                  <h3 className={`text-3xl font-bold ${card.textColor}`}>
                    {card.value}
                  </h3>
                </div>

                <div className={`mt-4 pt-4 border-t border-gray-100 flex items-center justify-between`}>
                  <span className="text-xs text-gray-400">Last updated: Now</span>
                  <div className={`w-2 h-2 rounded-full ${card.gradient} bg-gradient-to-r animate-pulse`}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DeliverySummaryCard