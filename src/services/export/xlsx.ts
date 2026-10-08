import ExcelJS from "exceljs";
import type { SearchResult } from "@/types/search";

export async function generateXlsx(results: SearchResult[]) {
  const workbook = new ExcelJS.Workbook();

  const worksheet = workbook.addWorksheet("Resultados");

  worksheet.columns = [
    { header: "Nome", key: "name" },
    { header: "Endereço", key: "address" },
    { header: "Telefone", key: "phone" },
    { header: "Website", key: "website" },
  ];

  worksheet.addRows(results);

  return workbook.xlsx.writeBuffer();
}

export async function exportToXlsx(results: SearchResult[], fileName: string) {
  const buffer = await generateXlsx(results);

  downloadXlsx(buffer, fileName);
}

export function downloadXlsx(buffer: ArrayBuffer, fileName: string) {
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;

  link.click();

  URL.revokeObjectURL(url);
}
