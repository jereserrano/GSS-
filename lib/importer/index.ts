import { z } from "zod";

export interface ImportResult<T> {
  success: number;
  failed: number;
  errors: { fila: number; error: string }[];
  data: T[];
}

export function validateImportData<T>(
  rawData: any[],
  schema: z.ZodSchema<T>
): ImportResult<T> {
  const result: ImportResult<T> = {
    success: 0,
    failed: 0,
    errors: [],
    data: [],
  };

  rawData.forEach((row, index) => {
    const parsed = schema.safeParse(row);
    if (parsed.success) {
      result.success++;
      result.data.push(parsed.data);
    } else {
      result.failed++;
      result.errors.push({
        fila: index + 2, // Asumiendo que la fila 1 es el encabezado
        error: parsed.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "),
      });
    }
  });

  return result;
}
