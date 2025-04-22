import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Dumbbell, 
  BarChart2, 
  User, 
  Settings,
  LogOut,
  Scale,
  MenuSquare,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';

interface SidebarProps {
  activePage: 'dashboard' | 'workouts' | 'exercises' | 'progress' | 'profile' | 'settings' | 'weight';
}

const Sidebar: React.FC<SidebarProps> = ({ activePage }) => {
  const isMobile = useIsMobile();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  
  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate('/auth');
  };
  
  const toggleTheme = () => {
    // Cycle through themes: light -> dark -> oled -> light
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('oled');
    else setTheme('light');
  };
  
  // Theme icon based on current theme
  const ThemeIcon = () => {
    switch (theme) {
      case 'dark': return <Moon className="h-5 w-5" />;
      case 'oled': return <Monitor className="h-5 w-5" />;
      default: return <Sun className="h-5 w-5" />;
    }
  };
  
  const navItems = [
    {
      name: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: '/dashboard',
      active: activePage === 'dashboard',
    },
    {
      name: 'Workouts',
      icon: <Dumbbell className="h-5 w-5" />,
      href: '/workouts',
      active: activePage === 'workouts',
    },
    {
      name: 'Exercises',
      icon: <MenuSquare className="h-5 w-5" />,
      href: '/exercises',
      active: activePage === 'exercises',
    },
    {
      name: 'Weight',
      icon: <Scale className="h-5 w-5" />,
      href: '/weight',
      active: activePage === 'weight',
    },
    {
      name: 'Progress',
      icon: <BarChart2 className="h-5 w-5" />,
      href: '/progress',
      active: activePage === 'progress',
    },
    {
      name: 'Profile',
      icon: <User className="h-5 w-5" />,
      href: '/profile',
      active: activePage === 'profile',
    },
    {
      name: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      href: '/settings',
      active: activePage === 'settings',
    },
  ];

  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-50">
        <div className="flex justify-around p-2">
          {navItems.slice(0, 5).map((item) => (
            <Link 
              key={item.name} 
              to={item.href}
              className={cn(
                "flex flex-col items-center py-1 px-3 rounded-md text-xs",
                item.active ? "text-empowerfit-purple" : "text-gray-500"
              )}
            >
              {item.icon}
              <span className="mt-1">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen bg-sidebar flex flex-col text-sidebar-foreground ${isMobile ? 'w-[70px]' : 'w-[240px]'} p-4 transition-all duration-300`}>
      <div className="flex items-center justify-center mb-8">
        {!isMobile ? (
          <h1 className="text-xl font-bold">EmpowerFit</h1>
        ) : (
          <div className="w-8 h-8 bg-sidebar-primary rounded-full" />
        )}
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.href}
                className={cn(
                  "flex items-center p-2 rounded-md transition-colors",
                  item.active 
                    ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <span className="mr-3">{item.icon}</span>
                {!isMobile && <span>{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="pt-4 mt-auto border-t border-sidebar-border space-y-2">
        <Button 
          variant="ghost" 
          className="w-full justify-start hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={toggleTheme}
        >
          <span className="mr-3"><ThemeIcon /></span>
          {!isMobile && <span>Theme: {theme}</span>}
        </Button>
        
        <Button 
          variant="ghost" 
          className="w-full justify-start hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={handleLogout}
        >
          <span className="mr-3"><LogOut className="h-5 w-5" /></span>
          {!isMobile && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
