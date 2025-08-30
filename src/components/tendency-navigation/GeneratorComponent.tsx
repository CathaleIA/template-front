import Gauge from "@/components/plotly/Gauge";
import Tendency from "@/components/plotly/Tendency";
import PolarPhaseAnglePlot from '@/components/plotly/Polar'

import { PowerFactorData  } from '@/utils/generatedata/gauge'
import { EnergyPowerData,PowerData } from "@/utils/generatedata/tendency";

const GeneratorComponent = () => {
    return (
        <div className="flex flex-col lg:grid lg:grid-cols-4 lg:grid-rows-4 gap-4 h-[calc(100svh-var(--header-height)-var(--tablist-height))]!">

            <div className="col-span-3 row-span-2">
                <div className='flex flex-col bg-background  h-full border'>
                    <div className='flex justify-center items-center w-[35%] h-[35px] pr-2 bg-green-dark rounded-br-full text-primary border-b-6 border-r-6 border-green-medium'>
                        <h1 className="text-xs font-semibold leading-none tracking-tight text-green-gray uppercase">
                            ENERGIA</h1>
                    </div>
                    <div className="flex-1 min-h-0">
                        <Tendency {...EnergyPowerData} />
                    </div>
                </div>
            </div>
            <div className="col-span-1 row-span-1">
                <div className='flex flex-col bg-background  h-full rounded-tr-2xl border'>
                    <div className='flex justify-center items-center w-[35%] h-[35px] pr-2 bg-green-dark rounded-br-full text-primary border-b-6 border-r-6 border-green-medium'>
                        <h1 className="text-xs font-semibold leading-none tracking-tight text-green-gray uppercase">
                            VOLTAJE</h1>
                    </div>
                    <div className="flex-1 min-h-0 text-primary px-2">
                        <div className="flex flex-row justify-between items-center h-full gap-2 pb-3">
                            {[
                                { name: "L1L2", voltage: "350" },
                                { name: "L2L3", voltage: "380" },
                                { name: "L3L1", voltage: "360" },
                            ].map((dev, index) => (
                                <div key={index} className="flex flex-col text-center w-full">
                                    <span className="text-[0.6rem]">Max: 500</span>
                                    <div
                                        key={dev.name}
                                        className="rounded-lg p-3 border-t-4 border-b-4 border-border flex flex-col items-center text-center justify-center px-0"
                                    >
                                        <h4 className="text-sm md:text-base font-medium mb-1">Fase {dev.name}</h4>
                                        <p className="text-md md:text-lg font-bold">{dev.voltage}°V</p>
                                        {/* <p className="text-xs md:text-sm text-muted-foreground"></p> */}
                                    </div>
                                    <span className="text-[0.6rem]">Min: 3200</span>
                                </div>

                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-span-1 row-span-3">
                <div className='flex flex-col bg-background  h-full w-full rounded-br-2xl border'>
                    <div className='flex justify-center items-center w-[35%] h-[35px] pr-2 bg-green-dark rounded-br-full text-primary border-b-6 border-r-6 border-green-medium'>
                        <h1 className="text-xs font-semibold leading-none tracking-tight text-green-gray uppercase">
                            ANGULOS</h1>
                    </div>
                    <div className="flex-1 min-h-0">
                        <PolarPhaseAnglePlot
                            angles={{ l1l2: 140, l2l3: 100, l3l1: 120 }}
                            title="Ángulos de Fase del Sistema"
                            referenceAngle={120}
                        />
                    </div>
                </div>
            </div>
            <div className="col-span-1 row-span-2">
                <div className='flex flex-col bg-background  h-full rounded-bl-2xl border'>
                    <div className='flex justify-center items-center w-[55%] h-[35px] pr-2 bg-green-dark rounded-br-full text-primary border-b-6 border-r-6 border-green-medium'>
                        <h1 className="text-xs font-semibold leading-none tracking-tight text-green-gray uppercase">
                            FACT. DE POTENCIA</h1>
                    </div>
                    <div className="flex-1 min-h-0 w-full">
                        <Gauge {...PowerFactorData} />
                    </div>
                </div>
            </div>
            <div className="col-span-2 row-span-2">
                <div className='flex flex-col bg-background  h-full border'>
                    <div className='flex justify-center items-center w-[35%] h-[35px] pr-2 bg-green-dark rounded-br-full text-primary border-b-6 border-r-6 border-green-medium'>
                        <h1 className="text-xs font-semibold leading-none tracking-tight text-green-gray uppercase">
                            POTENCIA</h1>
                    </div>
                    <div className="flex-1 min-h-0">
                        <Tendency {...PowerData} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default GeneratorComponent;