import fs from "fs";
import path from "path";

export function getObservationSlugs() {
  return fs.readdirSync(
    path.join(process.cwd(), "content/observations")
  );
}
