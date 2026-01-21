//Sidebar.tsx
import {
  HomeIcon,
  BarChart2Icon,
  SettingsIcon,
} from "lucide-react";
import clsx from "clsx";
import { useState } from "react";
import { Rightarrow, Leftarrow, HrIcon, ArroTabIcon, LegalSearchIcon, AiIcon, AiOps } from "../../chat-ui/components/icons";

// Define navigation items (unused, kept for reference)
const navItems = [
  { label: "Home", icon: HomeIcon, href: "#" },
  { label: "Reports", icon: BarChart2Icon, href: "#" },
  { label: "Settings", icon: SettingsIcon, href: "#" },
];

// Define menu items for dropdowns
const menuItems = [
  {
    id: "aiSearch",
    label: "AI Search",
    icon: AiIcon,
    subItems: [
      { label: "Talent Acquisition", href: "/talent-acquisition", icon: ArroTabIcon },
      {
        label: "Document Search", href: "/document-search",
        icon: ArroTabIcon,
        subItems: [
          //  {
          //   label: "Document Search",
          //   href: "/procurement-search",
          //   icon: ArroTabIcon,
          //   subItems: [
          //     { label: "MSA Details", href: "/procurement-search/master-service-agreement/details", icon: ArroTabIcon },
          //     { label: "MSA Terms", href: "/procurement-search/master-service-agreement/terms", icon: ArroTabIcon },
          //   ],
          // },
          // {
          //   label: "Generate Service Agreements",
          //   href: "/procurement-search/master-service-agreement",
          //   icon: ArroTabIcon,
          //   subItems: [
          //     { label: "MSA Details", href: "/procurement-search/master-service-agreement/details", icon: ArroTabIcon },
          //     { label: "MSA Terms", href: "/procurement-search/master-service-agreement/terms", icon: ArroTabIcon },
          //   ],
          // },
          // {
          //   label: "3.	Generate SOW & BAA",
          //   href: "/procurement-search/contract-agreement",
          //   icon: ArroTabIcon,
          //   subItems: [
          //     { label: "Contract Details", href: "/procurement-search/contract-agreement/details", icon: ArroTabIcon },
          //     { label: "Contract Terms", href: "/procurement-search/contract-agreement/terms", icon: ArroTabIcon },
          //   ],
          // },

          // { label: "Document Search", href: "/document-search", icon: ArroTabIcon },
          { label: "Generate Service Agreements", href: "/document-search/service-agreement", icon: ArroTabIcon },
          { label: "Generate SOW & BAA", href: "/document-search/generate-SOW-&-BAA", icon: ArroTabIcon },
          { label: "Analyze RFP", href: "/document-search/analyze-rfp", icon: ArroTabIcon },
          { label: "Analyze SOW", href: "/document-search/analyze-sow", icon: ArroTabIcon },
        ],
      },
      { label: "Finance Search", href: "/", icon: ArroTabIcon },
      { label: "Legal Search", href: "/", icon: ArroTabIcon },
    ],
  },
  {
    id: "humanResources",
    label: "Employee Enablement",
    icon: HrIcon,
    subItems: [
      { label: "HR Compensation & Benefits", href: "/human-resources", icon: ArroTabIcon },
      { label: "Finance Analysis", href: "/", icon: ArroTabIcon },
      { label: "Legal Analysis", href: "/", icon: ArroTabIcon },
    ],
  },
];

type SidebarProps = {
  collapsed: boolean;
  hovered: boolean;
  toggleSidebar: () => void;
  setHovered: (hovered: boolean) => void;
};

export default function Sidebar({
  collapsed,
  hovered,
  toggleSidebar,
  setHovered,
}: SidebarProps) {
  const isExpanded = !collapsed;
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const toggleMenu = (menuId: string) => {
    setOpenMenu(openMenu === menuId ? null : menuId);
    // No toggleSidebar call here to prevent collapsing on main menu click
  };

  const handleSubItemClick = () => {
    // Collapse sidebar only if it's expanded
    // if (isExpanded) {
    //   toggleSidebar();
    // }
  };

  return (
    <aside
      className={clsx(
        "h-screen fixed top-0 left-0 bg-white border-r shadow transition-all duration-300 z-40 ease-in-out",
        isExpanded ? "w-64" : "w-16"
      )}
    >
      <div className="flex justify-end p-3">
        <button
          onClick={toggleSidebar}
          className="text-gray-600 hover:text-gray-900 main-toggleSidebar"
        >
          {isExpanded ? <Rightarrow /> : <Leftarrow />}
        </button>
      </div>
      <div className="w-full h-screen text-gray-800 flex flex-col main-width-manu">
        {/* Render Menu Items with Submenus */}
        {menuItems.map((menu) => (
          <div key={menu.id} className="text-left">
            <button
              onClick={() => toggleMenu(menu.id)}
              className="w-full px-4 py-5 flex items-center justify-between hover:bg-gray-200 transition-colors"
            >
              <div className="flex items-center text-left gap-3">
                {isExpanded ? (
                  <>
                    <menu.icon width={20} className="min-w-[20px]" /> {menu.label}
                  </>
                ) : (
                  <menu.icon width={20} className="min-w-[20px]" />
                )}
              </div>
              {isExpanded && (
                <svg
                  className={`w-4 h-4 transition-transform ${
                    openMenu === menu.id ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              )}
            </button>
            <div
              className={clsx(
                "overflow-hidden transition-all duration-300",
                openMenu === menu.id ? "max-h-70" : "max-h-0"
              )}
            >
              {menu.subItems.map((subItem) => (
                <div key={subItem.label}>
                  <a
                    href={subItem.href}
                    onClick={handleSubItemClick}
                    className="flex block px-4 py-4 hover:bg-gray-200 gap-3 bg-gray-100 min-w-[20px]"
                  >
                    {isExpanded ? (
                      <>
                        <subItem.icon width={20} className="min-w-[20px]" /> {subItem.label}
                      </>
                    ) : (
                      <subItem.icon width={20} className="min-w-[20px]" />
                    )}
                  </a>
                  {/* Render nested subitems for Procurement Search */}
                  {subItem.subItems && openMenu === menu.id && (
                    <div
                      className={clsx(
                        "overflow-hidden transition-all duration-300",
                        openMenu === menu.id ? "max-h-80" : "max-h-0"
                      )}
                    >
                      {subItem.subItems.map((nestedItem) => (
                        <div key={nestedItem.label}>
                          <a
                            href={nestedItem.href}
                            onClick={handleSubItemClick}
                            className="flex block px-6 py-4 hover:bg-gray-200 gap-3 bg-gray-50 min-w-[20px]"
                          >
                            {isExpanded ? (
                              <>
                                <nestedItem.icon width={20} className="min-w-[20px]" /> {nestedItem.label}
                              </>
                            ) : (
                              <nestedItem.icon width={20} className="min-w-[20px]" />
                            )}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        {/* Static Menu Item */}
        <a
          href="/aiops"
          onClick={handleSubItemClick}
          className="px-4 py-5 flex items-center hover:bg-gray-200 transition-colors gap-3 min-w-[20px]"
        >
          {isExpanded ? (
            <>
              <AiOps width={20} /> AIOps
            </>
          ) : (
            <AiOps width={20} />
          )}
        </a>
      </div>
    </aside>
  );
}