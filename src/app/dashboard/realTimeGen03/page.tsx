"use client";

import { IoTTagsProvider } from "@/context/IoTTagsContext";
import DashboardGen03 from "@/components/componentsRealTimeGen03/DashboardGen03";

export default function RealTimeGen03Page() {
    return (
        <IoTTagsProvider>
            <DashboardGen03 />
        </IoTTagsProvider>
    );
}
