"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
// import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"
import {
  CheckCircle,
  ShieldOff,
//   LayoutList,
  Mail,
  Phone,
  MapPin,
  Calendar,
} from "lucide-react"

// const islands = ["Anguilla", "Aruba", "Barbuda", "Bermuda"]

export function AccoutntModal() {
  const [open, setOpen] = useState(false)          // ← new
//   const [selectedIslands, setSelectedIslands] = useState<string[]>([])
//   const [plan, setPlan] = useState("free")

//   const toggleIsland = (island: string) => {
//     setSelectedIslands(prev =>
//       prev.includes(island) ? prev.filter(i => i !== island) : [...prev, island]
//     )
//   }

  return (
    <Dialog open={open} onOpenChange={setOpen}>   {/* ← updated */}
      <DialogTrigger asChild>
        <button className="text-[20px] leading-[120%] font-semibold text-[#DF2634] hover:text-[#DF2634]/80 transition-colors">
          Manage
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-[480px] p-0 overflow-hidden rounded-2xl [&>button]:hidden">

        <DialogHeader className="sr-only">
          <DialogTitle>Account Management</DialogTitle>
        </DialogHeader>

        <div className="max-h-[85vh] overflow-y-auto no-scrollbar">

          {/* ── Top Action Buttons ── */}
          <div className="p-4 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button className="bg-green-500 hover:bg-green-600 text-white h-11 flex items-center gap-2 rounded-lg">
                <CheckCircle className="w-4 h-4" />
                Activate
              </Button>
              <Button className="bg-red-500 hover:bg-red-600 text-white h-11 flex items-center gap-2 rounded-lg">
                <ShieldOff className="w-4 h-4" />
                Suspend
              </Button>
            </div>
            {/* <Button
              variant="outline"
              className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white border-0 flex items-center gap-2 rounded-lg"
            >
              <LayoutList className="w-4 h-4" />
              View Listings
            </Button> */}
          </div>

          {/* ── Operating Islands ── */}
          {/* <div className="mx-4 mb-4 border border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-900">Operating Islands</h3>
            <p className="text-xs text-gray-400 mt-1 mb-4 leading-relaxed">
              Set a primary island (single) and any number of operating islands. The primary island is always
              included in the operating islands list.
            </p>

            <p className="text-xs text-gray-500 mb-2">Operating islands</p>

            <div className="grid grid-cols-2 gap-2 mb-3">
              {islands.map((island) => (
                <label
                  key={`left-${island}`}
                  className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50"
                >
                  <Checkbox
                    checked={selectedIslands.includes(`left-${island}`)}
                    onCheckedChange={() => toggleIsland(`left-${island}`)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">{island}</span>
                </label>
              ))}
              {islands.map((island) => (
                <label
                  key={`right-${island}`}
                  className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50"
                >
                  <Checkbox
                    checked={selectedIslands.includes(`right-${island}`)}
                    onCheckedChange={() => toggleIsland(`right-${island}`)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">{island}</span>
                </label>
              ))}
            </div>

            <p className="text-xs text-gray-400 mb-3">Current: Not specified</p>

            <Button className="w-full bg-red-300 hover:bg-red-400 text-white h-10 rounded-lg text-sm">
              Update Islands
            </Button>
          </div> */}

          {/* ── Subscription ── */}
          {/* <div className="mx-4 mb-4 border border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Subscription</h3>
            <p className="text-xs text-gray-400 mb-3">Plan</p>

            <Select value={plan} onValueChange={setPlan}>
              <SelectTrigger className="h-11 text-sm border-gray-200 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free Plan (free)</SelectItem>
                <SelectItem value="basic">Basic Plan</SelectItem>
                <SelectItem value="pro">Pro Plan</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              className="w-full mt-3 h-11 text-sm border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              View Security Flags
            </Button>
          </div> */}

          {/* ── Account Information ── */}
          <div className="mx-4 mb-4 border border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Account Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                  <Mail className="w-3 h-3" /> Email
                </div>
                <p className="text-sm font-medium text-gray-800">you@gmail.com</p>
              </div>

              <div>
                <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                  <Phone className="w-3 h-3" /> Phone
                </div>
                <p className="text-sm font-medium text-gray-800">+888 203 3485</p>
              </div>

              <div>
                <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                  <MapPin className="w-3 h-3" /> Operating Islands
                </div>
                <p className="text-sm font-medium text-gray-800">Not specific</p>
              </div>

              <div>
                <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                  <Calendar className="w-3 h-3" /> Joining Date
                </div>
                <p className="text-sm font-medium text-gray-800">February 19, 2026</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Full Name</p>
                <p className="text-sm font-medium text-gray-800">R</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Business Name</p>
                <p className="text-sm font-medium text-gray-800">Not provided</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Account Status</p>
                <p className="text-sm font-medium text-gray-800">Active</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Role</p>
                <p className="text-sm font-medium text-gray-800">Tenant</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Subscription Plan</p>
                <p className="text-sm font-medium text-gray-800">Free</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Total Listings</p>
                <p className="text-sm font-medium text-gray-800">0</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Total Appointments</p>
                <p className="text-sm font-medium text-gray-800">0</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Superadmin</p>
                <p className="text-sm font-medium text-gray-800">No</p>
              </div>
            </div>
          </div>

          {/* ── Close Button ── */}
          <div className="px-4 pb-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}      
              className="w-full h-11 text-sm border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl"
            >
              Close
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}