import React, { useEffect, useState } from 'react';
import { ArrowUp, Calendar, Dumbbell, Activity, Clock } from 'lucide-react';
import { workoutLogAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { getUserFromStorage } from '@/lib/api';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  icon: React.ReactNode;
  positive?: boolean;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  icon, 
  positive = true,
  loading = false 
}) => {
  return (
    <div className="bg-white rounded-xl p-4 shadow-md">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">{title}</span>
        <div className="bg-gray-100 p-1.5 rounded-full">
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <h3 className="text-xl font-bold">
          {loading ? (
            <span className="inline-block w-16 h-6 bg-gray-200 animate-pulse rounded"></span>
          ) : (
            value
          )}
        </h3>
        {change && (
          <div className={`flex items-center text-xs ${positive ? 'text-green-500' : 'text-red-500'}`}>
            <ArrowUp className={`h-3 w-3 mr-0.5 ${!positive && 'rotate-180'}`} />
            {change}
          </div>
        )}
      </div>
    </div>
  );
};

const QuickStats: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workoutStats, setWorkoutStats] = useState({
    thisMonth: 0,
    lastMonth: 0,
    thisWeek: 0,
    lastWeek: 0,
    totalLiftedWeight: 0,
    avgDuration: 0
  });

  useEffect(() => {
    const getWorkoutStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Debug user authentication state
        const storedUser = getUserFromStorage();
        console.log('Current user:', user?.id, user?.name);
        console.log('Stored user info:', storedUser?.id, storedUser?.name);
        console.log('Authentication token available:', !!storedUser?.token);
        
        if (!storedUser?.token) {
          setError('User not properly authenticated');
          setLoading(false);
          return;
        }
        
        // Get dates for filtering
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        
        // This week (assuming Monday is first day of week)
        const today = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const daysSinceMonday = today === 0 ? 6 : today - 1;
        const thisWeekStart = new Date(now);
        thisWeekStart.setDate(now.getDate() - daysSinceMonday);
        thisWeekStart.setHours(0, 0, 0, 0);
        
        // Last week
        const lastWeekStart = new Date(thisWeekStart);
        lastWeekStart.setDate(thisWeekStart.getDate() - 7);
        const lastWeekEnd = new Date(thisWeekStart);
        lastWeekEnd.setDate(thisWeekStart.getDate() - 1);
        lastWeekEnd.setHours(23, 59, 59, 999);
        
        console.log('Date ranges:');
        console.log('This month:', thisMonthStart.toDateString(), 'to', now.toDateString());
        console.log('Last month:', lastMonthStart.toDateString(), 'to', lastMonthEnd.toDateString());
        console.log('This week:', thisWeekStart.toDateString(), 'to', now.toDateString());
        console.log('Last week:', lastWeekStart.toDateString(), 'to', lastWeekEnd.toDateString());
        
        // Try to get all workouts first to check if we have any data at all
        const allWorkouts = await workoutLogAPI.getWorkoutLogs();
        console.log('All workout logs:', allWorkouts);
        console.log('Total workouts from API:', allWorkouts?.pagination?.total);
        
        if (allWorkouts?.workouts?.length > 0) {
          // Display a sample workout to see its structure
          console.log('Sample workout object:', allWorkouts.workouts[0]);
          if (allWorkouts.workouts[0].sets && allWorkouts.workouts[0].sets.length > 0) {
            console.log('Sample set object:', allWorkouts.workouts[0].sets[0]);
          }
        }
        
        if (!allWorkouts || !allWorkouts.pagination || allWorkouts.pagination.total === 0) {
          console.log('No workout logs found for the user');
          setWorkoutStats({
            thisMonth: 0,
            lastMonth: 0,
            thisWeek: 0,
            lastWeek: 0,
            totalLiftedWeight: 0,
            avgDuration: 0
          });
          setLoading(false);
          return;
        }
        
        // Fetch workout logs for different time periods
        const [thisMonthLogs, lastMonthLogs, thisWeekLogs, lastWeekLogs] = await Promise.all([
          // This month
          workoutLogAPI.getWorkoutLogs({
            startDate: thisMonthStart.toISOString(),
            endDate: now.toISOString()
          }),
          // Last month
          workoutLogAPI.getWorkoutLogs({
            startDate: lastMonthStart.toISOString(),
            endDate: lastMonthEnd.toISOString()
          }),
          // This week
          workoutLogAPI.getWorkoutLogs({
            startDate: thisWeekStart.toISOString(),
            endDate: now.toISOString()
          }),
          // Last week
          workoutLogAPI.getWorkoutLogs({
            startDate: lastWeekStart.toISOString(),
            endDate: lastWeekEnd.toISOString()
          })
        ]);
        
        console.log('This month logs:', thisMonthLogs);
        console.log('This week logs:', thisWeekLogs);
        
        // Calculate total lifted weight and average duration
        let totalWeight = 0;
        let totalDuration = 0;
        let workoutCount = 0;
        
        if (thisMonthLogs && thisMonthLogs.workouts && thisMonthLogs.workouts.length > 0) {
          console.log(`Processing ${thisMonthLogs.workouts.length} workouts for weight calculation`);
          
          thisMonthLogs.workouts.forEach((log: any, index: number) => {
            console.log(`Workout ${index + 1}:`, log.exercise, 'Duration:', log.totalDuration);
            workoutCount++;
            totalDuration += log.totalDuration || 0;
            
            if (log.sets && Array.isArray(log.sets)) {
              console.log(`  Processing ${log.sets.length} sets`);
              
              log.sets.forEach((set: any, setIdx: number) => {
                console.log(`  Set ${setIdx + 1}:`, set.weight, 'kg x', set.reps, 'reps');
                if (set.weight && set.reps) {
                  const weight = parseFloat(set.weight);
                  const reps = parseInt(set.reps, 10);
                  if (!isNaN(weight) && !isNaN(reps)) {
                    const setTotal = weight * reps;
                    console.log(`    Added ${setTotal}kg to total (${weight} x ${reps})`);
                    totalWeight += setTotal;
                  }
                }
              });
            }
          });
          
          console.log('Final totals:', {
            workoutCount,
            totalDuration,
            totalWeight
          });
        }
        
        // Update stats
        setWorkoutStats({
          thisMonth: thisMonthLogs?.pagination?.total || 0,
          lastMonth: lastMonthLogs?.pagination?.total || 0,
          thisWeek: thisWeekLogs?.pagination?.total || 0,
          lastWeek: lastWeekLogs?.pagination?.total || 0,
          totalLiftedWeight: Math.round(totalWeight),
          avgDuration: workoutCount > 0 ? Math.round(totalDuration / workoutCount / 60) : 0 // Convert seconds to minutes
        });
      } catch (error) {
        console.error('Error fetching workout stats:', error);
        setError('Could not load workout data');
      } finally {
        setLoading(false);
      }
    };
    
    getWorkoutStats();
  }, [user]);
  
  // Calculate percentage changes
  const getPercentChange = (current: number, previous: number): string => {
    if (previous === 0) return current > 0 ? '100%' : '0%';
    const change = ((current - previous) / previous) * 100;
    return `${Math.abs(Math.round(change))}%`;
  };
  
  const isPositiveChange = (current: number, previous: number): boolean => {
    return current >= previous;
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 mb-6">
        <p>{error}</p>
        <p className="text-sm mt-1">Try logging out and back in, or create some workout logs.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Workouts This Month"
        value={workoutStats.thisMonth.toString()}
        change={getPercentChange(workoutStats.thisMonth, workoutStats.lastMonth)}
        positive={isPositiveChange(workoutStats.thisMonth, workoutStats.lastMonth)}
        icon={<Calendar className="h-4 w-4 text-empowerfit-purple" />}
        loading={loading}
      />
      <StatCard
        title="Total Weight Lifted"
        value={`${workoutStats.totalLiftedWeight.toLocaleString()} kg`}
        icon={<Dumbbell className="h-4 w-4 text-empowerfit-blue" />}
        loading={loading}
      />
      <StatCard
        title="Weekly Activity"
        value={`${workoutStats.thisWeek} workouts`}
        change={getPercentChange(workoutStats.thisWeek, workoutStats.lastWeek)}
        positive={isPositiveChange(workoutStats.thisWeek, workoutStats.lastWeek)}
        icon={<Activity className="h-4 w-4 text-empowerfit-purple" />}
        loading={loading}
      />
      <StatCard
        title="Avg. Workout Duration"
        value={`${workoutStats.avgDuration} min`}
        icon={<Clock className="h-4 w-4 text-empowerfit-blue" />}
        loading={loading}
      />
    </div>
  );
};

export default QuickStats;
