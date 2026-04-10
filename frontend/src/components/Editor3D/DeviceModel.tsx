import { useRef, useState } from "react";
import { useCursor, TransformControls } from "@react-three/drei";
import { useEditorStore } from "../../stores/useEditorStore";
import { getDeviceSize, getDeviceColor } from "./deviceHelpers";
import type { DeviceType } from "./deviceHelpers";
import type { Mesh } from "three";

interface Device {
  id: string;
  name: string;
  type: DeviceType;
  posX: number;
  posY: number;
  posZ: number;
  rotation: number;
}

interface Props {
  device: Device;
  onMove?: (id: string, x: number, y: number, z: number) => void;
}

export function DeviceModel({ device, onMove }: Props) {
  const ref = useRef<Mesh>(null);
  const [meshReady, setMeshReady] = useState<Mesh | null>(null);
  const { mode, selectedDeviceId, selectDevice } = useEditorStore();
  const isSelected = selectedDeviceId === device.id;

  useCursor(mode === "select");

  return (
    <>
      <mesh
        ref={(node) => {
          ref.current = node!;
          setMeshReady(node); // ← guardamos el mesh en estado para usarlo fuera del render
        }}
        position={[
          device.posX,
          device.posY + getDeviceSize(device.type)[1] / 2,
          device.posZ,
        ]}
        rotation={[0, device.rotation, 0]}
        onClick={(e) => {
          e.stopPropagation();
          selectDevice(device.id);
        }}
        castShadow
      >
        <boxGeometry args={getDeviceSize(device.type)} />
        <meshStandardMaterial
          color={isSelected ? "#FFD700" : getDeviceColor(device.type)}
          emissive={isSelected ? "#FFD700" : "#000000"}
          emissiveIntensity={isSelected ? 0.2 : 0}
        />
      </mesh>

      {isSelected && mode === "move" && meshReady && (
        <TransformControls
          object={meshReady}
          mode="translate"
          onMouseUp={() => {
            if (ref.current && onMove) {
              const pos = ref.current.position;
              onMove(device.id, pos.x, pos.y, pos.z);
            }
          }}
        />
      )}

      {isSelected && mode === "rotate" && meshReady && (
        <TransformControls object={meshReady} mode="rotate" />
      )}
    </>
  );
}
