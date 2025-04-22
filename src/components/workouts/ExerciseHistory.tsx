import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { BarChart2, Clock, Search, Filter, ChevronLeft, ChevronRight, Calendar, Dumbbell, Loader } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { workoutLogAPI, exerciseAPI } from '@/lib/api';
import { DateRange } from 'react-day-picker';
import { Badge } from "@/components/ui/badge";

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
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Workout Details</DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4 py-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold">{workout.exerciseName}</h3>
            <p className="text-sm text-gray-500">{formatDate(workout.startTime)}</p>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {formatDuration(workout.totalDuration)}
          </Badge>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="font-medium mb-2">Set Details</h4>
          <div className="space-y-2">
            {workout.sets.map((set, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm mr-2">
                    {set.setNumber}
                  </div>
                  <span>{set.weight} kg × {set.reps} reps</span>
                </div>
                <div className="text-sm text-gray-500">
                  {parseFloat(set.weight?.toString() || '0') * parseInt(set.reps?.toString() || '0', 10)} kg
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between mt-4 pt-2 border-t">
            <span className="font-medium">Total Volume</span>
            <span className="font-bold">{totalVolume.toLocaleString()} kg</span>
          </div>
        </div>
        
        {workout.notes && (
          <div>
            <h4 className="font-medium mb-2">Notes</h4>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">{workout.notes}</p>
          </div>
        )}
      </div>
      
      <DialogFooter>
        <Button onClick={onClose}>Close</Button>
      </DialogFooter>
    </DialogContent>
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
      className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer border border-transparent hover:border-empowerfit-purple-light"
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

const ExerciseHistory: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutLog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [exerciseNameMap, setExerciseNameMap] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  const itemsPerPage = 20; // Limit to 20 items per page

  // Fetch workout data
  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Prepare date range for API
        const params: any = {
          page,
          limit: itemsPerPage
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
        
        // Calculate total pages
        if (response.pagination && response.pagination.total) {
          const total = response.pagination.total;
          const pages = Math.ceil(total / itemsPerPage);
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
        
        setWorkouts(processedWorkouts);
      } catch (err) {
        console.error('Error fetching workout history:', err);
        setError('Failed to load workout history');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkouts();
  }, [page, dateRange, exerciseNameMap]);

  // Filter workouts by search term
  const filteredWorkouts = searchTerm
    ? workouts.filter(workout => 
        workout.exerciseName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : workouts;

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle workout click
  const handleWorkoutClick = (workout: WorkoutLog) => {
    setSelectedWorkout(workout);
    setDetailsOpen(true);
  };

  // Render pagination component
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <Pagination className="mt-6">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => page > 1 && handlePageChange(page - 1)}
              className={page === 1 ? "opacity-50 pointer-events-none" : "cursor-pointer"} 
            />
          </PaginationItem>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            // Only show current page, first, last, and pages around current
            if (
              p === 1 || 
              p === totalPages || 
              (p >= page - 1 && p <= page + 1)
            ) {
              return (
                <PaginationItem key={p}>
                  <PaginationLink 
                    isActive={page === p}
                    onClick={() => handlePageChange(p)}
                    className="cursor-pointer"
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              );
            }
            
            // Show ellipsis but only once between ranges
            if (p === page - 2 || p === page + 2) {
              return <PaginationItem key={p}>...</PaginationItem>;
            }
            
            return null;
          })}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => page < totalPages && handlePageChange(page + 1)}
              className={page === totalPages ? "opacity-50 pointer-events-none" : "cursor-pointer"} 
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div>
      {/* Search and filter bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search exercises..."
              className="w-full pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant={showFilters ? "default" : "outline"} 
              size="sm" 
              className="w-full sm:w-auto"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
          </div>
        </div>
        
        {showFilters && (
          <div className="mt-4 border-t pt-4 flex flex-wrap gap-4">
            <div className="w-full sm:w-auto">
              <Label className="text-xs mb-1 block">Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full sm:w-[240px] justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -
                          {" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Select date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {dateRange && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-auto"
                onClick={() => setDateRange(undefined)}
              >
                Clear Dates
              </Button>
            )}
          </div>
        )}
      </div>
      
      {/* Workout history content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="h-8 w-8 animate-spin text-empowerfit-purple" />
        </div>
      ) : error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : filteredWorkouts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Dumbbell className="h-12 w-12 text-empowerfit-purple mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold mb-2">No Exercise History Found</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {searchTerm || dateRange 
              ? "No workouts match your search criteria. Try adjusting your filters."
              : "You haven't logged any workouts yet. Start tracking your progress!"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkouts.map((workout) => (
              <WorkoutHistoryItem
                key={workout._id}
                workout={workout}
                onClick={() => handleWorkoutClick(workout)}
              />
            ))}
          </div>
          
          {renderPagination()}
          
          <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
            <WorkoutDetailsModal
              workout={selectedWorkout}
              onClose={() => setDetailsOpen(false)}
            />
          </Dialog>
        </>
      )}
    </div>
  );
};

export default ExerciseHistory; 