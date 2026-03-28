import React from "react";
import { Shield, Lock } from "lucide-react";

function Header() {
  return (
    <header className="w-full" style={{ background: "linear-gradient(90deg, #DB2626 0%, #B91C1C 100%)" }}>
      <div className="h-[159px] flex items-center justify-between container mx-auto">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Shield Icon */}
          <div className="flex items-center justify-center">
            <Shield className="w-12 h-12 text-white/80 stroke-[1.5]" />
          </div>

          {/* Title & Subtitle */}
          <div className="flex flex-col">
            <h1 className="text-white font-bold text-[32px] leading-[100%]">
              Superadmin Control Center
            </h1>
            <div className="mt-6">
              <p className="text-white text-base mt-0.5 font-normal leading-[100%]">
                Platform Owner Dashboard · Full System Authority
              </p>
              <p className="text-white text-base mt-3 font-normal leading-[100%]">
                Access: erian264
              </p>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 rounded-md px-4 py-2 bg-[#FFFFFF1A]">
          <Lock className="w-4 h-4 text-white/80" />
          <span className="text-white text-sm font-medium">
            Superadmin (erian264)
          </span>
        </div>
      </div>
    </header>
  );
}

export default Header;
