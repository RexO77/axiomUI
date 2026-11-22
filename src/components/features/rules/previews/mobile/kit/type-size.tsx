import { Readout } from "./frame";
import type { Profile, Host } from "./geometry";

// Default and AX5 Body, and the sizes used by the Android 14 payment fixture.
// Android source tag android-14.0.0_r1, FontScaleConverterFactory 200% table.
export const bodySizes = { default: 17, AX5: 53 } as const;
export const largeAndroidSizes = { 14: 26, 20: 34, 30: 38 } as const;
export function TypeSizeControl({ host, profile, enlarged, change }: {
  host: Host; profile: Profile; enlarged: boolean; change: (large: boolean) => void;
}) {
  const iosBody = host === "App" && profile === "iOS";
  const value = enlarged ? (iosBody ? "AX5" : "200%") : (iosBody ? "Default Body" : "100%");
  return <div><label>Text size <select value={value} onChange={e => change(e.target.selectedIndex === 1)}>
    <option>{iosBody ? "Default Body" : "100%"}</option><option>{iosBody ? "AX5" : "200%"}</option>
  </select></label><Readout kind="Simulated">{host === "Browser" ? "Browser text resize" : profile + " setting"}</Readout></div>;
}
