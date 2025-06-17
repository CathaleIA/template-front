import { NextResponse } from 'next/server';

type MenuItem = {
  id: number;
  label: string;
  icon: string;
  route: string;
};

export async function GET() {
  const menuItems: MenuItem[] = [
    { id: 1, label: "Snowflake", icon: "FaHome", route: "/dashboard/" },
    { id: 5, label: "Reports", icon: "FaFileSignature", route: "/dashboard/reports"},
    { id: 3, label: "Alerts", icon: "FaBell", route: "/dashboard/alerts" },
    { id: 4, label: "Administrar", icon: "FaCog", route: "/dashboard/admin"},
  ];

  return NextResponse.json(menuItems);
}