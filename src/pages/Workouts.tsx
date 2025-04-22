import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Dumbbell, Clock, Users, ArrowRight, Calendar, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/api';

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  intensity?: string;
  rest?: string;
  notes?: string;
  video_url?: string;
}

interface WorkoutDay {
  day_number: number;
  muscle_groups: string[];
  exercises: Exercise[];
  notes?: string;
}

interface WorkoutPlan {
  _id: string;
  plan_name: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  focus: {
    strength: boolean;
    hypertrophy: boolean;
    endurance: boolean;
    mobility: boolean;
  };
  tags: string[];
  user: string; // User ID reference
  created_at: string;
  updated_at: string;
  days: WorkoutDay[];
}

interface WorkoutPlanCardProps {
  workoutPlan: WorkoutPlan;
}

const WorkoutPlanCard: React.FC<WorkoutPlanCardProps> = ({ workoutPlan }) => {
  // Calculate total number of exercises across all days
  const totalExercises = workoutPlan.days.reduce(
    (total, day) => total + day.exercises.length, 
    0
  );
  
  return (
    <Card className="overflow-hidden card-hover">
      <div 
        className="h-40 bg-gradient-to-br from-empowerfit-purple-light to-empowerfit-blue flex items-center justify-center"
      >
        <Dumbbell className="h-16 w-16 text-white opacity-75" />
      </div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle>{workoutPlan.plan_name}</CardTitle>
          <Badge variant={
            workoutPlan.difficulty === 'Beginner' ? 'outline' : 
            workoutPlan.difficulty === 'Intermediate' ? 'default' : 
            'destructive'
          }>
            {workoutPlan.difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-0">
        <div className="flex text-sm text-gray-500">
          <div className="flex items-center">
            <Dumbbell className="h-4 w-4 mr-1" />
            <span>{totalExercises} exercises</span>
          </div>
          <div className="mx-3">•</div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{workoutPlan.duration}</span>
          </div>
        </div>
        {workoutPlan.description && (
          <p className="text-sm text-gray-500 mt-2 line-clamp-2">{workoutPlan.description}</p>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-4">
        <div className="flex items-center text-xs text-gray-500">
          {workoutPlan.tags.length > 0 && (
            <span>{workoutPlan.tags.join(', ')}</span>
          )}
        </div>
        <Button variant="ghost" size="sm" className="text-empowerfit-purple">
          <span className="mr-1">Use</span>
          <ArrowRight className="h-3 w-3" />
        </Button>
      </CardFooter>
    </Card>
  );
};

const Workouts: React.FC = () => {
  const { user } = useAuth();
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [userWorkoutPlans, setUserWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchWorkoutPlans = async () => {
      try {
        setLoading(true);
        // Use the apiRequest utility that already handles tokens
        const data = await apiRequest('/workout-templates');
        setWorkoutPlans(data);
        
        // Filter for user-created templates
        if (user?.id) {
          setUserWorkoutPlans(data.filter((plan: WorkoutPlan) => 
            plan.user === user.id
          ));
        }
      } catch (err) {
        console.error('Error fetching workout plans:', err);
        setError('Failed to load workout plans');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchWorkoutPlans();
    }
  }, [user]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activePage="workouts" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader username={user?.name || 'User'} />
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Workouts</h1>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" /> Schedule
              </Button>
              <Button className="gradient-purple">
                <Plus className="mr-2 h-4 w-4" /> Create Workout
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="templates">
            <TabsList className="mb-6">
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="my-workouts">My Workouts</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
            </TabsList>
            
            <TabsContent value="templates">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-empowerfit-purple" />
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-500">{error}</p>
                </div>
              ) : workoutPlans.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {workoutPlans.map((plan) => (
                    <WorkoutPlanCard key={plan._id} workoutPlan={plan} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No workout templates available</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="my-workouts">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-empowerfit-purple" />
                </div>
              ) : userWorkoutPlans.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userWorkoutPlans.map((plan) => (
                    <WorkoutPlanCard key={plan._id} workoutPlan={plan} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl p-8 text-center">
                  <Dumbbell className="h-12 w-12 text-empowerfit-purple mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-bold mb-2">Create Your First Workout</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Start by creating a custom workout routine tailored to your fitness goals.
                  </p>
                  <Button className="gradient-purple">
                    <Plus className="mr-2 h-4 w-4" /> Create Workout
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="recent">
              <div className="text-center py-12">
                <p className="text-gray-500">No recent workouts found</p>
              </div>
            </TabsContent>
            
            <TabsContent value="favorites">
              <div className="text-center py-12">
                <p className="text-gray-500">No favorite workouts found</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Workouts;
