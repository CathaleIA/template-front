import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBars, FaUserCircle, FaHome, FaFolder, FaCog, FaSignOutAlt, FaBell, FaChevronDown, FaChevronRight } from "react-icons/fa";
import Image from "next/image";

type MenuItem = {
  id: number;
  label: string;
  route?: string;
  icon: string;
  subItems?: {
    id: number;
    label: string;
    route: string;
  }[];
};

type SubMenuState = {
  [key: number]: boolean;
};

export default function Sidebar() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [subMenuOpen, setSubMenuOpen] = useState<SubMenuState>({});
  const pathname = usePathname();

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch("/api/menu");
        const data: MenuItem[] = await response.json();
        setMenuItems(data);
        
        // Inicializar estado de submenús
        const initialState: SubMenuState = {};
        data.forEach(item => {
          if (item.subItems) {
            // Abrir submenú si la ruta actual coincide con algún subitem
            const shouldOpen = item.subItems.some(subItem => 
              pathname.startsWith(subItem.route)
            );
            initialState[item.id] = shouldOpen;
          }
        });
        setSubMenuOpen(initialState);
      } catch (error) {
        console.error("Error fetching menu items:", error);
      }
    };

    fetchMenuItems();
  }, [pathname]);

  const toggleSubMenu = (id: number) => {
    setSubMenuOpen(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const renderIcon = (iconName: string) => {
    const IconComponent = {
      FaHome,
      FaFolder,
      FaBell,
      FaCog
    }[iconName];
    
    return IconComponent ? <IconComponent className="text-xl" /> : null;
  };

  return (
    <div className={`${collapsed ? "w-16" : "w-64"} bg-background border-r border-primary h-screen fixed top-0 left-0 z-10 transition-all duration-300 flex flex-col shadow-xl`}>
      {/* Header (igual que antes) */}
      
      {/* Navigation section */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.route || 
              (item.subItems && item.subItems.some(subItem => pathname.startsWith(subItem.route)));
            
            return (
              <li key={item.id}>
                {item.subItems ? (
                  <>
                    <div
                      onClick={() => toggleSubMenu(item.id)}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-300
                        ${isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary/50"}
                      `}
                    >
                      <div className="flex items-center">
                        {renderIcon(item.icon)}
                        {!collapsed && <span className="ml-2 font-medium">{item.label}</span>}
                      </div>
                      {!collapsed && (
                        subMenuOpen[item.id] ? 
                          <FaChevronDown className="text-sm" /> : 
                          <FaChevronRight className="text-sm" />
                      )}
                    </div>
                    
                    {!collapsed && subMenuOpen[item.id] && (
                      <ul className="ml-6 mt-1 space-y-1">
                        {item.subItems.map(subItem => {
                          const isSubActive = pathname.startsWith(subItem.route);
                          return (
                            <li key={subItem.id}>
                              <Link href={subItem.route}>
                                <div
                                  className={`flex items-center p-2 rounded-lg transition-all duration-300
                                    ${isSubActive ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-secondary/30"}
                                  `}
                                >
                                  <span className="ml-2 text-sm">{subItem.label}</span>
                                </div>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link href={item.route || "#"}>
                    <div
                      className={`flex items-center p-2 rounded-lg transition-all duration-300
                        ${isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary/50"}
                      `}
                    >
                      {renderIcon(item.icon)}
                      {!collapsed && <span className="ml-2 font-medium">{item.label}</span>}
                    </div>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

 {/* Footer section */}
      <div className="p-2 border-t border-primary">
        {!collapsed ? (
          <>
            <div className="flex items-center mb-3">
              <div className="bg-primary rounded-full p-2 flex-shrink-0 shadow-md">
                <FaUserCircle className="text-xl text-primary-foreground" />
              </div>
              <div className="ml-2">
                <p className="font-medium text-sm text-foreground">
                  username
                </p>
                <p className="text-xs text-primary">Administrador</p>
              </div>
            </div>
            <div className="flex justify-center">
              <button
                className="flex items-center p-2 rounded-full bg-primary text-primary-foreground hover:bg-accent transition-all duration-300 shadow-md"
                title="Cerrar Sesión"
              >
                <FaSignOutAlt className="text-lg" />
                <span className="ml-2 font-medium text-sm hidden md:inline">Cerrar Sesión</span>
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <div className="bg-primary rounded-full p-2 flex-shrink-0 shadow-md">
              <FaUserCircle className="text-xl text-primary-foreground" />
            </div>
            <button
              className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-accent transition-all duration-300 shadow-md"
              title="Cerrar Sesión"
            >
              <FaSignOutAlt className="text-lg" />
            </button>
          </div>
        )}
      </div>	    </div>
  );
}