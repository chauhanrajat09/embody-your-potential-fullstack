
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, ChevronRight, Dumbbell, Heart, Award, 
  BarChart2, User, Play, Plus 
} from 'lucide-react';

interface ExerciseProps {
  name: string;
  target: string;
  equipment: string;
  difficulty: string;
  personalRecord?: string;
}

const ExerciseItem: React.FC<ExerciseProps> = ({ 
  name, target, equipment, difficulty, personalRecord 
}) => {
  return (
    <div className="flex items-center justify-between p-3 border-b hover:bg-gray-50">
      <div className="flex items-center">
        <div className="bg-empowerfit-gray-light p-2 rounded-lg mr-3">
          <Dumbbell className="h-6 w-6 text-empowerfit-purple" />
        </div>
        <div>
          <h3 className="font-medium">{name}</h3>
          <div className="flex text-xs text-gray-500 mt-0.5">
            <span>{target}</span>
            <span className="mx-1.5">•</span>
            <span>{equipment}</span>
            <span className="mx-1.5">•</span>
            <span>{difficulty}</span>
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
        <div className="flex">
          <Button variant="ghost" size="icon">
            <Play className="h-4 w-4 text-empowerfit-blue" />
          </Button>
          <Button variant="ghost" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const ExerciseDatabase: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const exercises = [
    {
      name: "Barbell Back Squat",
      target: "Legs",
      equipment: "Barbell",
      difficulty: "Intermediate",
      personalRecord: "100kg"
    },
    {
      name: "Bench Press",
      target: "Chest",
      equipment: "Barbell",
      difficulty: "Intermediate",
      personalRecord: "75kg"
    },
    {
      name: "Deadlift",
      target: "Back",
      equipment: "Barbell",
      difficulty: "Intermediate",
      personalRecord: "140kg"
    },
    {
      name: "Pull-Up",
      target: "Back",
      equipment: "Bodyweight",
      difficulty: "Intermediate"
    },
    {
      name: "Shoulder Press",
      target: "Shoulders",
      equipment: "Dumbbell",
      difficulty: "Beginner"
    }
  ];
  
  const filteredExercises = exercises.filter(exercise => 
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exercise.target.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="shadow-md">
      <CardContent className="p-0">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              placeholder="Search exercises..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Tabs defaultValue="all" className="mt-4">
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="favorites">
                <Heart className="h-4 w-4 mr-1" />
                Favorites
              </TabsTrigger>
              <TabsTrigger value="recent">
                <BarChart2 className="h-4 w-4 mr-1" />
                Recent
              </TabsTrigger>
              <TabsTrigger value="custom">
                <User className="h-4 w-4 mr-1" />
                Custom
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {filteredExercises.length > 0 ? (
            filteredExercises.map((exercise, index) => (
              <ExerciseItem key={index} {...exercise} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No exercises found</p>
              <Button variant="outline" className="mt-2">
                <Plus className="h-4 w-4 mr-2" />
                Create Exercise
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseDatabase;
