"use client";

import { IoTTagsProvider } from "@/context/IoTTagsContext";
import DashboardGen04 from "@/components/componentsRealTimeGen04/DashboardGen04";

export default function RealTimeGen04Page() {
    return (
        <IoTTagsProvider>
            <DashboardGen04 />
        </IoTTagsProvider>
    );
}
