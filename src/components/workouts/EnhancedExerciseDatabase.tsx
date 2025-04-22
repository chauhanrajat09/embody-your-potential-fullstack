import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, ChevronRight, Dumbbell, Heart, Award, Filter, 
  BarChart2, User, Play, Plus, Info, Loader, AlertCircle, PlayCircle, History 
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { exerciseAPI, customWorkoutAPI, workoutLogAPI } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from '@/hooks/use-toast';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import WorkoutStarter from './WorkoutStarter';
import ExerciseTracker from './ExerciseTracker';

// Maximum number of exercises to display per tab
const MAX_EXERCISES_PER_TAB = 20;

// Maximum number of recent exercises to store
const MAX_RECENT_EXERCISES = 20;

// Local storage key for recent exercises
const RECENT_EXERCISES_KEY = 'recent_exercises';

interface Exercise {
  _id: string;
  name: string;
  description: string;
  instructions: string;
  target_muscles: {
    primary: string[];
    secondary: string[];
  };
  category: string;
  movement_type: string;
  equipment: string;
  difficulty: string;
  media: {
    image_url?: string;
    video_url?: string;
  };
  is_custom: boolean;
}

interface ExerciseItemProps {
  exercise: Exercise;
  personalRecord?: string;
  onSelect: (exercise: Exercise) => void;
  isFavorite: boolean;
  onToggleFavorite: (exerciseId: string, isFavorite: boolean) => void;
  onStartWorkout: (exercise: Exercise) => void;
}

const ExerciseItem: React.FC<ExerciseItemProps> = ({ 
  exercise, personalRecord, onSelect, isFavorite, onToggleFavorite, onStartWorkout
}) => {
  const { name, target_muscles, equipment, difficulty, category, movement_type, media } = exercise;
  const [showDemo, setShowDemo] = useState(false);
  
  // Get primary target muscle
  const targetMuscle = target_muscles.primary.length > 0 ? target_muscles.primary[0] : "General";
  
  // Get difficulty badge color
  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(exercise._id, isFavorite);
  };

  const handleStartWorkout = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStartWorkout(exercise);
  };
  
  return (
    <div 
      className="flex items-center justify-between p-3 border-b hover:bg-gray-50 cursor-pointer"
      onClick={() => onSelect(exercise)}
    >
      <div className="flex items-center">
        <div className="bg-empowerfit-gray-light p-2 rounded-lg mr-3">
          <Dumbbell className="h-6 w-6 text-empowerfit-purple" />
        </div>
        <div>
          <h3 className="font-medium">{name}</h3>
          <div className="flex text-xs text-gray-500 mt-0.5 flex-wrap gap-1">
            <span>{targetMuscle}</span>
            <span className="mx-1.5">•</span>
            <span>{equipment}</span>
            <span className="mx-1.5">•</span>
            <Badge variant="outline" className={`ml-1 text-xs ${getDifficultyColor()}`}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </Badge>
            {category && (
              <Badge variant="outline" className="ml-1 text-xs">{category}</Badge>
            )}
            {movement_type && (
              <Badge variant="outline" className="ml-1 text-xs">{movement_type}</Badge>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center">
        {personalRecord && (
          <div className="flex items-center mr-4 bg-empowerfit-gray-light px-2 py-1 rounded text-xs font-medium">
            <Award className="h-3 w-3 text-yellow-500 mr-1" />
            <span>PR: {personalRecord}</span>
          </div>
        )}
        <div className="flex" onClick={(e) => e.stopPropagation()}>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleFavoriteClick}
            className="text-gray-400 hover:text-red-500"
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
          
          {(media?.image_url || media?.video_url) && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setShowDemo(!showDemo); }}>
                    <Play className="h-4 w-4 text-empowerfit-blue" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View exercise demo</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleStartWorkout} 
                  className="text-primary"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Start workout</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {showDemo && (media?.image_url || media?.video_url) && (
        <div className="absolute left-0 right-0 mt-2 border-t pt-3 bg-white px-3 pb-3 z-10" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-center">
            {media.video_url ? (
              <video 
                src={media.video_url} 
                controls
                className="h-48 rounded-lg shadow-md"
              />
            ) : (
              <img 
                src={media.image_url} 
                alt={`${name} demonstration`} 
                className="h-48 rounded-lg shadow-md" 
              />
            )}
          </div>
          <p className="text-xs text-center text-gray-500 mt-2">
            {name} demonstration - Proper form is essential for effective results.
          </p>
        </div>
      )}
    </div>
  );
};

const EnhancedExerciseDatabase: React.FC = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [bodyPartFilter, setBodyPartFilter] = useState('all');
  const [equipmentFilter, setEquipmentFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [movementTypeFilter, setMovementTypeFilter] = useState('all');
  const [currentTab, setCurrentTab] = useState('all');
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [favoriteExercises, setFavoriteExercises] = useState<Exercise[]>([]);
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);
  const [recentExercises, setRecentExercises] = useState<Exercise[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  
  // Selected exercise for detail view
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  
  // Workout flow states
  const [workoutFlowState, setWorkoutFlowState] = useState<'none' | 'starter' | 'tracker'>('none');
  const [workoutExercise, setWorkoutExercise] = useState<Exercise | null>(null);
  const [workoutDialogOpen, setWorkoutDialogOpen] = useState(false);
  
  // Fetch recent exercises from the API
  const fetchRecentExercises = async () => {
    try {
      console.log('[RecentExercises] Fetching recent exercises');
      setLoading(true);
      
      const data = await exerciseAPI.getRecentExercises();
      console.log('[RecentExercises] Received recent exercises:', data);
      
      if (data && data.exercises && Array.isArray(data.exercises)) {
        console.log(`[RecentExercises] Found ${data.exercises.length} recent exercises`);
        setRecentExercises(data.exercises);
      } else {
        console.error('[RecentExercises] Invalid recent exercises response:', data);
        setRecentExercises([]);
      }
    } catch (err: any) {
      console.error('[RecentExercises] Error fetching recent exercises:', err);
      toast({
        title: "Error loading recent exercises",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
      setRecentExercises([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to add an exercise to recent list
  const addToRecentExercises = async (exercise: Exercise) => {
    try {
      if (!exercise || !exercise._id) return;
      
      await exerciseAPI.addToRecentExercises(exercise._id);
      
      // If we're on the recent tab, refresh the recent exercises
      if (currentTab === 'recent') {
        fetchRecentExercises();
      }
    } catch (error: any) {
      console.error('[RecentExercises] Error adding to recent exercises:', error);
      // Don't show an error toast here, as this is a background operation
    }
  };
  
  // View details function - separated from selection for clarity
  const handleViewDetails = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setDetailDialogOpen(true);
    
    // Add to recent exercises when viewing details
    addToRecentExercises(exercise);
  };
  
  // Handle exercise selection
  const handleSelectExercise = (exercise: Exercise) => {
    // When clicking on an exercise row, view details
    handleViewDetails(exercise);
  };
  
  // Handle starting a workout
  const handleStartWorkout = (exercise: Exercise) => {
    setWorkoutExercise(exercise);
    setWorkoutFlowState('starter');
    setWorkoutDialogOpen(true);
    
    // Add to recent exercises when starting a workout
    addToRecentExercises(exercise);
  };
  
  // Handle beginning the actual workout tracking
  const handleBeginWorkout = () => {
    setWorkoutFlowState('tracker');
  };
  
  // Handle canceling the workout
  const handleCancelWorkout = () => {
    setWorkoutDialogOpen(false);
    setWorkoutFlowState('none');
    setWorkoutExercise(null);
  };
  
  // Handle workout completion
  const handleWorkoutComplete = async (workoutData: any) => {
    try {
      setLoading(true);
      
      // Log the workout using the API
      await workoutLogAPI.logWorkout({
        exerciseId: workoutData.exerciseId,
        exerciseName: workoutData.exerciseName,
        duration: workoutData.duration,
        date: workoutData.date,
        sets: workoutData.sets,
        notes: workoutData.notes
      });
      
      toast({
        title: 'Workout saved',
        description: 'Your workout has been successfully recorded.',
      });
      
      setWorkoutDialogOpen(false);
      setWorkoutFlowState('none');
      setWorkoutExercise(null);
    } catch (error: any) {
      console.error('Error saving workout:', error);
      toast({
        title: 'Error saving workout',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch custom exercises
  const fetchCustomExercises = async () => {
    try {
      console.log('[CustomExercises] Fetching custom exercises');
      setLoading(true);
      
      // Query to get custom exercises (is_custom = true and created by current user)
      const params = {
        custom: 'true',
        limit: 50,
        page: 1
      };
      
      const data = await exerciseAPI.getExercises(params);
      console.log('[CustomExercises] Received custom exercises:', data);
      
      if (data && data.exercises && Array.isArray(data.exercises)) {
        console.log(`[CustomExercises] Found ${data.exercises.length} custom exercises`);
        setCustomExercises(data.exercises);
      } else {
        console.error('[CustomExercises] Invalid custom exercises response:', data);
        setCustomExercises([]);
      }
    } catch (err: any) {
      console.error('[CustomExercises] Error fetching custom exercises:', err);
      toast({
        title: "Error loading custom exercises",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
      setCustomExercises([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch favorite exercises
  const fetchFavorites = async () => {
    try {
      console.log('[Favorites] Fetching favorite exercises');
      const data = await exerciseAPI.getFavorites();
      console.log('[Favorites] Received favorites data:', data);
      
      // Check if we have a valid response with exercises
      if (data && data.exercises && Array.isArray(data.exercises)) {
        console.log(`[Favorites] Found ${data.exercises.length} favorite exercises`);
        setFavoriteExercises(data.exercises);
        
        // Create a set of favorite exercise IDs for easy lookup
        const ids = new Set<string>();
        data.exercises.forEach((exercise: Exercise) => {
          if (exercise && exercise._id) {
            console.log(`[Favorites] Adding exercise ${exercise._id} to favorites set`);
            ids.add(exercise._id);
          }
        });
        console.log(`[Favorites] Set favorite IDs, total: ${ids.size}`);
        setFavoriteIds(ids);
      } else {
        console.error('[Favorites] Invalid favorites response:', data);
        setFavoriteExercises([]);
        setFavoriteIds(new Set());
        toast({
          title: "Error loading favorites",
          description: "Received invalid data from server",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error('[Favorites] Error fetching favorites:', err);
      setFavoriteExercises([]);
      setFavoriteIds(new Set());
      toast({
        title: "Error loading favorites",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };
  
  // Load favorite exercises on component mount
  useEffect(() => {
    fetchFavorites();
  }, []);
  
  // Toggle favorite status for an exercise
  const handleToggleFavorite = async (exerciseId: string, isFavorite: boolean) => {
    try {
      console.log(`[Favorites] Toggling favorite status for exercise: ${exerciseId}, current status: ${isFavorite ? 'favorited' : 'not favorited'}`);
      
      if (isFavorite) {
        // Remove from favorites
        console.log(`[Favorites] Removing exercise ${exerciseId} from favorites`);
        await exerciseAPI.removeFavorite(exerciseId);
        console.log(`[Favorites] Successfully removed from favorites`);
        
        setFavoriteIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(exerciseId);
          console.log(`[Favorites] Updated favorite IDs set, new count: ${newSet.size}`);
          return newSet;
        });
        
        // If we're on favorites tab, remove from the displayed list
        if (currentTab === 'favorites') {
          console.log(`[Favorites] Currently on favorites tab, removing exercise from displayed list`);
          setFavoriteExercises(prev => prev.filter(ex => ex._id !== exerciseId));
        }
        
        toast({
          title: "Success",
          description: "Exercise removed from favorites",
        });
      } else {
        // Add to favorites
        console.log(`[Favorites] Adding exercise ${exerciseId} to favorites`);
        await exerciseAPI.addFavorite(exerciseId);
        console.log(`[Favorites] Successfully added to favorites`);
        
        setFavoriteIds(prev => {
          const newSet = new Set(prev).add(exerciseId);
          console.log(`[Favorites] Updated favorite IDs set, new count: ${newSet.size}`);
          return newSet;
        });
        
        // If we're on favorites tab, refresh the list
        if (currentTab === 'favorites') {
          console.log(`[Favorites] Currently on favorites tab, refreshing favorites list`);
          await fetchFavorites();
        }
        
        toast({
          title: "Success",
          description: "Exercise added to favorites",
        });
      }
    } catch (err: any) {
      console.error('[Favorites] Error toggling favorite:', err);
      toast({
        title: "Error",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };
  
  // Fetch exercises when filters change
  useEffect(() => {
    const fetchExercises = async () => {
      // Skip API call if on favorites tab - we'll use the local state instead
      if (currentTab === 'favorites') {
        setLoading(false);
        return;
      }
      
      // Skip API call if on custom tab - we'll use the local state instead
      if (currentTab === 'custom') {
        console.log('[CustomExercises] Custom tab active, fetching custom exercises');
        fetchCustomExercises();
        return;
      }
      
      // For recent exercises tab, call the dedicated API endpoint
      if (currentTab === 'recent') {
        fetchRecentExercises();
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Build query parameters
        const params: Record<string, any> = {
          page: currentPage,
          limit: MAX_EXERCISES_PER_TAB
        };
        
        if (searchTerm) params.search = searchTerm;
        
        if (bodyPartFilter !== 'all') {
          params.primary_target = bodyPartFilter.toLowerCase();
        }
        
        if (equipmentFilter !== 'all') {
          params.equipment = equipmentFilter.toLowerCase();
        }
        
        if (difficultyFilter !== 'all') {
          params.difficulty = difficultyFilter.toLowerCase();
        }
        
        if (movementTypeFilter !== 'all') {
          params.movement_type = movementTypeFilter.toLowerCase();
        }
        
        // Map tab selections to category filters
        if (currentTab === 'strength') {
          params.category = 'strength';
        } else if (currentTab === 'hypertrophy') {
          params.category = 'hypertrophy';
        } else if (currentTab === 'cardio') {
          params.category = 'cardio';
        }
        
        console.log('API params:', params); // Log for debugging
        
        const data = await exerciseAPI.getExercises(params);
        setExercises(data.exercises.slice(0, MAX_EXERCISES_PER_TAB));
        setTotalPages(data.pagination.pages);
      } catch (err: any) {
        console.error('Error fetching exercises:', err);
        setError(err.message || 'Failed to load exercises');
        toast({
          title: "Error loading exercises",
          description: err.message || "Something went wrong",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchExercises();
  }, [searchTerm, bodyPartFilter, equipmentFilter, difficultyFilter, movementTypeFilter, currentTab, currentPage, toast]);
  
  const handleResetFilters = () => {
    setSearchTerm('');
    setBodyPartFilter('all');
    setEquipmentFilter('all');
    setDifficultyFilter('all');
    setMovementTypeFilter('all');
    setCurrentPage(1);
  };
  
  // Get current displayed exercises based on current tab
  const displayedExercises = 
    currentTab === 'favorites' ? favoriteExercises.slice(0, MAX_EXERCISES_PER_TAB) : 
    currentTab === 'custom' ? customExercises.slice(0, MAX_EXERCISES_PER_TAB) : 
    currentTab === 'recent' ? recentExercises.slice(0, MAX_EXERCISES_PER_TAB) :
    exercises;
  
  return (
    <>
      <Card className="shadow-md">
        <CardContent className="p-0">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Search exercises..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
              />
            </div>
            
            <Tabs defaultValue="all" className="mt-4" onValueChange={(value) => {
              setCurrentTab(value);
              setCurrentPage(1); // Reset to first page when changing tabs
              
              // If selecting favorites tab, make sure we have the latest data
              if (value === 'favorites') {
                fetchFavorites();
              }
              
              // If selecting custom tab, fetch custom exercises
              if (value === 'custom') {
                fetchCustomExercises();
              }
              
              // If selecting recent tab, fetch recent exercises
              if (value === 'recent') {
                fetchRecentExercises();
              }
            }}>
              <TabsList className="grid grid-cols-7">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="strength">Strength</TabsTrigger>
                <TabsTrigger value="hypertrophy">Hypertrophy</TabsTrigger>
                <TabsTrigger value="cardio">Cardio</TabsTrigger>
                <TabsTrigger value="recent">
                  <History className="h-4 w-4 mr-1" />
                  Recent
                </TabsTrigger>
                <TabsTrigger value="favorites">
                  <Heart className="h-4 w-4 mr-1" />
                  Favorites
                </TabsTrigger>
                <TabsTrigger value="custom">
                  <User className="h-4 w-4 mr-1" />
                  Custom
                </TabsTrigger>
              </TabsList>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <div className="flex-1 min-w-[120px]">
                  <Select value={bodyPartFilter} onValueChange={(value) => {
                    setBodyPartFilter(value);
                    setCurrentPage(1); // Reset to first page when changing filters
                  }}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Body Part" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Body Parts</SelectItem>
                      <SelectItem value="chest">Chest</SelectItem>
                      <SelectItem value="back">Back</SelectItem>
                      <SelectItem value="legs">Legs</SelectItem>
                      <SelectItem value="shoulders">Shoulders</SelectItem>
                      <SelectItem value="arms">Arms</SelectItem>
                      <SelectItem value="biceps">Biceps</SelectItem>
                      <SelectItem value="triceps">Triceps</SelectItem>
                      <SelectItem value="core">Core</SelectItem>
                      <SelectItem value="abdominals">Abdominals</SelectItem>
                      <SelectItem value="full body">Full Body</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1 min-w-[120px]">
                  <Select value={equipmentFilter} onValueChange={(value) => {
                    setEquipmentFilter(value);
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Equipment</SelectItem>
                      <SelectItem value="barbell">Barbell</SelectItem>
                      <SelectItem value="dumbbell">Dumbbell</SelectItem>
                      <SelectItem value="machine">Machine</SelectItem>
                      <SelectItem value="cable">Cable</SelectItem>
                      <SelectItem value="bodyweight">Bodyweight</SelectItem>
                      <SelectItem value="kettlebell">Kettlebell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1 min-w-[120px]">
                  <Select value={difficultyFilter} onValueChange={(value) => {
                    setDifficultyFilter(value);
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1 min-w-[120px]">
                  <Select value={movementTypeFilter} onValueChange={(value) => {
                    setMovementTypeFilter(value);
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Movement Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="compound">Compound</SelectItem>
                      <SelectItem value="isolation">Isolation</SelectItem>
                      <SelectItem value="cardio">Cardio</SelectItem>
                      <SelectItem value="flexibility">Flexibility</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-9"
                  onClick={handleResetFilters}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Reset Filters
                </Button>
              </div>
            </Tabs>
          </div>
          
          <TabsContent value="hypertrophy" className="mt-0">
            <div className="p-3 bg-empowerfit-purple-light bg-opacity-10 border-b">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5 text-empowerfit-purple" />
                <div>
                  <h4 className="font-medium text-sm">Hypertrophy Focus</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Exercises optimized for muscle growth. Aim for 8-12 reps per set, moderate to heavy weights, and focus on time under tension.
                    Recovery is key - allow 48-72 hours between training the same muscle group.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="favorites" className="mt-0">
            <div className="p-3 bg-empowerfit-blue-light bg-opacity-10 border-b">
              <div className="flex items-start gap-2">
                <Heart className="h-4 w-4 mt-0.5 text-red-500 fill-red-500" />
                <div>
                  <h4 className="font-medium text-sm">Your Favorite Exercises</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    These are the exercises you've saved as favorites. They're easily accessible for creating workouts or quick reference.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="custom" className="mt-0">
            <div className="p-3 bg-empowerfit-green-light bg-opacity-10 border-b">
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 mt-0.5 text-empowerfit-green" />
                <div>
                  <h4 className="font-medium text-sm">Your Custom Exercises</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    These are exercises you've created. You can modify them anytime or use them in your workout routines.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="recent" className="mt-0">
            <div className="p-3 bg-empowerfit-purple-light bg-opacity-10 border-b">
              <div className="flex items-start gap-2">
                <History className="h-4 w-4 mt-0.5 text-empowerfit-purple" />
                <div>
                  <h4 className="font-medium text-sm">Recently Used Exercises</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    These are exercises you've recently viewed or worked out with. Quick access to your most used movements.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <div className="max-h-96 overflow-y-auto relative">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <Loader className="h-8 w-8 animate-spin text-empowerfit-purple" />
              </div>
            ) : error ? (
              <Alert variant="destructive" className="m-4">
                <AlertCircle className="h-4 w-4 mr-2" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : displayedExercises.length > 0 ? (
              <>
                {displayedExercises.map((exercise) => (
                  <ExerciseItem 
                    key={exercise._id} 
                    exercise={exercise} 
                    onSelect={handleSelectExercise}
                    isFavorite={favoriteIds.has(exercise._id)}
                    onToggleFavorite={handleToggleFavorite}
                    onStartWorkout={handleStartWorkout}
                  />
                ))}
                
                {totalPages > 1 && currentTab !== 'favorites' && currentTab !== 'custom' && currentTab !== 'recent' && (
                  <div className="mt-4 flex justify-center pb-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => currentPage > 1 && setCurrentPage(prev => prev - 1)}
                            aria-disabled={currentPage === 1}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                        
                        {Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                          // Show pages around current page
                          let pageToShow;
                          if (totalPages <= 5) {
                            pageToShow = i + 1;
                          } else if (currentPage <= 3) {
                            pageToShow = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageToShow = totalPages - 4 + i;
                          } else {
                            pageToShow = currentPage - 2 + i;
                          }
                          
                          return (
                            <PaginationItem key={i}>
                              <PaginationLink
                                isActive={currentPage === pageToShow}
                                onClick={() => setCurrentPage(pageToShow)}
                              >
                                {pageToShow}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => currentPage < totalPages && setCurrentPage(prev => prev + 1)}
                            aria-disabled={currentPage === totalPages}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {currentTab === 'favorites' ? (
                  <>
                    <p>No favorite exercises yet</p>
                    <p className="text-xs mt-1">Click the heart icon on exercises to add them to your favorites</p>
                  </>
                ) : currentTab === 'custom' ? (
                  <>
                    <p>No custom exercises yet</p>
                    <Button variant="outline" className="mt-2">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Exercise
                    </Button>
                  </>
                ) : currentTab === 'recent' ? (
                  <>
                    <p>No recent exercises</p>
                    <p className="text-xs mt-1">View or work out with exercises to add them to your recent list</p>
                  </>
                ) : (
                  <>
                    <p>No exercises found</p>
                    <Button variant="outline" className="mt-2">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Exercise
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    
      {/* Exercise Detail Dialog */}
      {selectedExercise && (
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedExercise.name}</DialogTitle>
              <DialogDescription>
                <div className="flex flex-wrap gap-1 mt-1">
                  <Badge variant="outline">{selectedExercise.category}</Badge>
                  <Badge variant="outline">{selectedExercise.movement_type}</Badge>
                  <Badge variant="outline" className={`ml-1 ${
                    selectedExercise.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                    selectedExercise.difficulty === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedExercise.difficulty.charAt(0).toUpperCase() + selectedExercise.difficulty.slice(1)}
                  </Badge>
                  <Badge variant="outline">{selectedExercise.equipment}</Badge>
                </div>
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 pt-4">
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleFavorite(selectedExercise._id, favoriteIds.has(selectedExercise._id))}
                  className={favoriteIds.has(selectedExercise._id) ? "border-red-300" : ""}
                >
                  <Heart className={`h-4 w-4 mr-2 ${favoriteIds.has(selectedExercise._id) ? 'fill-red-500 text-red-500' : ''}`} />
                  {favoriteIds.has(selectedExercise._id) ? 'Remove from Favorites' : 'Add to Favorites'}
                </Button>
                
                {/* Add Start Workout button */}
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    setDetailDialogOpen(false); // Close details dialog
                    handleStartWorkout(selectedExercise); // Start workout
                  }}
                  className="bg-primary"
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Start Workout
                </Button>
              </div>
              
              {/* Media */}
              {(selectedExercise.media?.image_url || selectedExercise.media?.video_url) && (
                <div className="flex justify-center">
                  {selectedExercise.media.video_url ? (
                    <video 
                      src={selectedExercise.media.video_url} 
                      controls
                      className="rounded-lg shadow-md max-h-[300px]"
                    />
                  ) : selectedExercise.media.image_url && (
                    <img 
                      src={selectedExercise.media.image_url} 
                      alt={`${selectedExercise.name} demonstration`} 
                      className="rounded-lg shadow-md max-h-[300px]"
                    />
                  )}
                </div>
              )}
              
              {/* Description */}
              {selectedExercise.description && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Description</h3>
                  <p className="text-sm text-gray-600">{selectedExercise.description}</p>
                </div>
              )}
              
              {/* Instructions */}
              {selectedExercise.instructions && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Instructions</h3>
                  <p className="text-sm text-gray-600">{selectedExercise.instructions}</p>
                </div>
              )}
              
              {/* Target Muscles */}
              <div>
                <h3 className="text-sm font-medium mb-1">Target Muscles</h3>
                <div className="flex flex-col gap-2">
                  <div>
                    <span className="text-xs text-gray-500">Primary: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedExercise.target_muscles.primary.length > 0 ? (
                        selectedExercise.target_muscles.primary.map((muscle, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">None specified</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Secondary: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedExercise.target_muscles.secondary.length > 0 ? (
                        selectedExercise.target_muscles.secondary.map((muscle, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">None specified</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Recommended rep ranges based on movement type and category */}
              <div>
                <h3 className="text-sm font-medium mb-1">Recommended</h3>
                {selectedExercise.movement_type === 'compound' && selectedExercise.category === 'strength' && (
                  <p className="text-sm text-gray-600">4-8 reps for strength focus</p>
                )}
                {selectedExercise.movement_type === 'compound' && selectedExercise.category === 'hypertrophy' && (
                  <p className="text-sm text-gray-600">8-12 reps for hypertrophy focus</p>
                )}
                {selectedExercise.movement_type === 'isolation' && (
                  <p className="text-sm text-gray-600">10-15 reps for isolation movements</p>
                )}
                {selectedExercise.category === 'cardio' && (
                  <p className="text-sm text-gray-600">15+ reps or timed intervals for cardio focus</p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Workout Flow Dialog */}
      {workoutExercise && (
        <Dialog open={workoutDialogOpen} onOpenChange={(open) => {
          if (!open) handleCancelWorkout();
          else setWorkoutDialogOpen(true);
        }}>
          <DialogContent className="sm:max-w-[600px]">
            {workoutFlowState === 'starter' ? (
              <WorkoutStarter 
                exercise={workoutExercise}
                onStart={handleBeginWorkout}
                onCancel={handleCancelWorkout}
              />
            ) : workoutFlowState === 'tracker' ? (
              <ExerciseTracker 
                exerciseId={workoutExercise._id}
                exerciseName={workoutExercise.name}
                onFinish={handleWorkoutComplete}
                onCancel={handleCancelWorkout}
              />
            ) : null}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default EnhancedExerciseDatabase;
