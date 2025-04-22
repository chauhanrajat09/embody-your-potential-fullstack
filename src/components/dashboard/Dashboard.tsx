import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { statsAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Dumbbell, Clock, Calendar, Activity, PlusCircle, BarChart2 } from 'lucide-react';
import { format } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface WorkoutStats {
  workoutsThisMonth: number;
  avgWorkoutDuration: number;
  weeklyActivity: Array<{
    _id: number;
    count: number;
  }>;
  totalWeightLifted: number;
  recentWorkouts: Array<any>;
  message?: string;
}

const Dashboard: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [stats, setStats] = useState<WorkoutStats>({
    workoutsThisMonth: 0,
    avgWorkoutDuration: 0,
    weeklyActivity: [],
    totalWeightLifted: 0,
    recentWorkouts: []
  });

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await statsAPI.getDashboardStats();
      setStats(data);
      
      // Check if we have any meaningful data
      const hasWorkoutData = 
        data.workoutsThisMonth > 0 || 
        data.avgWorkoutDuration > 0 || 
        data.totalWeightLifted > 0 || 
        (data.recentWorkouts && data.recentWorkouts.length > 0);
      
      setHasData(hasWorkoutData);
      
      if (!hasWorkoutData && data.message) {
        toast({
          title: "No workout data",
          description: data.message,
        });
      }
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard statistics: ' + (error.message || 'Unknown error'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, [toast]);

  // Load sample data for demonstration
  const loadSampleData = () => {
    const sampleData: WorkoutStats = {
      workoutsThisMonth: 12,
      avgWorkoutDuration: 3600, // 1 hour in seconds
      weeklyActivity: [
        { _id: 1, count: 2 }, // Sunday
        { _id: 2, count: 3 }, // Monday
        { _id: 3, count: 1 }, // Tuesday
        { _id: 4, count: 2 }, // Wednesday
        { _id: 5, count: 3 }, // Thursday
        { _id: 6, count: 1 }, // Friday
        { _id: 7, count: 0 }  // Saturday
      ],
      totalWeightLifted: 15000,
      recentWorkouts: Array(5).fill(0).map((_, i) => ({
        _id: `sample-${i}`,
        startTime: new Date(Date.now() - i * 86400000), // Each day before
        exercise: { name: `Sample Exercise ${i+1}` },
        sets: Array(4).fill({ weight: 40, reps: 10 })
      }))
    };
    setStats(sampleData);
    setHasData(true);
    toast({
      title: "Sample data loaded",
      description: "This is demo data for visualization purposes only.",
    });
  };

  // Format weekly activity data for chart
  const weeklyActivityData = Array(7).fill(0).map((_, index) => {
    const dayOfWeek = index + 1; // 1 (Sunday) to 7 (Saturday)
    const activityForDay = stats.weeklyActivity.find(d => d._id === dayOfWeek);
    
    return {
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index],
      workouts: activityForDay ? activityForDay.count : 0
    };
  });

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  // Prepare progress data for the line chart
  const progressData = stats.recentWorkouts.map((workout, i) => {
    let volume = 0;
    if (workout.sets && Array.isArray(workout.sets)) {
      volume = workout.sets.reduce((sum: number, set: any) => {
        const weight = parseFloat(set.weight) || 0;
        const reps = parseInt(set.reps) || 0;
        return sum + (weight * reps);
      }, 0);
    }
    
    return {
      date: workout.startTime ? format(new Date(workout.startTime), 'MMM d') : `Workout ${i+1}`,
      volume
    };
  }).reverse();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="space-y-6">
        <Alert>
          <Activity className="h-4 w-4" />
          <AlertTitle>No workout data found</AlertTitle>
          <AlertDescription>
            Start logging workouts to see your statistics and track your progress.
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
          <BarChart2 className="h-16 w-16 text-muted-foreground" />
          <h3 className="text-xl font-semibold">Your Dashboard is Empty</h3>
          <p className="text-muted-foreground max-w-md">
            Start by logging your workouts in the exercise database. Once you have some workout data,
            your dashboard will show your statistics and progress.
          </p>
          
          <div className="flex gap-4 mt-4">
            <Button onClick={loadSampleData} variant="outline">
              Load Sample Data
            </Button>
            <Button onClick={fetchDashboardStats}>
              Refresh Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Workouts This Month */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Workouts This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.workoutsThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(), 'MMMM yyyy')}
            </p>
          </CardContent>
        </Card>

        {/* Average Workout Duration */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Workout Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(stats.avgWorkoutDuration)}</div>
            <p className="text-xs text-muted-foreground">
              Based on all your workouts
            </p>
          </CardContent>
        </Card>

        {/* Total Weight Lifted */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Weight Lifted</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWeightLifted.toLocaleString()} kg</div>
            <p className="text-xs text-muted-foreground">
              Lifetime total
            </p>
          </CardContent>
        </Card>

        {/* Weekly Activity */}
        <Card className="col-span-full md:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="workouts" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-full md:col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentWorkouts.length > 0 ? (
                stats.recentWorkouts.map((workout) => (
                  <div key={workout._id} className="flex items-center">
                    <div className="mr-4 rounded-full bg-primary/10 p-2">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {workout.exercise?.name || 'Unknown Exercise'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {workout.startTime ? format(new Date(workout.startTime), 'MMM d, yyyy • h:mm a') : 'N/A'}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {workout.sets?.length || 0} sets
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent workouts</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Progress Tracking */}
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Progress Tracking</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {progressData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#8884d8" 
                    name="Volume (Weight × Reps)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-full">
                <p className="text-muted-foreground">Not enough data to show progress</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Footer controls */}
      <div className="flex justify-end space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={loadSampleData}
        >
          Load Sample Data
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={fetchDashboardStats}
        >
          Refresh
        </Button>
      </div>
    </div>
  );
};

export default Dashboard; 