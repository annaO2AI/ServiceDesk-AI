"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "../components/dashboard/Sidebar";
import { DashboardProvider } from "../context/DashboardContext";
import AiOpsChat from "./components/AiOpsChat"; // Import TalentAcquisition directly
import HeaderAISearch from "../chat-ui/components/Header";
import Breadcrumbs from "../components/dashboard/Breadcrumbs"; // Import Breadcrumbs component

export default function Aiops() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored !== null) setCollapsed(stored === "true");
  }, []);

  const toggleCollapse = () => {
    const newCollapsed = !collapsed;
    localStorage.setItem("sidebar-collapsed", String(newCollapsed));
    setCollapsed(newCollapsed);
  };

  const isSidebarExpanded = !collapsed || hovered;
  const sidebarWidth = isSidebarExpanded ? 256 : 64;

  // Show sidebar on the talent-acquisition page
  const showSidebar = pathname === "/aiops";

  return (
    <DashboardProvider>
      <div className="flex overflow-hidden mt-12">
        {showSidebar && (
          <Sidebar
            collapsed={collapsed}
            hovered={hovered}
            toggleSidebar={toggleCollapse}
            setHovered={setHovered}
          />
        )}
        <HeaderAISearch sidebarOpen={showSidebar && isSidebarExpanded} />
        <Breadcrumbs sidebarOpen={showSidebar && isSidebarExpanded} />
        <div
          className="flex flex-col flex-1 transition-all duration-300 ease-in-out"
          style={{ marginLeft: showSidebar ? sidebarWidth : 0 }}
        >
          
          <main>
            <AiOpsChat onSend={() => console.log("Message sent")} />
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}