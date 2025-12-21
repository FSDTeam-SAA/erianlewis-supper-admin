import React from 'react'
import DeliverySummaryCard from './_components/DalivarySummeryCard'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import EachPaymentChart from './_components/Eachpaymentchart'
import OrderOverview from './_components/Orderoverview'

function page() {
  return (
    <div>
      {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Rider Dashboard
            </h1>
            <nav className="flex items-center text-sm text-gray-600">
              <Link
                href="/dashboard"
                className="hover:text-red-500 transition-colors"
              >
                Dashboard
              </Link>
              <ChevronRight className="w-4 h-4 mx-2" />
              <span className="text-red-500 font-medium">Overview</span>
            </nav>
          </div>
        </div>
      <div>
        <DeliverySummaryCard />
      </div>
      <div className='my-10'>
        <EachPaymentChart />
      </div>
      <div>
        <OrderOverview />
      </div>
    </div>
  )
}

export default page