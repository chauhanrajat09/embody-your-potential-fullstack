import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TodayWorkout from '@/components/dashboard/TodayWorkout';
import RecentActivity from '@/components/dashboard/RecentActivity';
import QuickStats from '@/components/dashboard/QuickStats';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import WorkoutLibrary from '@/components/workouts/WorkoutLibrary';
import ProgressChart from '@/components/progress/ProgressChart';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activePage="dashboard" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader username={user?.name || 'User'} />
        
        <div className="flex-1 overflow-y-auto p-6">
          <QuickStats />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <TodayWorkout />
            <RecentActivity />
          </div>
          
          <div className="mt-6">
            <WorkoutLibrary />
          </div>
          
          <div className="mt-6">
            <ProgressChart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
