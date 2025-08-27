
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"


import GeneratorComponent from "@/components/tendency-navigation/GeneratorComponent"
import MotorGridComponent from "@/components/tendency-navigation/MotorComponent"
import HealhtlyComponent  from "@/components/tendency-navigation/TermodinamicComponente"


import ActivosPage from "@/app/dashboard/activo/page"

import ButtonShape from "@/assets/boton.svg"

export default function TabsDemo() {
    console.log("botton:", ButtonShape)
    return (
        <div className="flex flex-col pt-2">
            <Tabs defaultValue="motor">
                <TabsList>
                    <TabsTrigger value="generator">Generator</TabsTrigger>
                    <TabsTrigger value="motor">Motor</TabsTrigger>
                    <TabsTrigger value="termo">Termodinamic</TabsTrigger>
                    <TabsTrigger value="active">Activo</TabsTrigger>
                </TabsList>
                <TabsContent value="generator" className=" bg-card">
                    <GeneratorComponent/>
                </TabsContent>
                <TabsContent value="motor" className=" bg-card">
                    <MotorGridComponent/>
                </TabsContent>
                <TabsContent value="termo" className=" bg-card">
                    <HealhtlyComponent/>
                </TabsContent>
                <TabsContent value="active" className=" bg-card">
                    <ActivosPage/>
                </TabsContent>
            </Tabs>
        </div>
    )
}
