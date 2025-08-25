import { AppWindowIcon, CodeIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

import  MotorGrid  from "@/app/dashboard/motor/page"
import Healhtly from "@/app/dashboard/termodinamic/page"
import Generator from "@/app/dashboard/generator/page"

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
                    <Generator/>
                </TabsContent>
                <TabsContent value="motor" className=" bg-card">
                    <MotorGrid/>
                </TabsContent>
                <TabsContent value="termo" className=" bg-card">
                    <Healhtly/>
                </TabsContent>
                <TabsContent value="active" className=" bg-card">
                    <ActivosPage/>
                </TabsContent>
            </Tabs>
        </div>
    )
}
