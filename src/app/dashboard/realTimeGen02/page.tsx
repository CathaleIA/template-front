"use client";

import { IoTTagsProvider } from "@/context/IoTTagsContext";
import DashboardGen02 from "@/components/componentsRealTimeGen02/DashboardGen02";

export default function RealTimeGen02Page() {
    return (
        <IoTTagsProvider>
            <DashboardGen02 />
        </IoTTagsProvider>
    );
}
