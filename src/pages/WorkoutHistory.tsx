import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Calendar, X, Filter, ChevronLeft, ChevronRight, Clock, 
  BarChart2, Search, LayoutList, FileText, Weight
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { workoutLogAPI, exerciseAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DateRange } from 'react-day-picker';

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

// Workout Details Modal Component
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
            <LayoutList className="h-5 w-5 text-empowerfit-blue mt-0.5" />
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

// Workout History Item Component
const WorkoutHistoryItem: React.FC<{
  workout: WorkoutLog;
  onClick: () => void;
}> = ({ workout, onClick }) => {
  // Calculate total volume
  const totalVolume = workout.sets.reduce((total, set) => {
    const weight = parseFloat(set.weight?.toString() || '0');
    const reps = parseInt(set.reps?.toString() || '0', 10);
    return total + (weight * reps);
  }, 0);

  // Format date
  const formatDate = (dateString: string): string => {
    return format(new Date(dateString), 'MMM d, yyyy • h:mm a');
  };

  // Format duration
  const formatDuration = (seconds: number): string => {
    const minutes = Math.round(seconds / 60);
    return `${minutes} min`;
  };

  return (
    <div 
      className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg">{workout.exerciseName}</h3>
        <div className="flex items-center text-sm font-medium text-empowerfit-blue">
          <BarChart2 className="h-4 w-4 mr-1" />
          {totalVolume.toLocaleString()} kg
        </div>
      </div>
      
      <div className="text-gray-500 text-sm mb-3">
        {formatDate(workout.startTime)}
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center text-sm">
          <Clock className="h-4 w-4 mr-1 text-gray-400" />
          <span>{formatDuration(workout.totalDuration)}</span>
        </div>
        
        <div className="text-sm">
          <span className="text-gray-500">{workout.sets.length} sets</span>
        </div>
      </div>
    </div>
  );
};

// Filter and Search Panel Component
const FilterPanel: React.FC<{
  onSearch: (term: string) => void;
  onDateChange: (dateRange: DateRange | undefined) => void;
  onReset: () => void;
  searchTerm: string;
  dateRange: DateRange | undefined;
}> = ({ onSearch, onDateChange, onReset, searchTerm, dateRange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempSearch, setTempSearch] = useState(searchTerm);
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(dateRange);
  
  const handleApply = () => {
    onSearch(tempSearch);
    onDateChange(tempDateRange);
    setIsOpen(false);
  };
  
  const handleReset = () => {
    setTempSearch('');
    setTempDateRange(undefined);
    onReset();
    setIsOpen(false);
  };
  
  return (
    <div className="relative mb-4">
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search exercises..."
            className="pl-9"
          />
        </div>
        <Button 
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className={isOpen ? 'bg-gray-100' : ''}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-10 w-full max-w-md bg-white shadow-lg rounded-lg border p-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="search">Exercise Name</Label>
              <Input 
                id="search"
                value={tempSearch}
                onChange={(e) => setTempSearch(e.target.value)}
                placeholder="Search exercises..."
                className="mt-1"
              />
            </div>
            
            <div>
              <Label className="block mb-1">Date Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input 
                  type="date"
                  value={tempDateRange?.from ? format(tempDateRange.from, 'yyyy-MM-dd') : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined;
                    setTempDateRange(prev => ({ 
                      from: date, 
                      to: prev?.to 
                    }));
                  }}
                  placeholder="Start date"
                />
                <Input 
                  type="date"
                  value={tempDateRange?.to ? format(tempDateRange.to, 'yyyy-MM-dd') : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined;
                    setTempDateRange(prev => ({ 
                      from: prev?.from, 
                      to: date 
                    }));
                  }}
                  placeholder="End date"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleReset}
              >
                Reset
              </Button>
              <Button 
                size="sm"
                onClick={handleApply}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Workout History Page Component
const WorkoutHistory: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutLog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [exerciseNameMap, setExerciseNameMap] = useState<Record<string, string>>({});
  
  // Fetch workout data
  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Prepare date range for API
        const params: any = {
          page,
          limit: 12 // Show 12 workouts per page
        };
        
        if (dateRange?.from) {
          params.startDate = new Date(dateRange.from).toISOString();
        }
        
        if (dateRange?.to) {
          // Set time to end of day for the to date
          const endDate = new Date(dateRange.to);
          endDate.setHours(23, 59, 59, 999);
          params.endDate = endDate.toISOString();
        }
        
        // Fetch workout logs
        const response = await workoutLogAPI.getWorkoutLogs(params);
        
        if (!response?.workouts || !Array.isArray(response.workouts)) {
          setWorkouts([]);
          setTotalPages(1);
          setLoading(false);
          return;
        }
        
        console.log('Workout history response:', response);
        
        // Calculate total pages
        if (response.pagination && response.pagination.total) {
          const total = response.pagination.total;
          const pages = Math.ceil(total / 12);
          setTotalPages(pages);
        }
        
        // Get unique exercise IDs
        const exerciseIds = Array.from(
          new Set(response.workouts.map((workout: any) => workout.exercise))
        );
        
        // Fetch exercise details in parallel
        const newExerciseNameMap: Record<string, string> = { ...exerciseNameMap };
        const missingExerciseIds = exerciseIds.filter(id => !exerciseNameMap[id as string]);
        
        if (missingExerciseIds.length > 0) {
          const exercisePromises = missingExerciseIds.map(async (id: string) => {
            try {
              const exercise = await exerciseAPI.getExerciseById(id);
              if (exercise && exercise.name) {
                newExerciseNameMap[id] = exercise.name;
              } else {
                newExerciseNameMap[id] = 'Unknown Exercise';
              }
            } catch (err) {
              console.error(`Error fetching exercise ${id}:`, err);
              newExerciseNameMap[id] = 'Unknown Exercise';
            }
          });
          
          await Promise.all(exercisePromises);
          setExerciseNameMap(newExerciseNameMap);
        }
        
        // Process workouts with exercise names
        const processedWorkouts = response.workouts.map((workout: any) => ({
          ...workout,
          exerciseName: newExerciseNameMap[workout.exercise] || 'Unknown Exercise'
        }));
        
        // Filter by search term if provided
        const filteredWorkouts = searchTerm
          ? processedWorkouts.filter((workout: WorkoutLog) => 
              workout.exerciseName.toLowerCase().includes(searchTerm.toLowerCase())
            )
          : processedWorkouts;
        
        setWorkouts(filteredWorkouts);
      } catch (err) {
        console.error('Error fetching workout history:', err);
        setError('Failed to load workout history');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkouts();
  }, [page, dateRange, searchTerm]);
  
  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPage(1); // Reset to first page when searching
  };
  
  // Handle date range change
  const handleDateChange = (range: DateRange | undefined) => {
    setDateRange(range);
    setPage(1); // Reset to first page when changing date range
  };
  
  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setDateRange(undefined);
    setPage(1);
  };
  
  return (
    <Layout activePage="profile">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Workout History</h1>
        </div>
        
        {/* Filter Panel */}
        <FilterPanel 
          onSearch={handleSearch}
          onDateChange={handleDateChange}
          onReset={handleResetFilters}
          searchTerm={searchTerm}
          dateRange={dateRange}
        />
        
        {/* Workout List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow p-4 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
            <p>{error}</p>
          </div>
        ) : workouts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-2">No workout logs found</p>
            {(searchTerm || dateRange) && (
              <p className="text-sm text-gray-400">Try adjusting your filters</p>
            )}
            {(!searchTerm && !dateRange) && (
              <p className="text-sm text-gray-400">Start logging your workouts to see your history</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workouts.map((workout) => (
              <WorkoutHistoryItem 
                key={workout._id}
                workout={workout}
                onClick={() => setSelectedWorkout(workout)}
              />
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="text-sm">
                Page {page} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages || loading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
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
    </Layout>
  );
};

export default WorkoutHistory; 