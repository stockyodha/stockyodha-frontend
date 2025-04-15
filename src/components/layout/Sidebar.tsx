import { useState } from 'react';
import { NavLink } from 'react-router-dom'; // Import NavLink
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    PanelLeftClose,
    PanelLeftOpen,
    LayoutDashboard,
    Briefcase,
    CandlestickChart,
    ListOrdered,
    Star,
    Settings, // Added for potential settings link
} from 'lucide-react'; // Added necessary icons

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    const navItems = [
        { to: "/", label: "Dashboard", icon: LayoutDashboard },
        { to: "/portfolios", label: "Portfolios", icon: Briefcase },
        { to: "/stocks", label: "Stocks", icon: CandlestickChart },
        { to: "/orders", label: "Orders", icon: ListOrdered },
        { to: "/watchlists", label: "Watchlists", icon: Star },
    ];

    return (
        <div
            className={cn(
                'relative hidden h-screen border-r transition-all duration-300 ease-in-out md:block', // Added relative, hidden, md:block
                isCollapsed ? 'w-16' : 'w-64',
                className
            )}
        >
            <div className="flex h-full max-h-screen flex-col gap-2">
                {/* Top section with toggle */}
                <div className={cn(
                    "flex h-14 items-center border-b px-4", // Adjusted padding/margins
                    isCollapsed ? "justify-center" : "justify-between"
                )}>
                    {!isCollapsed && <span className="font-semibold text-lg">VTrade</span>} {/* Example Title */}
                    <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                        {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
                        <span className="sr-only">Toggle sidebar</span>
                    </Button>
                </div>

                {/* Navigation items */}
                <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto"> {/* Added overflow */}
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end // Use end prop for the root dashboard link
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