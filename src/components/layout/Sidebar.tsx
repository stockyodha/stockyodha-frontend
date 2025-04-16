import { NavLink } from 'react-router-dom'; // Import NavLink
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    PanelLeftClose,
    PanelLeftOpen,
    LayoutDashboard,
    Briefcase,
    ListOrdered,
    Star,
    Settings, // Added for potential settings link
    Newspaper, // Added News icon
} from 'lucide-react'; // Added necessary icons

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    isMobile?: boolean; // Add isMobile prop
    onLinkClick?: () => void; // Add callback for link clicks (to close sheet)
    isCollapsed?: boolean; // Make isCollapsed an optional prop if we want desktop collapsing later
    onToggleCollapse?: () => void; // Callback for desktop collapse
}

export function Sidebar({ className, isMobile = false, onLinkClick, isCollapsed = false, onToggleCollapse }: SidebarProps) {
    const navItems = [
        { to: "/", label: "Dashboard", icon: LayoutDashboard },
        { to: "/portfolios", label: "Portfolios", icon: Briefcase },
        { to: "/orders", label: "Orders", icon: ListOrdered },
        { to: "/watchlists", label: "Watchlists", icon: Star },
        { to: "/news", label: "News", icon: Newspaper },
    ];

    return (
        <div
            className={cn(
                'h-full flex flex-col', // Use flex column layout
                isMobile ? 'w-full' : 'sticky top-0 h-screen border-r transition-all duration-300 ease-in-out', // Make desktop sidebar sticky
                isMobile ? '' : (isCollapsed ? 'w-16' : 'w-64'), // Desktop width
                className
            )}
        >
            <div className="flex h-full max-h-screen flex-col gap-2">
                {/* Top section with toggle */}
                <div className={cn(
                    "flex h-14 items-center border-b px-4", // Adjusted padding/margins
                    isCollapsed ? "justify-center" : "justify-between"
                )}>
                    {/* Show title only when not collapsed and not mobile */}
                    {!isCollapsed && !isMobile && <span className="font-semibold text-lg">VTrade</span>}

                    {/* Show VTrade title centered on mobile */}
                    {isMobile && <span className="font-semibold text-lg mx-auto">VTrade</span>}

                    {/* Show desktop toggle only when not mobile */}
                    {!isMobile && onToggleCollapse && (
                        <Button variant="ghost" size="icon" onClick={onToggleCollapse}>
                            {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
                            <span className="sr-only">Toggle sidebar</span>
                        </Button>
                    )}
                </div>

                {/* Navigation items */}
                <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto"> {/* Keep overflow */}
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end // Use end prop for the root dashboard link
                            onClick={isMobile ? onLinkClick : undefined} // Close sheet on mobile click
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                                    isCollapsed ? 'justify-center' : '',
                                    isActive && "bg-muted text-primary"
                                )
                            }
                        >
                            <item.icon className={cn("h-5 w-5", isCollapsed ? "" : "")} />
                            {!isCollapsed && <span>{item.label}</span>}
                            {isCollapsed && <span className="sr-only">{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom section (optional) */}
                <div className="mt-auto space-y-1 border-t p-2">
                    <NavLink
                        to="/settings" // Example settings route
                        end // Treat settings link similarly
                        onClick={isMobile ? onLinkClick : undefined} // Close sheet on mobile click
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                                isCollapsed ? 'justify-center' : '',
                                isActive && "bg-muted text-primary"
                            )
                        }
                    >
                        <Settings className={cn("h-5 w-5", isCollapsed ? "" : "")} />
                        {!isCollapsed && <span>Settings</span>}
                        {isCollapsed && <span className="sr-only">Settings</span>}
                    </NavLink>
                </div>
            </div>
        </div>
    );
} 