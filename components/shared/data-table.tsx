"use client";

import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface DataTableProps<T> {
  columns: {
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T) => ReactNode;
    className?: string;
  }[];
  data: T[];
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  onRowClick,
  isLoading,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col, i) => (
                <TableHead key={i} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                {columns.map((_, j) => (
                  <TableCell key={j}>
                    <div className="h-5 w-full animate-pulse rounded bg-muted" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col, i) => (
              <TableHead key={i} className={col.className}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                No results found.
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, i) => (
              <TableRow
                key={i}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
                  onRowClick && "cursor-pointer"
                )}
              >
                {columns.map((col, j) => (
                  <TableCell key={j} className={col.className}>
                    {col.cell
                      ? col.cell(item)
                      : (item[col.accessorKey as keyof T] as ReactNode)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
