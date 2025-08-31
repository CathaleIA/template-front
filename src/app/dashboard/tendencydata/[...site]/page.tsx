'use client'

import { use } from 'react'

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

import GeneratorComponent from "@/components/tendency-navigation/GeneratorComponent"
import MotorGridComponent from "@/components/tendency-navigation/MotorComponent"
import HealhtlyComponent from "@/components/tendency-navigation/TermodinamicComponente"
import HeaderPage from "@/components/tendency-navigation/HeaderPage"

import ActivosPage from "@/app/dashboard/activo/page"
import { useState } from "react"


export default function TendencySite({
    params,
}: {
    params: Promise<{ site: string[] }>
}) {
    const { site } = use(params);
    const [activeTab, setactiveTab] = useState('motor');
    return (
        <div className="[--tablist-height:89px] flex flex-col pt-2">
            <Tabs defaultValue="motor" onValueChange={setactiveTab}>
                <TabsList>
                    <TabsTrigger value="generator">Generator</TabsTrigger>
                    <TabsTrigger value="motor">Motor</TabsTrigger>
                    <TabsTrigger value="termo">Termodinamic</TabsTrigger>
                    <TabsTrigger value="active">Activo</TabsTrigger>
                </TabsList>
                <HeaderPage site={site} tab={activeTab} />
                <TabsContent value="generator" className="p-5 bg-card">
                    <GeneratorComponent />
                </TabsContent>
                <TabsContent value="motor" className="p-5 bg-card">
                    <MotorGridComponent />
                </TabsContent>
                <TabsContent value="termo" className="p-5 bg-card">
                    <HealhtlyComponent />
                </TabsContent>
                <TabsContent value="active" className="p-5 bg-card">
                    <ActivosPage />
                </TabsContent>
            </Tabs>
        </div>
    )
}



