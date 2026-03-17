"use client";

import { IoTTagsProvider } from "@/context/IoTTagsContext";
import DashboardGen01 from "@/components/componentsRealTimeGen01/DashboardGen01";

export default function RealTimeGen01Page() {
    return (
        <IoTTagsProvider>
            <DashboardGen01 />
        </IoTTagsProvider>
    );
}
