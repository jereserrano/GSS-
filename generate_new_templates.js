const xlsx = require("xlsx");
const path = require("path");

const createTemplate = (filename, data) => {
  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet(data);
  xlsx.utils.book_append_sheet(wb, ws, "Plantilla");
  xlsx.writeFile(wb, path.join(__dirname, "public", filename));
  console.log(`Creada: ${filename}`);
};

const competenciasData = [
  {
    codigo: "C-01",
    nombre: "Desarrollar aplicaciones móviles",
    codigoPrograma: "PROG-101",
    tipo: "TECNICA",
    duracionHoras: 400
  },
  {
    codigo: "C-02",
    nombre: "Inglés técnico",
    codigoPrograma: "PROG-101",
    tipo: "TRANSVERSAL",
    duracionHoras: 100
  }
];

const resultadosData = [
  {
    codigo: "RAP-01",
    nombre: "Codificar la interfaz gráfica usando React Native",
    codigoCompetencia: "C-01",
    fase: "EJECUCION"
  },
  {
    codigo: "RAP-02",
    nombre: "Diseñar la base de datos local",
    codigoCompetencia: "C-01",
    fase: "PLANEACION"
  }
];

createTemplate("plantilla_competencias.xlsx", competenciasData);
createTemplate("plantilla_resultados.xlsx", resultadosData);
