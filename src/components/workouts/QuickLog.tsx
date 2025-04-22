import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PlusCircle, Trash2, CalendarClock, Save, Clock, Dumbbell, Loader } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { exerciseAPI, workoutLogAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Exercise {
  _id: string;
  name: string;
  target_muscles: {
    primary: string[];
    secondary: string[];
  };
  category: string;
  equipment: string;
  difficulty: string;
}

interface Set {
  weight: string;
  reps: string;
  id: string;
}

interface QuickLogProps {
  onComplete?: () => void;
}

const QuickLog: React.FC<QuickLogProps> = ({ onComplete }) => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(new Date());
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBodyPart, setSelectedBodyPart] = useState("");
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [selectedExerciseName, setSelectedExerciseName] = useState("");
  const [notes, setNotes] = useState("");
  const [useKg, setUseKg] = useState(true);
  const [sets, setSets] = useState<Set[]>([
    { weight: "", reps: "", id: "1" }
  ]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for API data
  const [categories, setCategories] = useState<string[]>([]);
  const [bodyParts, setBodyParts] = useState<string[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);

  // Fetch categories and exercises on component mount
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await exerciseAPI.getExercises({ limit: 100 });
        
        if (data && data.exercises && Array.isArray(data.exercises)) {
          setExercises(data.exercises);
          
          // Extract unique categories with proper type casting
          const uniqueCategories = Array.from(
            new Set(data.exercises.map((ex: Exercise) => ex.category))
          ).filter((category): category is string => typeof category === 'string' && Boolean(category));
          
          setCategories(uniqueCategories);
          
          // Extract unique body parts from primary target muscles
          const allBodyParts = data.exercises.flatMap((ex: Exercise) => 
            ex.target_muscles?.primary || []
          );
          
          const uniqueBodyParts = Array.from(new Set(allBodyParts))
            .filter((bodyPart): bodyPart is string => typeof bodyPart === 'string' && Boolean(bodyPart))
            .sort();
          
          setBodyParts(uniqueBodyParts);
        }
      } catch (err: any) {
        console.error('Error fetching exercises:', err);
        setError('Failed to load exercises. Please try again.');
        toast({
          title: "Error",
          description: "Failed to load exercises.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchExercises();
  }, [toast]);
  
  // Filter exercises based on selected category and body part
  useEffect(() => {
    let filtered = exercises;
    
    // Filter by category if selected
    if (selectedCategory) {
      filtered = filtered.filter(exercise => exercise.category === selectedCategory);
    }
    
    // Filter by body part if selected
    if (selectedBodyPart) {
      filtered = filtered.filter(exercise => 
        exercise.target_muscles?.primary?.includes(selectedBodyPart) ||
        exercise.target_muscles?.secondary?.includes(selectedBodyPart)
      );
    }
    
    setFilteredExercises(filtered);
    
    // Clear selected exercise if it's no longer in the filtered list
    if (selectedExerciseId && !filtered.some(ex => ex._id === selectedExerciseId)) {
      setSelectedExerciseId("");
      setSelectedExerciseName("");
    }
  }, [selectedCategory, selectedBodyPart, exercises, selectedExerciseId]);

  const handleAddSet = () => {
    setSets([...sets, { weight: "", reps: "", id: Date.now().toString() }]);
  };

  const handleRemoveSet = (id: string) => {
    if (sets.length > 1) {
      setSets(sets.filter(set => set.id !== id));
    }
  };

  const updateSet = (id: string, field: 'weight' | 'reps', value: string) => {
    setSets(sets.map(set => 
      set.id === id ? { ...set, [field]: value } : set
    ));
  };

  const handleSave = async () => {
    if (!selectedExerciseId || !sets.some(s => s.weight && s.reps)) {
      toast({
        title: "Missing information",
        description: "Please select an exercise and add at least one set with weight and reps.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setSubmitLoading(true);
      
      // Calculate duration (using a default of 15 minutes = 900 seconds)
      const duration = 900;
      
      // Format data for the API
      const workoutData = {
        exerciseId: selectedExerciseId,
        exerciseName: selectedExerciseName,
        duration: duration,
        date: date,
        sets: sets.map(set => ({
          weight: set.weight,
          reps: set.reps
        })),
        notes: notes
      };
      
      // Log the workout using the API
      await workoutLogAPI.logWorkout(workoutData);
      
      // Add to recent exercises
      try {
        await exerciseAPI.addToRecentExercises(selectedExerciseId);
      } catch (error) {
        console.error('Error adding to recent exercises:', error);
        // Non-critical, so don't show an error toast
      }
      
      toast({
        title: "Success",
        description: "Exercise logged successfully."
      });
      
      // Reset form or provide feedback
      if (onComplete) {
        onComplete();
      }
    } catch (error: any) {
      console.error('Error saving workout:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to log exercise.",
        variant: "destructive"
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory("");
    setSelectedBodyPart("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Dumbbell className="h-5 w-5 mr-2" />
          Quick Workout Log
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* Date & Time Selection */}
        <div className="flex items-center gap-4">
          <div className="space-y-2 flex-1">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarClock className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2 flex-1">
            <Label>Time</Label>
            <div className="flex items-center border rounded-md px-3 py-2">
              <Clock className="h-4 w-4 mr-2 text-gray-400" />
              <Input 
                type="time" 
                className="border-none focus-visible:outline-none focus-visible:ring-0 p-0 h-auto"
                defaultValue="12:00"
              />
            </div>
          </div>
        </div>

        {/* Category, Body Part & Exercise Selection */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={selectedCategory} 
                onValueChange={setSelectedCategory}
                disabled={loading || categories.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loading ? "Loading categories..." : "Select category"} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bodyPart">Body Part</Label>
              <Select 
                value={selectedBodyPart} 
                onValueChange={setSelectedBodyPart}
                disabled={loading || bodyParts.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loading ? "Loading body parts..." : "Select body part"} />
                </SelectTrigger>
                <SelectContent>
                  {bodyParts.map(bodyPart => (
                    <SelectItem key={bodyPart} value={bodyPart}>
                      {bodyPart.charAt(0).toUpperCase() + bodyPart.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {(selectedCategory || selectedBodyPart) && (
            <div className="flex justify-end">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClearFilters}
                className="text-xs"
              >
                Clear filters
              </Button>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="exercise">Exercise</Label>
            <Select 
              value={selectedExerciseId} 
              onValueChange={(value) => {
                setSelectedExerciseId(value);
                const exercise = exercises.find(ex => ex._id === value);
                if (exercise) {
                  setSelectedExerciseName(exercise.name);
                }
              }}
              disabled={loading || filteredExercises.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  loading ? "Loading exercises..." :
                  filteredExercises.length === 0 ? "No exercises found" :
                  "Select exercise"
                } />
              </SelectTrigger>
              <SelectContent>
                {filteredExercises.map(exercise => (
                  <SelectItem key={exercise._id} value={exercise._id}>
                    {exercise.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filteredExercises.length > 0 && (
              <p className="text-xs text-gray-500">
                {filteredExercises.length} exercises found
              </p>
            )}
          </div>
        </div>

        {/* Weight Unit Toggle */}
        <div className="flex items-center justify-between">
          <Label>Weight Unit</Label>
          <div className="flex items-center space-x-2">
            <span className="text-sm">kg</span>
            <Switch 
              checked={!useKg} 
              onCheckedChange={() => setUseKg(!useKg)} 
            />
            <span className="text-sm">lb</span>
          </div>
        </div>

        {/* Sets & Reps */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Sets & Reps</Label>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleAddSet}
              disabled={!selectedExerciseId}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Set
            </Button>
          </div>
          
          {sets.map((set, index) => (
            <div key={set.id} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                {index + 1}
              </div>
              
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder={`Weight (${useKg ? 'kg' : 'lb'})`}
                  value={set.weight}
                  onChange={(e) => updateSet(set.id, 'weight', e.target.value)}
                  disabled={!selectedExerciseId}
                />
              </div>
              
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Reps"
                  value={set.reps}
                  onChange={(e) => updateSet(set.id, 'reps', e.target.value)}
                  disabled={!selectedExerciseId}
                />
              </div>
              
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveSet(set.id)}
                disabled={sets.length <= 1 || !selectedExerciseId}
              >
                <Trash2 className="h-4 w-4 text-gray-400" />
              </Button>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            placeholder="Add any notes about this exercise..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Save Button */}
        <Button 
          onClick={handleSave} 
          className="w-full gradient-purple"
          disabled={submitLoading || !selectedExerciseId || !sets.some(s => s.weight && s.reps)}
        >
          {submitLoading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Exercise
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickLog;
