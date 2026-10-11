import { promises as fs } from "fs";
import path from "path";
import { reserveRequest } from "./usage-limit";

jest.mock("fs", () => ({
  promises: {
    readFile: jest.fn(),
    mkdir: jest.fn(),
    writeFile: jest.fn(),
  },
}));

const mockedFs = fs as unknown as {
  readFile: jest.Mock;
  mkdir: jest.Mock;
  writeFile: jest.Mock;
};

const usageFile = path.join(process.cwd(), ".data", "usage.json");

describe("reserveRequest", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-10-10T12:00:00.000Z"));

    mockedFs.readFile.mockResolvedValue(
      JSON.stringify({
        month: "2026-10",
        count: 10,
      }),
    );

    mockedFs.mkdir.mockResolvedValue(undefined);
    mockedFs.writeFile.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("deve incrementar e persistir o contador mensal", async () => {
    const result = await reserveRequest();

    expect(result).toEqual({
      ok: true,
      used: 11,
      limit: 800,
    });

    expect(mockedFs.readFile).toHaveBeenCalledWith(usageFile, "utf8");

    expect(mockedFs.mkdir).toHaveBeenCalledWith(path.dirname(usageFile), {
      recursive: true,
    });

    expect(mockedFs.writeFile).toHaveBeenCalledWith(
      usageFile,
      JSON.stringify({
        month: "2026-10",
        count: 11,
      }),
    );
  });

  it("deve bloquear novas requisições quando o limite mensal for atingido", async () => {
    mockedFs.readFile.mockResolvedValue(
      JSON.stringify({
        month: "2026-10",
        count: 800,
      }),
    );

    const result = await reserveRequest();

    expect(result).toEqual({
      ok: false,
      used: 800,
      limit: 800,
    });

    expect(mockedFs.writeFile).not.toHaveBeenCalled();
    expect(mockedFs.mkdir).not.toHaveBeenCalled();
  });

  it("deve reiniciar o contador quando o mês mudar", async () => {
    mockedFs.readFile.mockResolvedValue(
      JSON.stringify({
        month: "2026-09",
        count: 800,
      }),
    );

    const result = await reserveRequest();

    expect(result).toEqual({
      ok: true,
      used: 1,
      limit: 800,
    });

    expect(mockedFs.writeFile).toHaveBeenCalledWith(
      usageFile,
      JSON.stringify({
        month: "2026-10",
        count: 1,
      }),
    );
  });
});
