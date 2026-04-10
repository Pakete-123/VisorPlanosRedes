import { Canvas } from '@react-three/fiber';
import { OrthographicCamera, OrbitControls, Grid } from '@react-three/drei';

export function Editor3D() {
  return (
    <div className="w-full h-full">
      <Canvas shadows>
        {/* Cámara ortográfica — produce el efecto isométrico de la captura */}
        <OrthographicCamera
          makeDefault
          position={[15, 15, 15]}
          zoom={60}
          near={0.1}
          far={500}
        />
        {/* Controles: zoom y paneo sí, rotación libre no */}
        <OrbitControls
          enableRotate={false}
          enableZoom={true}
          enablePan={true}
        />
        {/* Iluminación */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
        {/* Suelo y cuadrícula */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#2a2a3e" />
        </mesh>
        <Grid
          args={[50, 50]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#3a3a5e"
          sectionSize={5}
        />
      </Canvas>
    </div>
  );
}