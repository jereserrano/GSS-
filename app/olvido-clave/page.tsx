import React, { Suspense } from "react";
import { OlvidoClaveClient } from "./OlvidoClaveClient";

export const dynamic = "force-dynamic";

export default function OlvidoClavePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1600')" }}>
      <div className="absolute inset-0 bg-[#00304D]/90 backdrop-blur-sm"></div>
      <div className="relative w-full max-w-md bg-white p-8 rounded-2xl shadow-xl z-10 border border-slate-100">
        <Suspense fallback={<div className="text-center p-4">Cargando...</div>}>
          <OlvidoClaveClient />
        </Suspense>
      </div>
    </div>
  );
}
