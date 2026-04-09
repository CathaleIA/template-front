"use client";

import { IoTTagsProvider } from "@/context/IoTTagsContext";
import DashboardGen05 from "@/components/componentsRealTimeGen05/DashboardGen05";

export default function RealTimeGen05Page() {
    return (
        <IoTTagsProvider>
            <DashboardGen05 />
        </IoTTagsProvider>
    );
}
