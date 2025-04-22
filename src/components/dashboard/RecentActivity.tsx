import React, { useState, useEffect } from 'react';
import { CalendarDays, BarChart2, ArrowUpRight, Loader2, X, Clock, Weight, ListChecks, FileText, Calendar } from 'lucide-react';
import { workoutLogAPI, exerciseAPI } from '@/lib/api';
import { Link } from 'react-router-dom';

interface ActivityItemProps {
  date: string;
  workout: string;
  duration: string;
  volume: string;
  isLoading?: boolean;
  onClick?: () => void;
}

interface WorkoutLog {
  _id: string;
  exercise: string;
  exerciseName?: string;
  startTime: string;
  endTime: string;
  totalDuration: number;
  sets: Array<{
    setNumber: number;
    weight: number | string;
    reps: number | string;
    completed: boolean;
    _id?: string;
  }>;
  notes?: string;
}

// Modal to display workout details
const WorkoutDetailsModal: React.FC<{
  workout: WorkoutLog | null;
  onClose: () => void;
}> = ({ workout, onClose }) => {
  if (!workout) return null;

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const totalVolume = workout.sets.reduce((total, set) => {
    const weight = parseFloat(set.weight?.toString() || '0');
    const reps = parseInt(set.reps?.toString() || '0', 10);
    return total + (weight * reps);
  }, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b sticky top-0 bg-white flex justify-between items-center">
          <h3 className="text-xl font-bold">{workout.exerciseName}</h3>
          <button 
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-5 space-y-5">
          {/* Date and Time */}
          <div className="flex items-start space-x-3">
            <Calendar className="h-5 w-5 text-empowerfit-purple mt-0.5" />
            <div>
              <h4 className="font-medium">Date & Time</h4>
              <p className="text-gray-600">{formatDate(workout.startTime)}</p>
            </div>
          </div>
          
          {/* Duration */}
          <div className="flex items-start space-x-3">
            <Clock className="h-5 w-5 text-empowerfit-blue mt-0.5" />
            <div>
              <h4 className="font-medium">Duration</h4>
              <p className="text-gray-600">{formatDuration(workout.totalDuration)}</p>
            </div>
          </div>
          
          {/* Volume */}
          <div className="flex items-start space-x-3">
            <Weight className="h-5 w-5 text-empowerfit-purple mt-0.5" />
            <div>
              <h4 className="font-medium">Total Volume</h4>
              <p className="text-gray-600">{totalVolume.toLocaleString()} kg</p>
            </div>
          </div>
          
          {/* Sets */}
          <div className="flex items-start space-x-3">
            <ListChecks className="h-5 w-5 text-empowerfit-blue mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium">Sets</h4>
              <div className="mt-2 border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-500">Set</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-500">Weight</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-500">Reps</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {workout.sets.map((set) => (
                      <tr key={set._id || set.setNumber} className="hover:bg-gray-50">
                        <td className="px-4 py-2">{set.setNumber}</td>
                        <td className="px-4 py-2">{set.weight} kg</td>
                        <td className="px-4 py-2">{set.reps}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* Notes (if any) */}
          {workout.notes && (
            <div className="flex items-start space-x-3">
              <FileText className="h-5 w-5 text-empowerfit-purple mt-0.5" />
              <div>
                <h4 className="font-medium">Notes</h4>
                <p className="text-gray-600 whitespace-pre-line mt-1">{workout.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ActivityItem: React.FC<ActivityItemProps> = ({ date, workout, duration, volume, isLoading, onClick }) => {
  if (isLoading) {
    return (
      <div className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors animate-pulse">
        <div className="bg-gray-200 p-2 rounded-full mr-4 h-9 w-9"></div>
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="flex">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="h-4 bg-gray-200 rounded w-14"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="bg-empowerfit-purple-light/10 p-2 rounded-full mr-4">
        <CalendarDays className="h-5 w-5 text-empowerfit-purple" />
      </div>
      <div className="flex-1">
        <p className="font-medium">{workout}</p>
        <div className="flex text-sm text-gray-500">
          <p>{date}</p>
          <span className="mx-2">•</span>
          <p>{duration}</p>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <div className="flex items-center text-sm font-medium text-empowerfit-blue">
          <BarChart2 className="h-3.5 w-3.5 mr-1" />
          {volume}
        </div>
        <button 
          className="text-gray-400 hover:text-empowerfit-purple mt-1"
          onClick={(e) => {
            e.stopPropagation(); // Prevent the parent onClick from firing
            onClick && onClick();
          }}
        >
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

const RecentActivity: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutLog | null>(null);

  useEffect(() => {
    const fetchRecentWorkouts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get recent workout logs (limit to 5)
        const workoutLogsResponse = await workoutLogAPI.getWorkoutLogs({
          limit: 5, 
          // Sort by newest first
          startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString()
        });
        
        if (!workoutLogsResponse?.workouts || workoutLogsResponse.workouts.length === 0) {
          setWorkoutLogs([]);
          setLoading(false);
          return;
        }
        
        console.log('Recent workouts:', workoutLogsResponse.workouts);
        
        // Create a map to store exercise names
        const exerciseNames: Record<string, string> = {};
        
        // Fetch exercise details for each unique exercise ID
        const uniqueExerciseIds = Array.from(
          new Set(workoutLogsResponse.workouts.map((log: any) => log.exercise))
        );
        
        // Fetch all unique exercise details in parallel
        const exercisePromises = uniqueExerciseIds.map(async (id: string) => {
          try {
            const exerciseData = await exerciseAPI.getExerciseById(id);
            if (exerciseData && exerciseData.name) {
              exerciseNames[id] = exerciseData.name;
            }
          } catch (err) {
            console.error(`Error fetching exercise ${id}:`, err);
            exerciseNames[id] = 'Unknown Exercise';
          }
        });
        
        // Wait for all exercise fetches to complete
        await Promise.all(exercisePromises);
        
        // Process workout logs and add exercise names
        const processedLogs = workoutLogsResponse.workouts.map((log: any) => ({
          ...log,
          exerciseName: exerciseNames[log.exercise] || 'Unknown Exercise'
        }));
        
        setWorkoutLogs(processedLogs);
      } catch (err) {
        console.error('Error fetching recent workouts:', err);
        setError('Failed to load recent activity');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecentWorkouts();
  }, []);
  
  // Function to calculate total volume for a workout (weight × reps)
  const calculateVolume = (sets: any[]): number => {
    if (!sets || !Array.isArray(sets)) return 0;
    
    return sets.reduce((total, set) => {
      const weight = parseFloat(set.weight?.toString() || '0');
      const reps = parseInt(set.reps?.toString() || '0', 10);
      
      if (!isNaN(weight) && !isNaN(reps)) {
        return total + (weight * reps);
      }
      return total;
    }, 0);
  };
  
  // Format date for display (e.g., "Apr 17")
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  // Format duration in minutes
  const formatDuration = (durationInSeconds: number): string => {
    const minutes = Math.round(durationInSeconds / 60);
    return `${minutes} min`;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Recent Activity</h2>
        <Link to="/workout-history" className="text-sm text-empowerfit-purple font-medium hover:underline">
          View All
        </Link>
      </div>
      
      {loading ? (
      <div className="space-y-2">
          {[1, 2, 3].map((index) => (
          <ActivityItem
            key={index}
              date=""
              workout=""
              duration=""
              volume=""
              isLoading={true}
            />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          <p>{error}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {workoutLogs.map((log) => (
            <ActivityItem
              key={log._id}
              date={formatDate(log.startTime)}
              workout={log.exerciseName || 'Unknown Exercise'}
              duration={formatDuration(log.totalDuration)}
              volume={`${calculateVolume(log.sets).toLocaleString()} kg`}
              onClick={() => setSelectedWorkout(log)}
          />
        ))}
      </div>
      )}
      
      {!loading && !error && workoutLogs.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No recent workouts</p>
          <p className="text-sm mt-1">Start logging your fitness journey today</p>
        </div>
      )}

      {/* Workout Details Modal */}
      {selectedWorkout && (
        <WorkoutDetailsModal 
          workout={selectedWorkout}
          onClose={() => setSelectedWorkout(null)}
        />
      )}
    </div>
  );
};

export default RecentActivity;
