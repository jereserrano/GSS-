const fs = require('fs');
let content = fs.readFileSync('components/layout/Sidebar.tsx', 'utf8');

// Replace Academico/Gestión Formativa block
content = content.replace(/{ icon: Target, label: "Competencias", href: "\/competencias" },\r?\n\s*/g, '');
content = content.replace(/{ icon: FileText, label: "Resultados de Aprendizaje", href: "\/resultados-aprendizaje" },\r?\n\s*/g, '');
content = content.replace(/{ icon: ClipboardList, label: "Plan de Formación", href: "\/plan-formacion" },/g, '{ icon: Target, label: "Diseño Curricular", href: "/diseno-curricular" },');

// Replace Ejecucion block
content = content.replace(/{ icon: BookCheck, label: "Actividades", href: "\/actividades" },/g, '{ icon: BookCheck, label: "Gestor de Actividades", href: "/gestor-actividades" },');
content = content.replace(/{ icon: FileSignature, label: "Entregas", href: "\/entregas" },\r?\n\s*/g, '');
content = content.replace(/{ icon: FileCheck, label: "Evaluaciones", href: "\/evaluaciones" },/g, '{ icon: TrendingUp, label: "Centro de Calificaciones", href: "/centro-calificaciones" },');
content = content.replace(/{ icon: TrendingUp, label: "Resultados", href: "\/resultados" },\r?\n\s*/g, '');

// Replace Seguimiento
content = content.replace(/{ icon: Activity, label: "Seguimiento", href: "\/seguimiento" },/g, '{ icon: Activity, label: "Seguimiento a Riesgos", href: "/seguimiento-riesgos" },');
content = content.replace(/{ icon: AlertTriangle, label: "Riesgos", href: "\/riesgos" },\r?\n\s*/g, '');

fs.writeFileSync('components/layout/Sidebar.tsx', content);
console.log('Sidebar updated via script');
