import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Database, PlayCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { workoutLogAPI } from '@/lib/api';
import { exerciseAPI } from '@/lib/api';

const TestDataGenerator: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [numberOfWorkouts, setNumberOfWorkouts] = useState(5);
  const [exercises, setExercises] = useState<any[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [generatingProgress, setGeneratingProgress] = useState(0);

  React.useEffect(() => {
    // Fetch some exercises to use for test data
    const fetchExercises = async () => {
      try {
        const data = await exerciseAPI.getExercises({ limit: 10 });
        if (data.exercises && data.exercises.length > 0) {
          setExercises(data.exercises);
          setSelectedExerciseId(data.exercises[0]._id);
        }
      } catch (error) {
        console.error('Error fetching exercises for test data generator:', error);
      }
    };

    fetchExercises();
  }, []);

  const generateTestData = async () => {
    if (!selectedExerciseId) {
      toast({
        title: 'Error',
        description: 'Please select an exercise first',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      setGeneratingProgress(0);
      
      const exercise = exercises.find(ex => ex._id === selectedExerciseId);
      
      if (!exercise) {
        throw new Error('Selected exercise not found');
      }
      
      toast({
        title: 'Generating test data',
        description: `Creating ${numberOfWorkouts} workout logs...`,
      });
      
      // Create workout logs over the past 30 days
      for (let i = 0; i < numberOfWorkouts; i++) {
        // Update progress
        setGeneratingProgress(Math.round((i / numberOfWorkouts) * 100));
        
        // Random date in the past 30 days
        const daysAgo = Math.floor(Math.random() * 30);
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        
        // Random duration between 20-60 minutes (in seconds)
        const duration = (Math.floor(Math.random() * 40) + 20) * 60;
        
        // Generate 3-5 sets
        const numSets = Math.floor(Math.random() * 3) + 3;
        const sets = [];
        
        for (let j = 0; j < numSets; j++) {
          // Random weight between 10-100kg
          const weight = Math.floor(Math.random() * 90) + 10;
          // Random reps between 6-15
          const reps = Math.floor(Math.random() * 10) + 6;
          
          sets.push({
            weight: weight.toString(),
            reps: reps.toString(),
            notes: ''
          });
        }
        
        // Log the workout
        await workoutLogAPI.logWorkout({
          exerciseId: exercise._id,
          exerciseName: exercise.name,
          duration,
          date,
          sets,
          notes: `Test workout #${i+1}`
        });
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      setGeneratingProgress(100);
      
      toast({
        title: 'Success',
        description: `Created ${numberOfWorkouts} test workout logs successfully.`,
      });
    } catch (error: any) {
      console.error('Error generating test data:', error);
      toast({
        title: 'Error',
        description: `Failed to generate test data: ${error.message || 'Unknown error'}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Workout Test Data Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="exercise-select">Select Exercise</Label>
          <Select
            value={selectedExerciseId}
            onValueChange={setSelectedExerciseId}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an exercise" />
            </SelectTrigger>
            <SelectContent>
              {exercises.map(exercise => (
                <SelectItem key={exercise._id} value={exercise._id}>
                  {exercise.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="num-workouts">Number of Workouts</Label>
            <span className="text-sm font-medium">{numberOfWorkouts}</span>
          </div>
          <Slider
            id="num-workouts"
            min={1}
            max={30}
            step={1}
            value={[numberOfWorkouts]}
            onValueChange={(values) => setNumberOfWorkouts(values[0])}
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground">
            This will generate {numberOfWorkouts} workout logs with random dates over the past month.
          </p>
        </div>
        
        {generatingProgress > 0 && (
          <div className="space-y-1">
            <div className="text-sm">Generating: {generatingProgress}%</div>
            <div className="h-2 w-full bg-secondary overflow-hidden rounded-full">
              <div 
                className="h-full bg-primary" 
                style={{ width: `${generatingProgress}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={generateTestData} 
          disabled={loading || !selectedExerciseId}
          className="w-full"
        >
          <PlayCircle className="mr-2 h-4 w-4" />
          Generate Test Data
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TestDataGenerator; 