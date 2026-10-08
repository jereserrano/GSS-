import React from "react";
import { ThemeInjector } from "@/components/layout/ThemeInjector";

export const dynamic = "force-dynamic";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ThemeInjector />
      {children}
    </>
  );
}
