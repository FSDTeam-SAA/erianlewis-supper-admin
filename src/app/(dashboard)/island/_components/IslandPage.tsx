"use client"

import React, { useState } from 'react'
import { Map, Building2, Users, Search, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Island {
  id: number
  name: string
  properties: number
  salesRentals: string
  accounts: number
  totalActivity: number
}

const initialIslands: Island[] = [
  { id: 1, name: 'Anguilla',         properties: 1, salesRentals: 'Sales: 1 • Rentals: 2', accounts: 6,  totalActivity: 1 },
  { id: 2, name: 'Bahamas',          properties: 3, salesRentals: 'Sales: 5 • Rentals: 1', accounts: 8,  totalActivity: 4 },
  { id: 3, name: 'Anguilla',         properties: 1, salesRentals: 'Sales: 1 • Rentals: 2', accounts: 6,  totalActivity: 1 },
  { id: 4, name: 'Cayman Islands',   properties: 2, salesRentals: 'Sales: 3 • Rentals: 2', accounts: 5,  totalActivity: 2 },
  { id: 5, name: 'Turks and Caicos', properties: 4, salesRentals: 'Sales: 2 • Rentals: 5', accounts: 7,  totalActivity: 3 },
  { id: 6, name: 'Barbados',         properties: 5, salesRentals: 'Sales: 6 • Rentals: 3', accounts: 10, totalActivity: 5 },
]

const dataSource = [
  { label: 'Accounts',         value: '33', sub: null },
  { label: "Total Property's", value: '8',  sub: 'Sales: 3 • Rentals: 5' },
  { label: 'Managed Islands',  value: '33', sub: null },
]

function IslandCard({ island, onDelete }: { island: Island; onDelete: (id: number) => void }) {
  return (
    <div className="rounded-[12px] border border-gray-200 bg-white">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900">{island.name}</h3>
          <button onClick={() => onDelete(island.id)} className="text-red-400 hover:text-red-600 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gray-400" />
            <span className="text-base leading-[120%] font-medium text-[#4B4B4B]">Properties</span>
          </div>
          <span className="text-2xl font-medium text-[#4B4B4B]">{island.properties}</span>
        </div>

        <p className="text-xs text-gray-400 mb-2 pl-6">{island.salesRentals}</p>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-base leading-[120%] font-medium text-[#4B4B4B]">Accounts</span>
          </div>
          <span className="text-2xl font-medium text-[#4B4B4B]">{island.accounts}</span>
        </div>

        <div className="py-2 border-t border-gray-100 mb-3">
          <p className="text-xs text-gray-500 mb-1">Total Activity</p>
          <p className="text-2xl font-medium text-red-500">{island.totalActivity}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-gray-100 pt-3">
          <Button variant="outline" size="sm" className="text-base text-black hover:bg-gray-50 bg-[#F3F4F6] h-[40px]">
            View Accounts
          </Button>
          <Button variant="outline" size="sm" className="text-base text-black hover:bg-gray-50 bg-[#F3F4F6] h-[40px]">
            View Listings
          </Button>
        </div>
      </div>
    </div>
  )
}

function IslandPage() {
  const [search, setSearch]           = useState('')
  const [islands, setIslands]         = useState<Island[]>(initialIslands)
  const [showAddForm, setShowAddForm] = useState(false)   // ← new
  const [newIslandName, setNewIslandName] = useState('')  // ← new

  const filtered = islands.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = (id: number) => {
    setIslands(prev => prev.filter(i => i.id !== id))
  }

  // ── Add island handler ───────────────────────────────────────────────────
  const handleAdd = () => {
    if (!newIslandName.trim()) return
    const newIsland: Island = {
      id: Date.now(),
      name: newIslandName.trim(),
      properties: 0,
      salesRentals: 'Sales: 0 • Rentals: 0',
      accounts: 0,
      totalActivity: 0,
    }
    setIslands(prev => [...prev, newIsland])
    setNewIslandName('')
    setShowAddForm(false)
  }

  const handleCancel = () => {
    setNewIslandName('')
    setShowAddForm(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 container mx-auto py-8">

      {/* ── Page Header ── */}
      <div className="flex items-start gap-3 mb-6">
        <Map className="w-5 h-5 text-gray-700 mt-1 flex-shrink-0" />
        <div>
          <h1 className="text-2xl font-medium text-[#000000]">Island & Jurisdiction Control</h1>
          <p className="text-base text-[#9A9A9A] mt-3">
            Geographic segmentation and control layer for platform operations.
          </p>
        </div>
      </div>

      {/* ── Data Source Card ── */}
      <div className="bg-white mb-6">
        <div className="p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Data source</h2>
          <p className="text-sm text-gray-400 mb-4">Production</p>
          <div className="grid grid-cols-3 gap-4">
            {dataSource.map(({ label, value, sub }) => (
              <div key={label} className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-xl font-bold text-gray-900">{value}</p>
                {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Search + Add Button ── */}
      <div className="flex items-center gap-3 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search Island"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 border-gray-200 bg-white focus-visible:ring-1 focus-visible:ring-red-400 focus-visible:border-red-400 text-sm h-[48px]"
          />
        </div>
        <Button
          onClick={() => setShowAddForm(prev => !prev)}
          className="bg-[#DC2626] hover:bg-red-600 text-white flex items-center gap-2 px-4 text-sm h-[48px]"
        >
          <Plus className="w-4 h-4" />
          Add Island
        </Button>
      </div>

      {/* ── Add New Island Form (shows on click) ── */}
      {showAddForm && (
        <div className="bg-[#F9FAFB] border border-gray-200 rounded-[12px] p-4 mb-5">
          <p className="text-sm font-semibold text-gray-800 mb-3">Add New Island</p>
          <div className="flex items-center gap-3">
            <Input
              type="text"
              placeholder="Enter island name (e.g, Aruba, Bonaire)"
              value={newIslandName}
              onChange={e => setNewIslandName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              className="flex-1 border-gray-200 text-sm h-[44px] focus-visible:ring-1 focus-visible:ring-green-500 focus-visible:border-green-500"
              autoFocus
            />
            <Button
              onClick={handleAdd}
              className="bg-green-600 hover:bg-green-700 text-white text-sm px-5 h-[44px]"
            >
              Add
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="text-sm text-gray-600 border-gray-200 px-5 h-[44px] hover:bg-gray-50"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* ── Island Cards Grid ── */}
      <div className="grid grid-cols-3 gap-4">
        {filtered.map(island => (
          <IslandCard key={island.id} island={island} onDelete={handleDelete} />
        ))}
      </div>

    </div>
  )
}

export default IslandPage