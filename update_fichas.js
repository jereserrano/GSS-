const fs = require('fs');
const file = 'c:/GSS/actions/fichas.actions.ts';
let data = fs.readFileSync(file, 'utf8');

// Update userRecord fetch check
data = data.replace(
`      } else if (roleUpper.includes("APRENDIZ") && userRecord?.aprendiz?.fichaId) {
        aprendizFichaId = userRecord.aprendiz.fichaId;
      }
    }`,
`      } else if (roleUpper.includes("APRENDIZ") && userRecord?.aprendiz?.fichaId) {
        aprendizFichaId = userRecord.aprendiz.fichaId;
      } else if (roleUpper === "APOYO_COORDINACION") {
        if (!userRecord?.sedeId) return { success: true, data: paginatedResponse([], 0, pagina, tamano) };
        (filtros as any)._forcedSedeId = userRecord.sedeId;
      }
    }`
);

data = data.replace(
`      ...(filtros.institucionId ? { institucionId: filtros.institucionId } : {}),
      ...(filtros.programaId ? { programaId: filtros.programaId } : {}),
      ...(filtros.estado ? { estado: filtros.estado.toUpperCase() } : {}),
      ...(instructorIdFilter ? { instructores: { some: { instructorId: instructorIdFilter } } } : {}),
      ...(aprendizFichaId ? { id: aprendizFichaId } : {}),
    };`,
`      ...(filtros.institucionId ? { institucionId: filtros.institucionId } : {}),
      ...(filtros.programaId ? { programaId: filtros.programaId } : {}),
      ...(filtros.estado ? { estado: filtros.estado.toUpperCase() } : {}),
      ...(instructorIdFilter ? { instructores: { some: { instructorId: instructorIdFilter } } } : {}),
      ...(aprendizFichaId ? { id: aprendizFichaId } : {}),
      ...((filtros as any)._forcedSedeId ? { sedeId: (filtros as any)._forcedSedeId } : {}),
    };`
);

data = data.replace(
`    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR"]);
    const existing = await FichaRepository.findUnique({ where: { codigo: data.codigo } });`,
`    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "APOYO_COORDINACION"]);
    const userSedeId = (user as any).sedeId;
    if (user.rol === "APOYO_COORDINACION" && userSedeId && data.sedeId !== userSedeId) {
      return { error: "Solo puedes crear fichas para tu propia sede." };
    }
    const existing = await FichaRepository.findUnique({ where: { codigo: data.codigo } });`
);

data = data.replace(
`    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR"]);
    
    const existing = await FichaRepository.findUnique({ where: { id: data.id } });`,
`    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "APOYO_COORDINACION"]);
    
    const existing = await FichaRepository.findUnique({ where: { id: data.id } });
    const userSedeId = (user as any).sedeId;
    if (user.rol === "APOYO_COORDINACION" && userSedeId && (existing.sedeId !== userSedeId || data.sedeId !== userSedeId)) {
      return { error: "No tienes permiso para modificar fichas de otra sede o moverlas." };
    }`
);

fs.writeFileSync(file, data);
console.log("fichas.actions.ts updated");
