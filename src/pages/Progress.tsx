import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ProgressChart from '@/components/progress/ProgressChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, TrendingUp, Medal, Trophy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AchievementProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  date: string;
  completed?: boolean;
}

const Achievement: React.FC<AchievementProps> = ({ 
  title, description, icon, date, completed = true 
}) => {
  return (
    <div className={`flex items-center p-4 border rounded-lg ${completed ? 'bg-white' : 'bg-gray-50 opacity-75'}`}>
      <div className={`p-3 rounded-full mr-4 ${completed ? 'bg-empowerfit-purple/10' : 'bg-gray-200'}`}>
        {icon}
      </div>
      <div className="flex-1">
        <h3 className={`font-medium ${!completed && 'text-gray-500'}`}>{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      {completed ? (
        <span className="text-xs text-gray-500">{date}</span>
      ) : (
        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">In Progress</span>
      )}
    </div>
  );
};

const Progress: React.FC = () => {
  const { user } = useAuth();
  
  const achievements = [
    {
      title: "First Workout Complete",
      description: "Completed your first workout session",
      icon: <Award className="h-6 w-6 text-empowerfit-purple" />,
      date: "Mar 15, 2025",
      completed: true
    },
    {
      title: "10 Workout Milestone",
      description: "Completed 10 workout sessions",
      icon: <Medal className="h-6 w-6 text-empowerfit-purple" />,
      date: "Apr 2, 2025",
      completed: true
    },
    {
      title: "Strength Improver",
      description: "Increased strength by 20% in a major lift",
      icon: <TrendingUp className="h-6 w-6 text-empowerfit-purple" />,
      date: "Apr 9, 2025",
      completed: true
    },
    {
      title: "Consistency King",
      description: "Workout out 3+ times per week for a month",
      icon: <Trophy className="h-6 w-6 text-gray-400" />,
      date: "",
      completed: false
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activePage="progress" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader username={user?.name || 'User'} />
        
        <div className="flex-1 overflow-y-auto p-6">
          <h1 className="text-2xl font-bold mb-6">Progress Tracking</h1>
          
          <ProgressChart />
          
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Records</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg border">
                    <h3 className="text-sm text-gray-500">Squat</h3>
                    <div className="flex items-end mt-1">
                      <span className="text-2xl font-bold">100 kg</span>
                      <span className="text-xs text-green-500 ml-2 mb-1">+5kg</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">April 6, 2025</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <h3 className="text-sm text-gray-500">Bench Press</h3>
                    <div className="flex items-end mt-1">
                      <span className="text-2xl font-bold">75 kg</span>
                      <span className="text-xs text-green-500 ml-2 mb-1">+2.5kg</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">April 8, 2025</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <h3 className="text-sm text-gray-500">Deadlift</h3>
                    <div className="flex items-end mt-1">
                      <span className="text-2xl font-bold">140 kg</span>
                      <span className="text-xs text-green-500 ml-2 mb-1">+10kg</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">April 10, 2025</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6">
            <Tabs defaultValue="achievements">
              <TabsList>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
                <TabsTrigger value="measurements">Measurements</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="achievements" className="mt-4">
                <div className="space-y-3">
                  {achievements.map((achievement, index) => (
                    <Achievement key={index} {...achievement} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="measurements">
                <div className="bg-white p-6 rounded-xl mt-4 text-center">
                  <p className="text-gray-500">Measurements tracking coming soon!</p>
                </div>
              </TabsContent>
              
              <TabsContent value="history">
                <div className="bg-white p-6 rounded-xl mt-4 text-center">
                  <p className="text-gray-500">Workout history will appear here</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;
