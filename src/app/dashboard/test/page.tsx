import ComputersCanvas from '@/components/threejs/Motor3D'

export default function MyPlot() {
  return (
    <div className="3d-model-section w-[80vw] h-[80vh]">
      <h3>Modelo 3D del Motor</h3>
      <ComputersCanvas />
    </div>
  );
}