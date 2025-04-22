import React from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  activePage: 'dashboard' | 'workouts' | 'exercises' | 'progress' | 'profile' | 'settings' | 'weight';
}

const Layout: React.FC<LayoutProps> = ({ children, activePage }) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar activePage={activePage} />
      <main className="flex-1 bg-background">
        {children}
      </main>
    </div>
  );
};

export default Layout; 