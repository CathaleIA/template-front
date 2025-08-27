
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

    return (
        <div className="[--tablist-height:89px] flex flex-col pt-2">
            <Tabs defaultValue="motor">
                <TabsList>
                    <TabsTrigger value="generator">Generator</TabsTrigger>
                    <TabsTrigger value="motor">Motor</TabsTrigger>
                    <TabsTrigger value="termo">Termodinamic</TabsTrigger>
                    <TabsTrigger value="active">Activo</TabsTrigger>
                </TabsList>
                <TabsContent value="generator" className="p-5 bg-card">
                    <GeneratorComponent/>
                </TabsContent>
                <TabsContent value="motor" className="p-5 bg-card">
                    <MotorGridComponent/>
                </TabsContent>
                <TabsContent value="termo" className="p-5 bg-card">
                    <HealhtlyComponent/>
                </TabsContent>
                <TabsContent value="active" className="p-5 bg-card">
                    <ActivosPage/>
                </TabsContent>
            </Tabs>
        </div>
    )
}
