import { useThree } from "@react-three/fiber";

export function useExportPNG() {
  const { gl } = useThree();

  return (filename = "plano-red") => {
    const canvas = gl.domElement;
    const link = document.createElement("a");
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL("image/png", 1.0);
    link.click();
  };
}
