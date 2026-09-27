const fs = require('fs');
let content = fs.readFileSync('components/layout/Sidebar.tsx', 'utf8');

// Replace Aprendiz block
content = content.replace(/{ icon: BookCheck, label: "Mis actividades", href: "\/actividades" },/g, '{ icon: BookCheck, label: "Mis Actividades", href: "/gestor-actividades" },');
content = content.replace(/{ icon: FileSignature, label: "Mis entregas", href: "\/entregas" },\r?\n\s*/g, '');
content = content.replace(/{ icon: TrendingUp, label: "Mis resultados", href: "\/resultados" },/g, '{ icon: TrendingUp, label: "Mis Calificaciones", href: "/centro-calificaciones" },');
content = content.replace(/{ icon: ClipboardList, label: "Ruta de aprendizaje", href: "\/plan-formacion" },/g, '{ icon: Target, label: "Mi Ruta de Aprendizaje", href: "/diseno-curricular" },');

fs.writeFileSync('components/layout/Sidebar.tsx', content);
console.log('Sidebar aprendiz updated via script');
