"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { Session } from "next-auth";

interface ProvidersProps {
  children: React.ReactNode;
  session?: Session | null;
}

export function Providers({ children, session = null }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      {children}
      <Toaster 
        position="top-center" 
        closeButton
        toastOptions={{
          classNames: {
            toast: "group flex items-start gap-3 w-full p-4 rounded-2xl shadow-lg border backdrop-blur-md font-sans text-sm font-medium transition-all",
            title: "text-sm font-semibold",
            description: "text-xs mt-1 font-normal opacity-90",
            success: "bg-emerald-50/85 border-emerald-200/60 text-emerald-800 [&>svg]:text-emerald-600",
            error: "bg-red-50/85 border-red-200/60 text-red-800 [&>svg]:text-red-600",
            warning: "bg-amber-50/85 border-amber-200/60 text-amber-800 [&>svg]:text-amber-600",
            info: "bg-blue-50/85 border-blue-200/60 text-blue-800 [&>svg]:text-blue-600",
            icon: "mt-0.5",
          }
        }}
      />
    </SessionProvider>
  );
}
