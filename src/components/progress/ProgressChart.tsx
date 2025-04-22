
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';

const strengthData = [
  { name: 'Week 1', Squat: 80, Bench: 60, Deadlift: 100 },
  { name: 'Week 2', Squat: 85, Bench: 62.5, Deadlift: 110 },
  { name: 'Week 3', Squat: 90, Bench: 65, Deadlift: 120 },
  { name: 'Week 4', Squat: 92.5, Bench: 67.5, Deadlift: 125 },
  { name: 'Week 5', Squat: 95, Bench: 70, Deadlift: 130 },
  { name: 'Week 6', Squat: 100, Bench: 72.5, Deadlift: 140 },
];

const volumeData = [
  { name: 'Week 1', Volume: 5000 },
  { name: 'Week 2', Volume: 5500 },
  { name: 'Week 3', Volume: 6000 },
  { name: 'Week 4', Volume: 5800 },
  { name: 'Week 5', Volume: 6200 },
  { name: 'Week 6', Volume: 6500 },
];

const ProgressChart: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress Tracking</CardTitle>
        <CardDescription>Track your strength and training volume</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="strength">
          <TabsList className="mb-4">
            <TabsTrigger value="strength">Strength Progress</TabsTrigger>
            <TabsTrigger value="volume">Volume</TabsTrigger>
          </TabsList>
          <TabsContent value="strength" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={strengthData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="Squat" 
                  stroke="#7E69AB" 
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="Bench" 
                  stroke="#0EA5E9" 
                />
                <Line 
                  type="monotone" 
                  dataKey="Deadlift" 
                  stroke="#10B981" 
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="volume" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={volumeData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Volume" fill="#9b87f5" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ProgressChart;
