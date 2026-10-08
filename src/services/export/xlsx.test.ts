/**
 * @jest-environment jsdom
 */

import type { SearchResult } from "@/types/search";
import { downloadXlsx, exportToXlsx, generateXlsx } from "./xlsx";
import ExcelJS from "exceljs";

describe("generateXlsx", () => {
  it("deve gerar um arquivo XLSX em memória", async () => {
    const results: SearchResult[] = [
      {
        name: "Restaurante Teste",
        address: "Niterói - RJ",
        phone: "+55 21 99999-9999",
        website: "https://example.com",
      },
    ];

    const buffer = await generateXlsx(results);

    expect(buffer).toBeDefined();
    expect(buffer.byteLength).toBeGreaterThan(0);
  });

  it("deve incluir os cabeçalhos e os dados dos resultados", async () => {
    const results: SearchResult[] = [
      {
        name: "Restaurante Teste",
        address: "Niterói - RJ",
        phone: "+55 21 99999-9999",
        website: "https://example.com",
      },
    ];

    const buffer = await generateXlsx(results);

    const workbook = new ExcelJS.Workbook();

    await workbook.xlsx.load(buffer);

    const worksheet = workbook.getWorksheet("Resultados");

    expect(worksheet).toBeDefined();

    expect(worksheet?.getCell("A1").value).toBe("Nome");
    expect(worksheet?.getCell("B1").value).toBe("Endereço");
    expect(worksheet?.getCell("C1").value).toBe("Telefone");
    expect(worksheet?.getCell("D1").value).toBe("Website");

    expect(worksheet?.getCell("A2").value).toBe("Restaurante Teste");
    expect(worksheet?.getCell("B2").value).toBe("Niterói - RJ");
    expect(worksheet?.getCell("C2").value).toBe("+55 21 99999-9999");
    expect(worksheet?.getCell("D2").value).toBe("https://example.com");
  });

  it("deve iniciar o download do arquivo XLSX", () => {
    const buffer = new ArrayBuffer(8);

    const createObjectURLMock = jest
      .fn()
      .mockReturnValue("blob:http://localhost/test");

    const revokeObjectURLMock = jest.fn();

    Object.defineProperty(URL, "createObjectURL", {
      writable: true,
      value: createObjectURLMock,
    });

    Object.defineProperty(URL, "revokeObjectURL", {
      writable: true,
      value: revokeObjectURLMock,
    });

    const link = document.createElement("a");
    const clickMock = jest.spyOn(link, "click");

    jest.spyOn(document, "createElement").mockReturnValue(link);

    downloadXlsx(buffer, "resultados.xlsx");

    expect(createObjectURLMock).toHaveBeenCalled();
    expect(link.href).toBe("blob:http://localhost/test");
    expect(link.download).toBe("resultados.xlsx");
    expect(clickMock).toHaveBeenCalled();
    expect(revokeObjectURLMock).toHaveBeenCalledWith(
      "blob:http://localhost/test",
    );
  });

  it("deve gerar e iniciar o download do XLSX", async () => {
    const results: SearchResult[] = [
      {
        name: "Restaurante Teste",
        address: "Niterói - RJ",
        phone: "+55 21 99999-9999",
        website: "https://example.com",
      },
    ];

    const createObjectURLMock = jest
      .fn()
      .mockReturnValue("blob:http://localhost/test");

    const revokeObjectURLMock = jest.fn();

    Object.defineProperty(URL, "createObjectURL", {
      writable: true,
      value: createObjectURLMock,
    });

    Object.defineProperty(URL, "revokeObjectURL", {
      writable: true,
      value: revokeObjectURLMock,
    });

    const link = document.createElement("a");
    const clickMock = jest.spyOn(link, "click");

    jest.spyOn(document, "createElement").mockReturnValue(link);

    await exportToXlsx(results, "resultados.xlsx");

    expect(createObjectURLMock).toHaveBeenCalled();
    expect(link.download).toBe("resultados.xlsx");
    expect(clickMock).toHaveBeenCalled();
    expect(revokeObjectURLMock).toHaveBeenCalledWith(
      "blob:http://localhost/test",
    );
  });
});
