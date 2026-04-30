import React, { Suspense } from "react";
import CommunicationLog from "./_components/CommunicationLog";

function page() {
  return (
    <Suspense fallback={<div></div>}>
      <CommunicationLog />
    </Suspense>
  );
}

export default page;
