
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Clock, BarChart, Users, Star } from 'lucide-react';

interface WorkoutCardProps {
  title: string;
  level: string;
  duration: string;
  exercises: number;
  category: string;
  rating: number;
  popularity: number;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ 
  title, level, duration, exercises, category, rating, popularity 
}) => {
  return (
    <Card className="workout-card">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <Clock className="h-3.5 w-3.5 mr-1" />
              {duration} • {exercises} exercises
            </CardDescription>
          </div>
          <Badge variant={level === 'Beginner' ? 'outline' : level === 'Intermediate' ? 'default' : 'destructive'}>
            {level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">{category}</span>
          <div className="flex items-center">
            <Star className="h-3.5 w-3.5 text-yellow-400 mr-1 fill-yellow-400" />
            <span>{rating}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2 text-xs text-gray-500">
        <div className="flex items-center">
          <Dumbbell className="h-3.5 w-3.5 mr-1" />
          <span>Full Body</span>
        </div>
        <div className="flex items-center">
          <Users className="h-3.5 w-3.5 mr-1" />
          <span>{popularity}+ users</span>
        </div>
      </CardFooter>
    </Card>
  );
};

const WorkoutLibrary: React.FC = () => {
  const workouts = [
    {
      title: "Full Body Fundamentals",
      level: "Beginner",
      duration: "45 min",
      exercises: 8,
      category: "Strength",
      rating: 4.8,
      popularity: 2300
    },
    {
      title: "Push Pull Legs Split",
      level: "Intermediate",
      duration: "60 min",
      exercises: 12,
      category: "Hypertrophy",
      rating: 4.9,
      popularity: 1850
    },
    {
      title: "Advanced HIIT Circuit",
      level: "Advanced",
      duration: "40 min",
      exercises: 10,
      category: "Cardio",
      rating: 4.6,
      popularity: 950
    },
    {
      title: "Core Crusher",
      level: "Intermediate",
      duration: "30 min",
      exercises: 6,
      category: "Core",
      rating: 4.7,
      popularity: 1200
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-md p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Workout Library</h2>
        <button className="text-sm text-empowerfit-purple font-medium">Browse All</button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workouts.map((workout, index) => (
          <WorkoutCard key={index} {...workout} />
        ))}
      </div>
    </div>
  );
};

export default WorkoutLibrary;
