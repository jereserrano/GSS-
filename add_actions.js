const fs = require('fs');

const fichasPath = 'actions/fichas.actions.ts';
let fichasContent = fs.readFileSync(fichasPath, 'utf8');

const getFichasSelectActionCode = `
export async function getFichasSelectAction() {
  try {
    const session = await getServerSession(authOptions);
    let where = {};
    if (session?.user?.email) {
      const userRecord = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { rol: true, instructor: true, aprendiz: true }
      });
      const rolNombre = userRecord?.rol?.nombre?.toUpperCase() || "";
      if (rolNombre.includes("APRENDIZ") && userRecord?.aprendiz?.fichaId) {
        where = { id: userRecord.aprendiz.fichaId };
      }
    }
    const fichas = await prisma.ficha.findMany({
      where,
      select: { id: true, codigo: true, programa: { select: { nombre: true } } },
      orderBy: { codigo: "desc" }
    });
    return { success: true, data: fichas };
  } catch (error: any) {
    return { success: false, error: "Error al cargar fichas" };
  }
}
`;
if (!fichasContent.includes('getFichasSelectAction')) {
  fs.appendFileSync(fichasPath, getFichasSelectActionCode);
}


const actividadesPath = 'actions/actividades.actions.ts';
let actividadesContent = fs.readFileSync(actividadesPath, 'utf8');

const getActividadesByFichaActionCode = `
export async function getActividadesByFichaAction(fichaId: string) {
  try {
    const actividades = await prisma.actividad.findMany({
      where: { fichaId },
      include: {
        entregas: {
          include: {
            aprendiz: {
              include: { user: true }
            }
          }
        }
      },
      orderBy: { fechaVencimiento: "desc" }
    });
    return { success: true, data: actividades };
  } catch (error: any) {
    return { success: false, error: "Error al cargar actividades" };
  }
}
`;
if (!actividadesContent.includes('getActividadesByFichaAction')) {
  fs.appendFileSync(actividadesPath, getActividadesByFichaActionCode);
}

console.log('Added missing actions');
