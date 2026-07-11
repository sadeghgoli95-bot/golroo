import fs from "fs";
import path from "path";

export function getObservation(slug: string) {
  return fs.readFileSync(
    path.join(process.cwd(), `content/observations/${slug}.md`),
    "utf8"
  );
}
