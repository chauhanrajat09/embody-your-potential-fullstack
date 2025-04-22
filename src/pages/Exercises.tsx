import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import EnhancedExerciseDatabase from '@/components/workouts/EnhancedExerciseDatabase';
import QuickLog from '@/components/workouts/QuickLog';
import ExerciseHistory from '@/components/workouts/ExerciseHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, List, Clock, Loader } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { exerciseAPI } from '@/lib/api';

// Add CreateExerciseForm component
const CreateExerciseForm = ({ onComplete }) => {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [primaryMuscles, setPrimaryMuscles] = useState([]);
  const [secondaryMuscles, setSecondaryMuscles] = useState([]);
  const [category, setCategory] = useState('strength');
  const [movementType, setMovementType] = useState('compound');
  const [equipment, setEquipment] = useState('bodyweight');
  const [difficulty, setDifficulty] = useState('beginner');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  
  const muscleOptions = [
    'chest', 'back', 'shoulders', 'arms', 'biceps', 'triceps',
    'legs', 'quadriceps', 'hamstrings', 'glutes', 'calves',
    'core', 'abdominals', 'obliques', 'lower back', 'full body'
  ];
  
  const handleSubmit = async () => {
    if (!name) {
      toast({
        title: "Missing information",
        description: "Exercise name is required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      
      const exerciseData = {
        name,
        description,
        instructions,
        target_muscles: {
          primary: primaryMuscles,
          secondary: secondaryMuscles
        },
        category,
        movement_type: movementType,
        equipment,
        difficulty,
        media: {
          image_url: imageUrl || undefined,
          video_url: videoUrl || undefined
        }
      };
      
      await exerciseAPI.createExercise(exerciseData);
      
      toast({
        title: "Exercise created",
        description: "Your custom exercise has been added to the database",
      });
      
      onComplete();
    } catch (error) {
      console.error('Error creating exercise:', error);
      toast({
        title: "Failed to create exercise",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Exercise Name *</Label>
        <Input 
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Bulgarian Split Squat"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A brief description of the exercise..."
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="instructions">Instructions</Label>
        <Textarea 
          id="instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Step-by-step instructions for proper form..."
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="strength">Strength</SelectItem>
              <SelectItem value="hypertrophy">Hypertrophy</SelectItem>
              <SelectItem value="cardio">Cardio</SelectItem>
              <SelectItem value="flexibility">Flexibility</SelectItem>
              <SelectItem value="balance">Balance</SelectItem>
              <SelectItem value="plyometric">Plyometric</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="movement-type">Movement Type</Label>
          <Select value={movementType} onValueChange={setMovementType}>
            <SelectTrigger id="movement-type">
              <SelectValue placeholder="Select movement type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="compound">Compound</SelectItem>
              <SelectItem value="isolation">Isolation</SelectItem>
              <SelectItem value="cardio">Cardio</SelectItem>
              <SelectItem value="flexibility">Flexibility</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="equipment">Equipment</Label>
          <Select value={equipment} onValueChange={setEquipment}>
            <SelectTrigger id="equipment">
              <SelectValue placeholder="Select equipment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="barbell">Barbell</SelectItem>
              <SelectItem value="dumbbell">Dumbbell</SelectItem>
              <SelectItem value="kettlebell">Kettlebell</SelectItem>
              <SelectItem value="machine">Machine</SelectItem>
              <SelectItem value="cable">Cable</SelectItem>
              <SelectItem value="bodyweight">Bodyweight</SelectItem>
              <SelectItem value="resistance band">Resistance Band</SelectItem>
              <SelectItem value="medicine ball">Medicine Ball</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty</Label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger id="difficulty">
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Target Muscles (Primary)</Label>
        <Select
          value={primaryMuscles.length > 0 ? primaryMuscles[0] : undefined}
          onValueChange={(value) => setPrimaryMuscles([value])}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select primary muscle" />
          </SelectTrigger>
          <SelectContent>
            {muscleOptions.map((muscle) => (
              <SelectItem key={muscle} value={muscle}>
                {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label>Target Muscles (Secondary)</Label>
        <Select
          value=""
          onValueChange={(value) => {
            if (!secondaryMuscles.includes(value)) {
              setSecondaryMuscles([...secondaryMuscles, value]);
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select secondary muscles" />
          </SelectTrigger>
          <SelectContent>
            {muscleOptions.map((muscle) => (
              <SelectItem key={muscle} value={muscle}>
                {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {secondaryMuscles.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {secondaryMuscles.map((muscle) => (
              <div key={muscle} className="bg-gray-100 px-2 py-1 rounded text-sm flex items-center">
                {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
                <button
                  className="ml-1 text-gray-500 hover:text-gray-700"
                  onClick={() => setSecondaryMuscles(secondaryMuscles.filter(m => m !== muscle))}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="image-url">Image URL (optional)</Label>
        <Input 
          id="image-url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="video-url">Video URL (optional)</Label>
        <Input 
          id="video-url"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://example.com/video.mp4"
        />
      </div>
      
      <DialogFooter>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="gradient-purple w-full mt-4"
        >
          {loading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Exercise'
          )}
        </Button>
      </DialogFooter>
    </div>
  );
};

const Exercises: React.FC = () => {
  const [openQuickLog, setOpenQuickLog] = useState(false);
  const [openCreateExercise, setOpenCreateExercise] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleQuickLogComplete = () => {
    setOpenQuickLog(false);
    toast({
      title: "Exercise logged",
      description: "Your exercise has been saved successfully.",
    });
  };
  
  const handleCreateExerciseComplete = () => {
    setOpenCreateExercise(false);
    toast({
      title: "Exercise created", 
      description: "Your custom exercise has been added to the database.",
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activePage="exercises" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader username={user?.name || 'User'} />
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Exercise Library</h1>
            <div className="flex gap-2">
              <Dialog open={openQuickLog} onOpenChange={setOpenQuickLog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Clock className="mr-2 h-4 w-4" /> Quick Log
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Quick Log Exercise</DialogTitle>
                    <DialogDescription>
                      Quickly log a single exercise without creating a full workout.
                    </DialogDescription>
                  </DialogHeader>
                  <QuickLog onComplete={handleQuickLogComplete} />
                </DialogContent>
              </Dialog>
              
              <Dialog open={openCreateExercise} onOpenChange={setOpenCreateExercise}>
                <DialogTrigger asChild>
                  <Button className="gradient-purple">
                    <Plus className="mr-2 h-4 w-4" /> Create Exercise
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Create Custom Exercise</DialogTitle>
                    <DialogDescription>
                      Add your own exercise to the database. This will only be visible to you.
                    </DialogDescription>
                  </DialogHeader>
                  <CreateExerciseForm onComplete={handleCreateExerciseComplete} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <Tabs defaultValue="database">
            <TabsList className="mb-6">
              <TabsTrigger value="database">Exercise Database</TabsTrigger>
              <TabsTrigger value="recent">Recent Exercises</TabsTrigger>
              <TabsTrigger value="history">Exercise History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="database" className="mt-0">
              <EnhancedExerciseDatabase />
            </TabsContent>
            
            <TabsContent value="recent" className="mt-0">
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <List className="h-12 w-12 text-empowerfit-purple mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold mb-2">No Recent Exercises</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Log your first exercise to see it appear here.
                </p>
                <Button className="gradient-purple" onClick={() => setOpenQuickLog(true)}>
                  <Clock className="mr-2 h-4 w-4" /> Quick Log Exercise
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="mt-0">
              <ExerciseHistory />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Exercises;
