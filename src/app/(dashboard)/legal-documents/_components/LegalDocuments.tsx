import React from 'react';

function LegalDocuments() {
  return (
    <div className="p-6">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Legal & Policy Control Center</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage support resources and legal documentation for your platform
          </p>
        </div>
 
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <div className="px-6 py-3 border-b-2 border-red-600 text-red-600 font-medium text-sm">
            Support & Resources
          </div>
          <div className="px-6 py-3 text-gray-500 font-medium text-sm hover:text-gray-700 cursor-pointer">
            Legal
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Support */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                ✉️
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">Contact Support</h3>
                <p className="text-sm text-gray-500 mt-1">Not Configured</p>
                
                <button className="mt-6 w-full bg-red-600 hover:bg-red-700 transition-colors text-white font-medium py-3 px-6 rounded-xl">
                  Configure
                </button>
              </div>
            </div>
          </div>

          {/* Manage Social */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                🔗
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">Manage Social</h3>
                <p className="text-sm text-gray-500 mt-1">Not Configured</p>
                
                <button className="mt-6 w-full bg-red-600 hover:bg-red-700 transition-colors text-white font-medium py-3 px-6 rounded-xl">
                  Configure
                </button>
              </div>
            </div>
          </div>

          {/* Knowledge Base */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm lg:col-span-2">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                📖
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">Knowledge Base</h3>
                <p className="text-sm text-gray-500 mt-1">Not Configured</p>
                
                <button className="mt-6 w-full bg-red-600 hover:bg-red-700 transition-colors text-white font-medium py-3 px-6 rounded-xl">
                  Configure
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LegalDocuments;