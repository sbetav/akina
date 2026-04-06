import { execSync } from "child_process";
import os from "os";

const command = process.argv[2];
const isWindows = os.platform() === "win32";

const cmd = isWindows ? `next ${command}` : `bun --bun next ${command}`;

execSync(cmd, { stdio: "inherit" });
