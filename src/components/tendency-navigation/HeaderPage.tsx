
import { Zap, ThermometerSun, Factory, Drill, type LucideIcon } from "lucide-react";

interface HeaderProps {
    site: string[],
    tab: string,
};

type TitleHeader = {
    icon: LucideIcon | undefined,
    title: string,
};

export default function HeaderPage({ site, tab }: HeaderProps) {
    const header: TitleHeader = {
        icon: undefined,
        title: ""
    };
    switch (tab) {
        case "generator":
            header.icon = Zap
            header.title = "Generador";
            break;
        case "motor":
            header.icon = Drill
            header.title = "Motor";
            break;
        case "active":
            header.icon = Factory
            header.title = "ACTIVOS";
            break;
        case "termo":
            header.icon = ThermometerSun
            header.title = "Termodicanicas";
            break;
        default:
    }
    return (
        <div className=" dark:bg-green-tenue bg-green-gray h-(--header-h) flex flex-row items-center justify-center gap-2 outline-none border-none">
            <div
                className="rounded-full bg-green-medium p-[4px] text-green-live"
            >
                {header.icon && <header.icon className="h-4 w-4" />}
            </div>
            <div className="font-bold text-green-dark uppercase text-md">
                {site[0]} - {site[1]}
            </div>
            <div className="uppercase text-primary dark:text-background">
                {header.title}
            </div>
        </div>
    )
}