import { promises as fs } from "fs";
import path from "path";

const FILE = path.join(process.cwd(), ".data", "usage.json");
const MONTHLY_LIMIT = 800;

type Usage = { month: string; count: number };

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

async function readUsage(): Promise<Usage> {
  try {
    const parsed = JSON.parse(await fs.readFile(FILE, "utf8")) as Usage;
    if (parsed.month === currentMonth()) return parsed;
  } catch {
    // arquivo ainda não existe
  }
  return { month: currentMonth(), count: 0 };
}

let queue: Promise<unknown> = Promise.resolve();

export function reserveRequest() {
  const run = queue.then(async () => {
    const usage = await readUsage();

    if (usage.count >= MONTHLY_LIMIT) {
      return { ok: false, used: usage.count, limit: MONTHLY_LIMIT };
    }

    usage.count += 1;
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(usage));

    return { ok: true, used: usage.count, limit: MONTHLY_LIMIT };
  });

  queue = run.catch(() => undefined);
  return run;
}
