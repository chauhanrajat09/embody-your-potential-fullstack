import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { AlertCircle, CalendarIcon, Download, LineChart, Loader, Scale, Settings2, Trash2, Target } from 'lucide-react';
import { cn } from "@/lib/utils";
import WeightChart from './WeightChart';
import { weightAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface WeightEntry {
  _id: string;
  date: Date;
  weight: number;
  bodyFat?: number;
  notes?: string;
  unit: string;
  timeOfDay?: string;
  createdAt: string;
  updatedAt: string;
}

interface WeightGoal {
  _id: string;
  targetWeight: number;
  targetDate: Date;
  unit: string;
  notes?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

const WeightTracking: React.FC = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(new Date());
  const [weight, setWeight] = useState<string>('');
  const [bodyFat, setBodyFat] = useState<string>('');
  const [timeOfDay, setTimeOfDay] = useState<string>('morning');
  const [notes, setNotes] = useState<string>('');
  const [useKg, setUseKg] = useState<boolean>(true);
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [chartPeriod, setChartPeriod] = useState<'7' | '30' | '90'>('30');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [goal, setGoal] = useState<WeightGoal | null>(null);
  
  // Goal dialog states
  const [goalDialogOpen, setGoalDialogOpen] = useState<boolean>(false);
  const [goalWeight, setGoalWeight] = useState<string>('');
  const [goalDate, setGoalDate] = useState<Date>(new Date());
  const [goalNotes, setGoalNotes] = useState<string>('');
  const [goalSubmitting, setGoalSubmitting] = useState<boolean>(false);

  // Fetch weight entries on component mount
  useEffect(() => {
    fetchWeightLogs();
    fetchWeightStats();
    fetchWeightGoal();
  }, []);

  const fetchWeightLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await weightAPI.getWeightLogs();
      
      // Convert string dates to Date objects
      const formattedData = data.map((entry: any) => ({
        ...entry,
        date: new Date(entry.date)
      }));
      
      setWeights(formattedData);
    } catch (err) {
      console.error('Error fetching weight logs:', err);
      setError('Failed to load weight logs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeightStats = async () => {
    try {
      const data = await weightAPI.getWeightStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching weight stats:', err);
    }
  };

  const fetchWeightGoal = async () => {
    try {
      const goalData = await weightAPI.getWeightGoal();
      // Convert target date from string to Date object
      setGoal({
        ...goalData,
        targetDate: new Date(goalData.targetDate)
      });
    } catch (err: any) {
      // It's normal to get a 404 if no goal exists
      if (err.message && err.message.includes('No weight goal found')) {
        setGoal(null);
      } else {
        console.error('Error fetching weight goal:', err);
      }
    }
  };

  const handleAddWeight = async () => {
    if (!weight || parseFloat(weight) <= 0) {
      toast({
        title: "Invalid weight",
        description: "Please enter a valid weight value.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      const weightData = {
        weight: parseFloat(weight),
        unit: useKg ? 'kg' : 'lbs',
        notes: notes || undefined,
        date: date.toISOString()
      };
      
      // Save to database
      await weightAPI.logWeight(weightData);
      
      toast({
        title: "Weight logged",
        description: "Your weight has been successfully logged.",
      });
      
      // Refresh data
      fetchWeightLogs();
      fetchWeightStats();
      
      // Clear form
      setWeight('');
      setBodyFat('');
      setNotes('');
      setDate(new Date());
    } catch (err) {
      console.error('Error logging weight:', err);
      toast({
        title: "Error",
        description: "Failed to log weight. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    
    try {
      await weightAPI.deleteWeightLog(id);
      toast({
        title: "Entry deleted",
        description: "Weight entry has been removed.",
      });
      fetchWeightLogs();
      fetchWeightStats();
    } catch (err) {
      console.error('Error deleting weight entry:', err);
      toast({
        title: "Error",
        description: "Failed to delete entry. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportData = () => {
    // Export to CSV
    const headers = ['Date', 'Weight', 'Unit', 'Notes'];
    const csvData = weights.map(entry => {
      return [
        format(entry.date, 'yyyy-MM-dd'),
        entry.weight,
        entry.unit,
        entry.notes || ''
      ].join(',');
    });
    
    const csv = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weight-data-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Format stats message
  const getStatsMessage = () => {
    if (!stats || !stats.currentWeight) return null;
    
    const changeText = stats.weightChange !== 0 
      ? `${stats.weightChange > 0 ? '+' : ''}${stats.weightChange.toFixed(1)} ${useKg ? 'kg' : 'lbs'} (${stats.weightChangePct.toFixed(1)}%)` 
      : 'No change';
      
    return `Current: ${stats.currentWeight} ${useKg ? 'kg' : 'lbs'} | Change: ${changeText}`;
  };

  // Calculate calorie deficit/surplus needed
  const calculateCaloriesNeeded = () => {
    if (!goal || !stats || !stats.currentWeight) return null;
    
    // Calculate weight difference in kg
    const currentWeight = stats.currentWeight;
    const targetWeight = goal.targetWeight;
    const weightDiff = useKg 
      ? targetWeight - currentWeight // Already in kg
      : (targetWeight - currentWeight) * 0.453592; // Convert from lbs to kg
    
    // Calculate days remaining
    const today = new Date();
    const targetDate = goal.targetDate;
    const daysRemaining = Math.max(1, Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Calculate total calories (1kg = approx 7700 calories)
    const totalCalories = weightDiff * 7700;
    
    // Daily calorie deficit/surplus needed
    const dailyCalories = Math.round(totalCalories / daysRemaining);
    
    return {
      weightDiff: weightDiff.toFixed(1),
      daysRemaining,
      dailyCalories,
      isDeficit: dailyCalories < 0
    };
  };

  const handleSetGoal = async () => {
    if (!goalWeight || parseFloat(goalWeight) <= 0) {
      toast({
        title: "Invalid goal weight",
        description: "Please enter a valid weight value for your goal.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setGoalSubmitting(true);
      
      const goalData = {
        targetWeight: parseFloat(goalWeight),
        targetDate: goalDate.toISOString(),
        unit: useKg ? 'kg' : 'lbs',
        notes: goalNotes || undefined
      };
      
      // Save to database
      await weightAPI.setWeightGoal(goalData);
      
      toast({
        title: "Weight goal set",
        description: "Your weight goal has been successfully saved.",
      });
      
      // Refresh goal data
      fetchWeightGoal();
      
      // Close dialog
      setGoalDialogOpen(false);
    } catch (err) {
      console.error('Error setting weight goal:', err);
      toast({
        title: "Error",
        description: "Failed to set weight goal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGoalSubmitting(false);
    }
  };

  const handleDeleteGoal = async () => {
    if (!confirm('Are you sure you want to delete your weight goal?')) return;
    
    try {
      await weightAPI.deleteWeightGoal();
      toast({
        title: "Goal deleted",
        description: "Your weight goal has been removed.",
      });
      setGoal(null);
      setGoalDialogOpen(false);
    } catch (err) {
      console.error('Error deleting weight goal:', err);
      toast({
        title: "Error",
        description: "Failed to delete goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCompleteGoal = async () => {
    if (!confirm('Mark this goal as completed?')) return;
    
    try {
      await weightAPI.completeWeightGoal();
      toast({
        title: "Goal completed",
        description: "Congratulations on achieving your weight goal!",
      });
      fetchWeightGoal();
    } catch (err) {
      console.error('Error completing weight goal:', err);
      toast({
        title: "Error",
        description: "Failed to mark goal as completed. Please try again.",
        variant: "destructive",
      });
    }
  };

  // When opening the goal dialog, initialize form with current goal data if it exists
  const handleOpenGoalDialog = () => {
    if (goal) {
      setGoalWeight(goal.targetWeight.toString());
      setGoalDate(goal.targetDate);
      setGoalNotes(goal.notes || '');
    } else {
      setGoalWeight('');
      setGoalDate(new Date());
      setGoalNotes('');
    }
    setGoalDialogOpen(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Scale className="h-5 w-5 mr-2" />
            Log Weight
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
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
                    <CalendarIcon className="mr-2 h-4 w-4" />
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

            <div className="space-y-2">
              <Label>Time of Day</Label>
              <Select defaultValue={timeOfDay} onValueChange={setTimeOfDay}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time of day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="afternoon">Afternoon</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Weight</Label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">kg</span>
                  <Switch 
                    checked={useKg} 
                    onCheckedChange={setUseKg} 
                  />
                  <span className="text-sm text-gray-500">lb</span>
                </div>
              </div>
              <Input 
                type="number" 
                placeholder={`Weight in ${useKg ? 'kg' : 'lb'}`}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea 
                placeholder="Any notes about this measurement..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={submitting}
              />
            </div>

            <Button 
              className="w-full gradient-purple" 
              onClick={handleAddWeight}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Weight Entry'
              )}
            </Button>
            
            {stats && stats.currentWeight && (
              <Alert className="mt-4">
                <AlertDescription className="text-sm">
                  {getStatsMessage()}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <LineChart className="h-5 w-5 mr-2" />
              Weight Progress
            </CardTitle>
            <div className="flex space-x-2">
              <Tabs defaultValue="30" value={chartPeriod} onValueChange={value => setChartPeriod(value as '7' | '30' | '90')}>
                <TabsList>
                  <TabsTrigger value="7">7d</TabsTrigger>
                  <TabsTrigger value="30">30d</TabsTrigger>
                  <TabsTrigger value="90">90d</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleExportData}
                disabled={weights.length === 0}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleOpenGoalDialog}
              >
                <Target className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-[300px]">
              <Loader className="h-6 w-6 animate-spin text-empowerfit-purple" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <WeightChart 
                weights={weights} 
                period={chartPeriod} 
                useKg={useKg} 
                goalWeight={goal?.targetWeight}
              />
              
              {goal && !goal.completed && (
                <Alert className="mt-4">
                  <AlertDescription className="text-sm flex justify-between items-center">
                    <span>
                      Goal: {goal.targetWeight} {goal.unit} by {format(goal.targetDate, 'MMM dd, yyyy')}
                      {goal.notes && ` - ${goal.notes}`}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleCompleteGoal}
                    >
                      Mark Complete
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              
              {goal && !goal.completed && stats && stats.currentWeight && (
                <Alert className="mt-2">
                  {(() => {
                    const caloriesNeeded = calculateCaloriesNeeded();
                    if (!caloriesNeeded) return null;
                    
                    const { weightDiff, daysRemaining, dailyCalories, isDeficit } = caloriesNeeded;
                    const unit = useKg ? 'kg' : 'lbs';
                    
                    return (
                      <AlertDescription className="text-sm">
                        {parseFloat(weightDiff) > 0 
                          ? `To gain ${Math.abs(parseFloat(weightDiff)).toFixed(1)} ${useKg ? 'kg' : 'lbs'} in ${daysRemaining} days` 
                          : `To lose ${Math.abs(parseFloat(weightDiff)).toFixed(1)} ${useKg ? 'kg' : 'lbs'} in ${daysRemaining} days`}
                        , you need a daily {isDeficit ? 'deficit' : 'surplus'} of {Math.abs(dailyCalories)} calories.
                      </AlertDescription>
                    );
                  })()}
                </Alert>
              )}
              
              {goal && goal.completed && (
                <Alert className="mt-4">
                  <AlertDescription className="text-sm">
                    Goal Completed: {goal.targetWeight} {goal.unit} by {format(goal.targetDate, 'MMM dd, yyyy')}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="mt-6">
                <h3 className="font-medium mb-2">Recent Entries</h3>
                {weights.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No weight entries yet. Add your first weight entry to see it here.
                  </p>
                ) : (
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr>
                          <th className="text-left pb-2">Date</th>
                          <th className="text-left pb-2">Weight</th>
                          <th className="text-left pb-2">Notes</th>
                          <th className="text-right pb-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {weights.slice(0, 10).map((entry) => (
                          <tr key={entry._id} className="border-t border-gray-100">
                            <td className="py-2">{format(entry.date, 'MMM dd, yyyy')}</td>
                            <td className="py-2">{entry.weight} {entry.unit}</td>
                            <td className="py-2 text-gray-500 truncate max-w-[200px]">
                              {entry.notes || '-'}
                            </td>
                            <td className="py-2 text-right">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDeleteEntry(entry._id)}
                              >
                                <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Weight Goal Dialog */}
      <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{goal ? 'Update Weight Goal' : 'Set Weight Goal'}</DialogTitle>
            <DialogDescription>
              Setting a weight goal helps you track your progress toward your target weight.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Target Weight ({useKg ? 'kg' : 'lb'})</Label>
              <Input 
                type="number" 
                placeholder={`Target weight in ${useKg ? 'kg' : 'lb'}`}
                value={goalWeight}
                onChange={(e) => setGoalWeight(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Target Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !goalDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {goalDate ? format(goalDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={goalDate}
                    onSelect={(newDate) => newDate && setGoalDate(newDate)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea 
                placeholder="Any notes about this goal..."
                value={goalNotes}
                onChange={(e) => setGoalNotes(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter className="flex justify-between">
            {goal && (
              <Button 
                variant="destructive" 
                onClick={handleDeleteGoal}
                disabled={goalSubmitting}
              >
                Delete Goal
              </Button>
            )}
            <Button 
              onClick={handleSetGoal}
              disabled={goalSubmitting}
              className="gradient-purple"
            >
              {goalSubmitting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                goal ? 'Update Goal' : 'Set Goal'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WeightTracking;
