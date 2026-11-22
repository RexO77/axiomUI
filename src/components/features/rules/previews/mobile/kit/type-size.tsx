import { Readout } from "./frame";
import type { Profile, Host } from "./geometry";
import { bodySizes, largeAndroidSizes } from "./type-metrics";

export { bodySizes, largeAndroidSizes };

export function TypeSizeControl({ host, profile, enlarged, change }: {
  host: Host; profile: Profile; enlarged: boolean; change: (large: boolean) => void;
}) {
  const iosBody = host === "App" && profile === "iOS";
  const value = enlarged ? (iosBody ? "AX5" : "200%") : (iosBody ? "Default Body" : "100%");
  return <div><label>Text size <select value={value} onChange={e => change(e.target.selectedIndex === 1)}>
    <option>{iosBody ? "Default Body" : "100%"}</option><option>{iosBody ? "AX5" : "200%"}</option>
  </select></label><Readout kind="Simulated">{host === "Browser" ? "Browser text resize" : profile + " setting"}</Readout></div>;
}
