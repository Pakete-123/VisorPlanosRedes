import { useMemo } from "react";
import * as THREE from "three";

const VLAN_COLORS: Record<number, string> = {
  10: "#2196F3",
  20: "#4CAF50",
  30: "#F44336",
  40: "#FF9800",
  50: "#9C27B0",
};

interface PathPoint {
  x: number;
  z: number;
}

interface CableProps {
  fromPos: { x: number; z: number };
  toPos: { x: number; z: number };
  vlan?: number;
  pathPoints?: PathPoint[];
}

export function CableLine({
  fromPos,
  toPos,
  vlan,
  pathPoints = [],
}: CableProps) {
  const lineObject = useMemo(() => {
    const allPoints = [
      new THREE.Vector3(fromPos.x, 0.05, fromPos.z),
      ...pathPoints.map((p) => new THREE.Vector3(p.x, 0.05, p.z)),
      new THREE.Vector3(toPos.x, 0.05, toPos.z),
    ];

    const points =
      pathPoints.length > 0
        ? new THREE.CatmullRomCurve3(allPoints).getPoints(50)
        : allPoints;

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const color = VLAN_COLORS[vlan ?? 99] ?? "#607D8B";
    const material = new THREE.LineBasicMaterial({ color });

    return new THREE.Line(geometry, material);
  }, [fromPos, toPos, vlan, pathPoints]);

  return <primitive object={lineObject} />;
}
