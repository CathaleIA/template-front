'use client'

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

import GeneratorComponent from "@/components/tendency-navigation/GeneratorComponent"
import MotorGridComponent from "@/components/tendency-navigation/MotorComponent"
import HealhtlyComponent from "@/components/tendency-navigation/TermodinamicComponente"

import ActivosPage from "@/app/dashboard/activo/page"
import { useState } from "react"

export default function TabsDemo() {
    const [activeTab, setactiveTab]  =useState('motor');
    return (
        <div className="[--tablist-height:89px] flex flex-col pt-2">
            MAPA O CROQUIZ DE LOS SISTEMAS EN GENERAL DEL CLIENTE
        </div>
    )
}
