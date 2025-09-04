import { StatusComponent, MetricsComponent, UpdateSubscription, TodayDataComponent } from '@/components/querys/test-query'

export default function MyPlot() {
  return (
    <div className="3d-model-section w-[80vw] h-[80vh]">
      {/* <h3>Modelo 3D del Motor</h3>
      <StatusComponent assetId='GEN-02' />
      <h3>Histórico</h3>
      <MetricsComponent
        assetId="GEN-00"
        start="2025-08-14T00:00:00Z"
        end="2025-08-20T00:00:00Z"
      /> */}

      <div className="3d-model-section w-[80vw] h-[80vh]">
        <h3 className='bg-blue-hover'>Data mediante "eventBridge", frecuencia minima 1minuto (FUNCIONAL, pero no tenemos data)</h3>
        <StatusComponent assetId='GEN-02' />
        {/* <UpdateSubscription /> */}
        <TodayDataComponent />
      </div>

    </div>
  );
}