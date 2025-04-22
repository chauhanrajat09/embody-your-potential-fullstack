import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { User, Settings, Activity, UserCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { statsAPI, authAPI, workoutLogAPI } from '@/lib/api';

interface UserStats {
  totalWorkouts: number;
  favoriteExercise: string;
  longestStreak: number;
  joinDate: string;
}

const ProfilePage: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [userStats, setUserStats] = useState<UserStats>({
    totalWorkouts: 0,
    favoriteExercise: 'None',
    longestStreak: 0,
    joinDate: new Date().toISOString()
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Set form data with the user info we already have
        setFormData({
          name: user?.name || '',
          email: user?.email || ''
        });
        
        // Try to fetch profile data - if it fails, we can still show basic info
        try {
          const profileResponse = await authAPI.getProfile();
          setProfileData(profileResponse);
          
          // Update join date if available
          if (profileResponse?.createdAt) {
            setUserStats(prev => ({
              ...prev,
              joinDate: profileResponse.createdAt
            }));
          }
        } catch (profileError) {
          console.error('Error fetching profile data:', profileError);
        }
        
        // Try to fetch workout count directly if stats API fails
        try {
          // First try to get stats from the dashboard endpoint
          const statsResponse = await statsAPI.getDashboardStats();
          setUserStats(prev => ({
            ...prev,
            totalWorkouts: statsResponse.workoutsCount || 0,
            favoriteExercise: statsResponse.favoriteExercise?.name || 'None',
            longestStreak: statsResponse.longestStreak || 0
          }));
        } catch (statsError) {
          console.error('Error fetching stats data:', statsError);
          
          // Fallback: Try to get just the workout count
          try {
            const workoutLogs = await workoutLogAPI.getWorkoutLogs({ limit: 1 });
            if (workoutLogs && workoutLogs.total) {
              setUserStats(prev => ({
                ...prev,
                totalWorkouts: workoutLogs.total
              }));
            }
          } catch (workoutError) {
            console.error('Error fetching workout count:', workoutError);
          }
        }
      } catch (error) {
        console.error('Error in main fetch flow:', error);
        toast({
          title: 'Note',
          description: 'Some profile data could not be loaded.',
          variant: 'default'
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [user, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      // This would be an API call to update user data
      // For now, just simulate success
      toast({
        title: 'Profile updated',
        description: 'Your profile information has been updated successfully.'
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile information.',
        variant: 'destructive'
      });
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  if (loading) {
    return (
      <Layout activePage="profile">
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[80vh]">
          <p>Loading profile data...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout activePage="profile">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Profile</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Summary Card */}
          <Card className="md:col-span-1">
            <CardHeader className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={profileData?.avatarUrl || ''} alt={user?.name || ''} />
                <AvatarFallback className="text-2xl">{getInitials(user?.name || '')}</AvatarFallback>
              </Avatar>
              <CardTitle>{user?.name || ''}</CardTitle>
              <CardDescription>Member since {new Date(userStats.joinDate).toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Workouts</span>
                <span className="font-bold">{userStats.totalWorkouts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Favorite Exercise</span>
                <span className="font-bold">{userStats.favoriteExercise}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Longest Streak</span>
                <span className="font-bold">{userStats.longestStreak} days</span>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Area */}
          <div className="md:col-span-2">
            <Tabs defaultValue="account">
              <TabsList className="mb-4">
                <TabsTrigger value="account">
                  <User className="h-4 w-4 mr-2" />
                  Account
                </TabsTrigger>
                <TabsTrigger value="activity">
                  <Activity className="h-4 w-4 mr-2" />
                  Activity
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="account">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>
                      Manage your account details and personal information.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <div className="p-2 border rounded-md">{user?.name || ''}</div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      {isEditing ? (
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <div className="p-2 border rounded-md">{user?.email || ''}</div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    {isEditing ? (
                      <div className="flex space-x-2">
                        <Button onClick={handleSaveProfile}>Save Changes</Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                      </div>
                    ) : (
                      <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                    )}
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="activity">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      View your recent workout history and achievements.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* This would be populated with actual workout history */}
                      {userStats.totalWorkouts > 0 ? (
                        <p>Your recent workout activity will be displayed here.</p>
                      ) : (
                        <p className="text-muted-foreground text-center py-8">
                          You haven't logged any workouts yet. Get started and log your first workout!
                        </p>
                      )}
                      <Button variant="outline" className="w-full">
                        View Complete History
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                    <CardDescription>
                      Customize your app experience and notification settings.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* This would contain actual settings controls */}
                    <div className="space-y-2">
                      <Label htmlFor="theme">Theme</Label>
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                        id="theme"
                        defaultValue="system"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-4">
                      <input
                        type="checkbox"
                        id="notifications"
                        className="h-4 w-4 rounded border-gray-300"
                        defaultChecked
                      />
                      <Label htmlFor="notifications">Enable email notifications</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="reminders"
                        className="h-4 w-4 rounded border-gray-300"
                        defaultChecked
                      />
                      <Label htmlFor="reminders">Workout reminders</Label>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button>Save Preferences</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage; 