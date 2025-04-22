import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell, User, Search, LogOut, Settings, UserCircle } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { getUserAvatar } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

interface DashboardHeaderProps {
  username: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ username }) => {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const avatarUrl = getUserAvatar(user);
  
  const handleLogout = () => {
    logout();
    navigate('/auth');
  };
  
  const handleProfileClick = () => {
    navigate('/profile');
  };
  
  const handleSettingsClick = () => {
    navigate('/settings');
  };
  
  return (
    <header className="flex items-center justify-between p-4 border-b dark:border-gray-700">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold gradient-purple gradient-text mr-2">
          EmpowerFit
        </h1>
      </div>
      
      <div className="relative w-full max-w-sm mx-6 hidden md:block">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input 
          type="text" 
          placeholder="Search exercises, workouts..."
          className="w-full pl-10 pr-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-empowerfit-purple-light bg-background dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
        />
      </div>
      
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center space-x-2 cursor-pointer">
              <Avatar className="h-9 w-9 border-2 border-empowerfit-purple-light hover:border-empowerfit-purple transition-colors duration-200">
                <AvatarImage src={avatarUrl} alt={username} />
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              
              <div className="hidden md:block">
                <p className="text-sm font-medium dark:text-gray-200">Hi, {username}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.discord ? 'Discord Member' : 'Premium Member'}
                </p>
              </div>
            </div>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center p-2">
              <Avatar className="h-10 w-10 mr-2">
                <AvatarImage src={avatarUrl} alt={username} />
                <AvatarFallback><User className="h-6 w-6" /></AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{username}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            
            <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
              <UserCircle className="mr-2 h-4 w-4" />
              <span>My Profile</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={handleSettingsClick} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 focus:text-red-500">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DashboardHeader;
