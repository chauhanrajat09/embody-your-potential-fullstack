
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PlayCircle, Clock, CalendarClock } from 'lucide-react';

const TodayWorkout: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Today's Workout</h2>
        <Button variant="outline" size="sm" className="text-xs">
          <CalendarClock className="mr-1 h-3 w-3" /> Schedule
        </Button>
      </div>
      
      <div className="bg-empowerfit-gray-light rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Upper Body Power</h3>
            <p className="text-sm text-gray-500 flex items-center mt-1">
              <Clock className="h-3 w-3 mr-1" /> 45-60 min • 6 exercises
            </p>
          </div>
          <Button size="sm" className="gradient-purple">
            <PlayCircle className="mr-2 h-4 w-4" /> Start
          </Button>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>0/6 completed</span>
          </div>
          <Progress value={0} className="h-2" />
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-sm text-gray-500 mb-2">No workout planned?</p>
        <div className="flex flex-wrap gap-2 justify-center">
          <Button variant="outline" size="sm" className="text-xs">Quick Session</Button>
          <Button variant="outline" size="sm" className="text-xs">Browse Workouts</Button>
          <Button variant="outline" size="sm" className="text-xs">Create New</Button>
        </div>
      </div>
    </div>
  );
};

export default TodayWorkout;
