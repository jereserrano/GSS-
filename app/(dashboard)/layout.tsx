import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-app">
      <Sidebar />
      <div className="main-content flex-1 flex flex-col w-full min-h-screen">
        <Header />
        <main className="flex-1 w-full relative">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
