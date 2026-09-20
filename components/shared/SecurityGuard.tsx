"use client";

import React from "react";

interface SecurityGuardProps {
  children: React.ReactNode;
}

export function SecurityGuard({ children }: SecurityGuardProps) {
  // Nota: Se han desactivado los bloqueos de dispositivos móviles y de herramientas 
  // de desarrollador (F12, clic derecho) para permitir el uso completo de la PWA 
  // en celulares y facilitar la depuración y pruebas del sistema.
  
  return <>{children}</>;
}
