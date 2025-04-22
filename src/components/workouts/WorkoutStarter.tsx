import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, ArrowLeft } from 'lucide-react';

interface WorkoutStarterProps {
  exercise: {
    _id: string;
    name: string;
    description?: string;
    instructions?: string;
    equipment?: string;
    target_muscles?: {
      primary: string[];
      secondary: string[];
    };
    media?: {
      image_url?: string;
      video_url?: string;
    };
  };
  onStart: () => void;
  onCancel: () => void;
}

const WorkoutStarter: React.FC<WorkoutStarterProps> = ({ 
  exercise, 
  onStart, 
  onCancel 
}) => {
  return (
    <div className="flex flex-col items-center space-y-6 p-4">
      <h2 className="text-2xl font-bold text-center">{exercise.name}</h2>
      
      {/* Exercise details */}
      <Card className="w-full">
        <CardContent className="p-6">
          {/* Exercise details */}
          {exercise.description && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2">Description</h3>
              <p className="text-sm text-gray-600">{exercise.description}</p>
            </div>
          )}
          
          {exercise.instructions && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2">Instructions</h3>
              <p className="text-sm text-gray-600">{exercise.instructions}</p>
            </div>
          )}
          
          {exercise.equipment && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2">Equipment</h3>
              <p className="text-sm text-gray-600">{exercise.equipment}</p>
            </div>
          )}
          
          {/* Media (if available) */}
          {(exercise.media?.image_url || exercise.media?.video_url) && (
            <div className="mt-4 flex justify-center">
              {exercise.media.video_url ? (
                <video 
                  src={exercise.media.video_url} 
                  controls
                  className="rounded-lg shadow-md max-h-[200px]"
                />
              ) : exercise.media.image_url && (
                <img 
                  src={exercise.media.image_url} 
                  alt={`${exercise.name} demonstration`} 
                  className="rounded-lg shadow-md max-h-[200px]"
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Start button */}
      <div className="flex flex-col items-center space-y-6">
        <Button 
          onClick={onStart}
          size="lg" 
          className="h-24 w-24 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center"
        >
          <PlayCircle className="h-12 w-12" />
        </Button>
        <p className="text-center text-gray-600 font-medium">Tap to Start Workout</p>
      </div>
      
      {/* Back button */}
      <Button variant="outline" onClick={onCancel} className="mt-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Exercises
      </Button>
    </div>
  );
};

export default WorkoutStarter; 