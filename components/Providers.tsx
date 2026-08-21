"use client";

import { Suspense } from "react";
import { ToastProvider } from "@/lib/toast-context";
import ToastContainer from "@/components/ToastContainer";
import TopLoader from "@/components/TopLoader";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {/* TopLoader needs useSearchParams → wrap in Suspense */}
      <Suspense fallback={null}>
        <TopLoader />
      </Suspense>
      <ToastContainer />
      {children}
    </ToastProvider>
  );
}
