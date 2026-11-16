import { spawn } from "node:child_process";

/*
 * A Mac that idles into sleep mid-run stalls the browser: its dark wakes make
 * no frames, so a view transition never ends.
 * `caffeinate -i` holds off idle sleep until this runner exits. It cannot stop
 * a closed lid on battery; the `awake` fixture in helpers.ts reports that case.
 */
export default function globalSetup(): void {
  if (process.platform !== "darwin") return;
  const keepAwake = spawn("caffeinate", ["-i", "-w", String(process.pid)], { stdio: "ignore" });
  keepAwake.on("error", () => {});
  keepAwake.unref();
}
