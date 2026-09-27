const fs = require('fs');
const path = 'c:/GSS/features/academico/DisenoCurricularTree.tsx';
let content = fs.readFileSync(path, 'utf8');

// The lines we want to replace have `!isAprendiz` inside JSX.
content = content.replace(/{!isAprendiz \? \(/g, '{!readOnly ? (');
content = content.replace(/{!isAprendiz && \(/g, '{!readOnly && (');
content = content.replace(/{!isAprendiz && <button/g, '{!readOnly && <button');
content = content.replace(/No hay resultados de aprendizaje. {!isAprendiz &&/g, 'No hay resultados de aprendizaje. {!readOnly &&');
content = content.replace(/No hay criterios de evaluación. {!isAprendiz &&/g, 'No hay criterios de evaluación. {!readOnly &&');

fs.writeFileSync(path, content, 'utf8');
console.log('done');
