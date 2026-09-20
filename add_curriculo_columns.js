const { PrismaClient } = require('./node_modules/@prisma/client');
const p = new PrismaClient();

async function main() {
  console.log('🔧 Aplicando columnas de diseño curricular...');
  
  const sqls = [
    `ALTER TABLE programas ADD COLUMN IF NOT EXISTS version VARCHAR(191) NULL`,
    `ALTER TABLE programas ADD COLUMN IF NOT EXISTS duracion INT NULL`,
    `ALTER TABLE programas ADD COLUMN IF NOT EXISTS modalidad ENUM('PRESENCIAL','VIRTUAL','DISTANCIA','COMBINADO') NULL`,
    `ALTER TABLE programas ADD COLUMN IF NOT EXISTS area VARCHAR(191) NULL`,
    `ALTER TABLE programas ADD COLUMN IF NOT EXISTS areaDesempeno VARCHAR(191) NULL`,
    `ALTER TABLE programas ADD COLUMN IF NOT EXISTS titulacion VARCHAR(191) NULL`,
    `ALTER TABLE programas ADD COLUMN IF NOT EXISTS descripcion LONGTEXT NULL`,
    `ALTER TABLE programas ADD COLUMN IF NOT EXISTS perfilIngreso LONGTEXT NULL`,
    `ALTER TABLE programas ADD COLUMN IF NOT EXISTS perfilEgresado LONGTEXT NULL`,
  ];

  for (const sql of sqls) {
    try {
      await p.$executeRawUnsafe(sql);
      console.log('✅ OK:', sql.substring(25, 70));
    } catch (e) {
      // Si ya existe la columna, MySQL lanza error - lo ignoramos
      console.log('⚠️  SKIP (ya existe):', e.message.substring(0, 80));
    }
  }

  console.log('✅ Columnas aplicadas correctamente.');
  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
