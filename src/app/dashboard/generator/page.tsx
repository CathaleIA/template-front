import Gauge from "@/components/plotly/Gauge";
import Tendency from "@/components/plotly/Tendency";
import PolarPhaseAnglePlot from '@/components/plotly/Polar'

import { PowerFactorData  } from '@/utils/generatedata/gauge'
import { EnergyPowerData,PowerData } from "@/utils/generatedata/tendency";


export default function Generator() {
    return (
        <div className="flex flex-col lg:grid lg:grid-cols-4 lg:grid-rows-4 gap-3 h-[calc(100svh-var(--header-height))]! p-3 ">

            <div className="col-span-3 row-span-2">
                <div className='flex flex-col bg-card shadow-2xl h-full'>
                    <div className='flex justify-center items-center bg-card w-[35%] h-[35px] pr-2 rounded-br-full text-primary border-b-6 border-r-6 border-background'>
                        <h1 className="text-sm font-semibold leading-none tracking-tight text-muted-foreground uppercase">
                            ENERGIA</h1>
                    </div>
                    <div className="flex-1 min-h-0">
                        <Tendency {...EnergyPowerData} />
                    </div>
                </div>
            </div>
            <div className="col-span-1 row-span-1">
                <div className='flex flex-col bg-card shadow-2xl h-full'>
                    <div className='flex justify-center items-center bg-card w-[35%] h-[35px] pr-2 rounded-br-full text-primary border-b-6 border-r-6 border-background'>
                        <h1 className="text-sm font-semibold leading-none tracking-tight text-muted-foreground uppercase">
                            VOLTAJE</h1>
                    </div>
                    <div className="flex-1 min-h-0 p-3">
                        <div className="flex flex-row justify-between items-center gap-2 h-full">
                            {[
                                { name: "L1-L2", voltage: "350" },
                                { name: "L2-L3", voltage: "380" },
                                { name: "L3-L1", voltage: "360" },
                            ].map((dev, index) => (
                                <div key={index} className="flex flex-col text-center w-full">
                                    <span className="text-[0.7rem]">Max: 500</span>
                                    <div
                                        key={dev.name}
                                        className="rounded-lg p-3 border-t-4 border-b-4 border-border flex flex-col items-center text-center justify-center px-0"
                                    >
                                        <h4 className="text-sm md:text-base font-medium text-foreground mb-1">Fase {dev.name}</h4>
                                        <p className="text-xl md:text-2xl font-bold text-foreground">{dev.voltage}</p>
                                        <p className="text-xs md:text-sm text-muted-foreground">°V</p>
                                    </div>
                                    <span className="text-[0.7rem]">Min: 3200</span>
                                </div>

                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-span-1 row-span-3">
                <div className='flex flex-col bg-card shadow-2xl h-full w-full'>
                    <div className='flex justify-center items-center bg-card w-[35%] h-[35px] pr-2 rounded-br-full text-primary border-b-6 border-r-6 border-background'>
                        <h1 className="text-sm font-semibold leading-none tracking-tight text-muted-foreground uppercase">
                            ANGULOS</h1>
                    </div>
                    <div className="flex-1 min-h-0">
                        <PolarPhaseAnglePlot
                            angles={{ l1l2: 130, l2l3: 110, l3l1: 120 }}
                            title="Ángulos de Fase del Sistema"
                            referenceAngle={120}
                        />
                    </div>
                </div>
            </div>
            <div className="col-span-1 row-span-2">
                <div className='flex flex-col bg-card shadow-2xl h-full'>
                    <div className='flex justify-center items-center bg-card w-[55%] h-[35px] pr-2 rounded-br-full text-primary border-b-6 border-r-6 border-background'>
                        <h1 className="text-sm font-semibold leading-none tracking-tight text-muted-foreground uppercase">
                            FACT. DE POTENCIA</h1>
                    </div>
                    <div className="flex-1 min-h-0 w-full">
                        <Gauge {...PowerFactorData} />
                    </div>
                </div>
            </div>
            <div className="col-span-2 row-span-2">
                <div className='flex flex-col bg-card shadow-2xl h-full'>
                    <div className='flex justify-center items-center bg-card w-[35%] h-[35px] pr-2 rounded-br-full text-primary border-b-6 border-r-6 border-background'>
                        <h1 className="text-sm font-semibold leading-none tracking-tight text-muted-foreground uppercase">
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