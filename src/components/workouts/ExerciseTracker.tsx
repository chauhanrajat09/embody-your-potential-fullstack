import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  PlayCircle, PauseCircle, TimerReset, Plus, CheckCircle, 
  Save, Coffee, Timer, ArrowLeft
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from '@/hooks/use-toast';

interface Set {
  id: string;
  weight: string;
  reps: string;
  notes: string;
}

interface ExerciseTrackerProps {
  exerciseId?: string;
  exerciseName: string;
  onFinish: (data: any) => void;
  onCancel: () => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const ExerciseTracker: React.FC<ExerciseTrackerProps> = ({ 
  exerciseId, 
  exerciseName, 
  onFinish, 
  onCancel 
}) => {
  // Timer state
  const [timerActive, setTimerActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [restTime, setRestTime] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Exercise tracking state
  const [sets, setSets] = useState<Set[]>([
    { id: '1', weight: '', reps: '', notes: '' }
  ]);
  const [notes, setNotes] = useState('');
  const { toast } = useToast();

  // Start main workout timer when component mounts
  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Timer functions
  const startTimer = () => {
    setTimerActive(true);
    timerRef.current = setInterval(() => {
      if (isResting) {
        setRestTime(prev => {
          if (prev <= 1) {
            toast({
              title: 'Rest complete!',
              description: 'Time to start your next set!'
            });
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      } else {
        setElapsedTime(prev => prev + 1);
      }
    }, 1000);
  };

  const pauseTimer = () => {
    setTimerActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const resetTimer = () => {
    pauseTimer();
    setElapsedTime(0);
    startTimer();
  };

  const startRest = (seconds = 60) => {
    setIsResting(true);
    setRestTime(seconds);
    if (!timerActive) {
      startTimer();
    }
  };

  // Set management
  const addSet = () => {
    setSets([...sets, { id: Date.now().toString(), weight: '', reps: '', notes: '' }]);
  };

  const updateSet = (id: string, field: keyof Set, value: string) => {
    setSets(sets.map(set => 
      set.id === id ? { ...set, [field]: value } : set
    ));
  };

  const handleFinish = () => {
    // Validate that at least one set has data
    const hasCompletedSet = sets.some(set => set.weight && set.reps);
    
    if (!hasCompletedSet) {
      toast({
        title: 'Missing data',
        description: 'Please complete at least one set before finishing',
        variant: 'destructive'
      });
      return;
    }

    // Prepare data for saving
    const workoutData = {
      exerciseId,
      exerciseName,
      duration: elapsedTime,
      date: new Date(),
      sets: sets.filter(set => set.weight && set.reps), // Only include completed sets
      notes
    };

    onFinish(workoutData);
  };

  return (
    <div className="space-y-4">
      {/* Timer */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">{exerciseName}</h2>
            
            {isResting ? (
              <div className="space-y-2">
                <Badge variant="secondary" className="mb-2">REST TIME</Badge>
                <div className="text-4xl font-bold text-orange-500">{formatTime(restTime)}</div>
                <Progress value={(restTime / 60) * 100} className="h-2 mt-2" />
              </div>
            ) : (
              <div>
                <Badge variant="outline" className="mb-2">WORKOUT TIME</Badge>
                <div className="text-4xl font-bold">{formatTime(elapsedTime)}</div>
              </div>
            )}
            
            <div className="flex justify-center gap-2 mt-4">
              {timerActive ? (
                <Button onClick={pauseTimer} variant="outline" size="icon">
                  <PauseCircle className="h-5 w-5" />
                </Button>
              ) : (
                <Button onClick={startTimer} variant="outline" size="icon">
                  <PlayCircle className="h-5 w-5" />
                </Button>
              )}
              
              <Button onClick={resetTimer} variant="outline" size="icon">
                <TimerReset className="h-5 w-5" />
              </Button>
              
              <Button onClick={() => startRest(60)} variant="outline">
                <Coffee className="h-4 w-4 mr-2" />
                Rest (1m)
              </Button>
              
              <Button onClick={() => startRest(90)} variant="outline">
                <Coffee className="h-4 w-4 mr-2" />
                Rest (1.5m)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Sets */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex justify-between items-center">
            <span>Sets</span>
            <Button size="sm" onClick={addSet} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Set
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sets.map((set, index) => (
              <div key={set.id} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-1">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-medium">
                    {index + 1}
                  </div>
                </div>
                
                <div className="col-span-4 sm:col-span-3">
                  <Input
                    type="number"
                    placeholder="Weight"
                    value={set.weight}
                    onChange={(e) => updateSet(set.id, 'weight', e.target.value)}
                  />
                </div>
                
                <div className="col-span-4 sm:col-span-3">
                  <Input
                    type="number"
                    placeholder="Reps"
                    value={set.reps}
                    onChange={(e) => updateSet(set.id, 'reps', e.target.value)}
                  />
                </div>
                
                <div className="col-span-3 sm:col-span-5">
                  <Input
                    placeholder="Notes"
                    value={set.notes}
                    onChange={(e) => updateSet(set.id, 'notes', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Notes */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add any notes about this exercise..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </CardContent>
      </Card>
      
      {/* Controls */}
      <div className="flex gap-2 mt-6">
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button className="flex-1 bg-primary" onClick={handleFinish}>
          <CheckCircle className="h-4 w-4 mr-2" />
          Finish Exercise
        </Button>
      </div>
    </div>
  );
};

export default ExerciseTracker; 