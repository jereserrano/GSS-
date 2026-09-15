import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-app">
      <Sidebar />
      <div className="main-content flex-1 flex flex-col w-full">
        <Header />
        <main className="flex-1 w-full relative">
          {children}
        </main>
      </div>
    </div>
  );
}
