import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { ColumnaDef } from "@/types/common.types";

interface DataTableProps<T> {
  data: T[];
  columnas: ColumnaDef<T>[];
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
}

export function DataTable<T>({ data, columnas, onRowClick, isLoading }: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="skeleton h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-surface">
        <p className="text-muted-foreground">No se encontraron registros</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-surface">
      <Table>
        <TableHeader>
          <TableRow>
            {columnas.map((col, index) => (
              <TableHead 
                key={String(col.key) + index}
                style={{ 
                  minWidth: col.minWidth ? `${col.minWidth}px` : undefined,
                  textAlign: col.align || "left"
                }}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow 
              key={rowIndex} 
              className={onRowClick ? "table-row-hover" : ""}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columnas.map((col, colIndex) => (
                <TableCell 
                  key={String(col.key) + colIndex}
                  style={{ textAlign: col.align || "left" }}
                >
                  {col.render ? col.render(row) : String(row[col.key as keyof T] ?? "—")}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
