import { NextResponse } from 'next/server';

type MenuItem = {
  id: number;
  label: string;
  icon: string;
  route?: string;
  subItems?: {
    id: number;
    label: string;
    route: string;
  }[];
};

export async function GET() {
  const menuItems: MenuItem[] = [
    { id: 1, label: "Home", icon: "FaHome", route: "/dashboard/" },
    { id: 2, label: "Projects", icon: "FaFolder", route: "/dashboard/projects" },
    { 
      id: 3, 
      label: "Alerts", 
      icon: "FaBell",
      subItems: [
        { id: 31, label: "Motor", route: "/dashboard/alerts/motor" },
        { id: 32, label: "Banco A1", route: "/dashboard/alerts/banco-a" },
        { id: 33, label: "Banco B1", route: "/dashboard/alerts/banco-b" },
        { id: 34, label: "Comparación", route: "/dashboard/alerts/comparacion" },
        { id: 35, label: "MotorNew", route: "/dashboard/alerts/motorNew" }
      ],
    },
    { id: 4, label: "Administrar", icon: "FaCog", route: "/dashboard/admin" },
  ];

  return NextResponse.json(menuItems);
}