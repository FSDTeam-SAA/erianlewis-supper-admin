// import AppProvider from "@/provider/AppProvider";
import Header from "@/components/header/Header";
import Navigation from "@/components/navigation/Navigation";
import React from "react";

function layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div className="">
        <Navigation />
        <div className="bg-[#F9FAFB] py-10">
          {children}
        </div>
      </div>
    </>
  );
}

export default layout;
