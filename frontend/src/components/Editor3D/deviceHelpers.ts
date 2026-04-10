export type DeviceType =
  | "PC"
  | "SWITCH"
  | "RACK"
  | "AP_WIFI"
  | "PATCH_PANEL"
  | "SERVER"
  | "PRINTER";

export function getDeviceSize(type: DeviceType): [number, number, number] {
  const sizes: Record<DeviceType, [number, number, number]> = {
    PC: [0.8, 0.5, 0.8],
    SWITCH: [2.0, 0.2, 0.8],
    RACK: [1.0, 2.0, 0.6],
    AP_WIFI: [0.6, 0.1, 0.6],
    PATCH_PANEL: [2.0, 0.15, 0.5],
    SERVER: [0.8, 1.8, 0.6],
    PRINTER: [1.0, 0.6, 0.8],
  };
  return sizes[type] ?? [0.8, 0.8, 0.8];
}

export function getDeviceColor(type: DeviceType): string {
  const colors: Record<DeviceType, string> = {
    PC: "#4A90D9",
    SWITCH: "#2C7A4B",
    RACK: "#1C1C2E",
    AP_WIFI: "#F5A623",
    PATCH_PANEL: "#7B68EE",
    SERVER: "#555555",
    PRINTER: "#888888",
  };
  return colors[type] ?? "#AAAAAA";
}
