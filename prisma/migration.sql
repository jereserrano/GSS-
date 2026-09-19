ALTER TABLE visitas_seguimiento 
  ADD COLUMN aprendizId VARCHAR(191) NULL,
  ADD COLUMN fichaId VARCHAR(191) NULL,
  MODIFY COLUMN institucionNombre VARCHAR(191) NULL;

ALTER TABLE visitas_seguimiento
  ADD CONSTRAINT fk_visita_aprendiz FOREIGN KEY (aprendizId) REFERENCES aprendices(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_visita_ficha FOREIGN KEY (fichaId) REFERENCES fichas(id) ON DELETE SET NULL;
