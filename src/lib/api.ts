// Use Vite's environment variable format
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get user from localStorage
export const getUserFromStorage = () => {
  try {
    const userInfoString = localStorage.getItem('userInfo');
    if (userInfoString) {
      return JSON.parse(userInfoString);
    }
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    localStorage.removeItem('userInfo'); // Clear invalid data
  }
  return null;
};

// Save user to localStorage
export const saveUserToStorage = (userData: any) => {
  try {
    const userInfo = {
      id: userData._id,
      name: userData.name,
      email: userData.email,
      token: userData.token,
    };
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    return userInfo;
  } catch (error) {
    console.error('Error saving user to localStorage:', error);
    throw new Error('Failed to save user data');
  }
};

// API wrapper for making authenticated requests
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const user = getUserFromStorage();
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // Add auth token if user is logged in
  if (user?.token) {
    defaultHeaders.Authorization = `Bearer ${user.token}`;
  }
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };
  
  try {
    console.log(`Fetching ${API_URL}${endpoint}`);
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      console.error('API error response:', data);
      
      // Handle token expiration or unauthorized
      if (response.status === 401) {
        localStorage.removeItem('userInfo');
        window.location.href = '/auth';
      }
      
      throw new Error(data.message || 'Something went wrong');
    }
    
    return data;
  } catch (error) {
    console.error(`API request error for ${endpoint}:`, error);
    throw error;
  }
};

// Auth API functions
export const authAPI = {
  login: async (email: string, password: string) => {
    try {
      const data = await apiRequest('/users/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      console.log('Login API response:', data);
      
      // Save user info to localStorage
      return saveUserToStorage(data);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  register: async (name: string, email: string, password: string) => {
    try {
      const data = await apiRequest('/users/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      
      console.log('Register API response:', data);
      
      // Save user info to localStorage
      return saveUserToStorage(data);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },
  
  getProfile: async () => {
    return await apiRequest('/users/profile');
  },
  
  logout: () => {
    localStorage.removeItem('userInfo');
    window.location.href = '/auth';
  }
};

// Weight tracking API
export const weightAPI = {
  // Log a new weight entry
  logWeight: async (data: { weight: number; unit?: string; notes?: string; date?: string }) => {
    return await apiRequest('/weight', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Get all weight logs
  getWeightLogs: async (params?: { limit?: number; startDate?: string; endDate?: string }) => {
    let queryString = '';
    
    if (params) {
      const queryParams = new URLSearchParams();
      
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      
      queryString = `?${queryParams.toString()}`;
    }
    
    return await apiRequest(`/weight${queryString}`);
  },
  
  // Get weight log by ID
  getWeightLogById: async (id: string) => {
    return await apiRequest(`/weight/${id}`);
  },
  
  // Update weight log
  updateWeightLog: async (id: string, data: { weight?: number; unit?: string; notes?: string; date?: string }) => {
    return await apiRequest(`/weight/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  // Delete weight log
  deleteWeightLog: async (id: string) => {
    return await apiRequest(`/weight/${id}`, {
      method: 'DELETE',
    });
  },
  
  // Get weight statistics
  getWeightStats: async () => {
    return await apiRequest('/weight/stats');
  },
  
  // Set weight goal
  setWeightGoal: async (data: { targetWeight: number; targetDate: string; unit?: string; notes?: string }) => {
    return await apiRequest('/weight/goal', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Get weight goal
  getWeightGoal: async () => {
    return await apiRequest('/weight/goal');
  },
  
  // Delete weight goal
  deleteWeightGoal: async () => {
    return await apiRequest('/weight/goal', {
      method: 'DELETE',
    });
  },
  
  // Complete weight goal
  completeWeightGoal: async () => {
    return await apiRequest('/weight/goal/complete', {
      method: 'PUT',
    });
  }
};

// Exercise API
export const exerciseAPI = {
  // Get all exercises with filtering and pagination
  getExercises: async (params?: { 
    category?: string; 
    movement_type?: string;
    equipment?: string;
    difficulty?: string;
    target_muscle?: string;
    search?: string;
    limit?: number;
    page?: number;
  }) => {
    let queryString = '';
    
    if (params) {
      const queryParams = new URLSearchParams();
      
      if (params.category) queryParams.append('category', params.category);
      if (params.movement_type) queryParams.append('movement_type', params.movement_type);
      if (params.equipment) queryParams.append('equipment', params.equipment);
      if (params.difficulty) queryParams.append('difficulty', params.difficulty);
      if (params.target_muscle) queryParams.append('target_muscle', params.target_muscle);
      if (params.search) queryParams.append('search', params.search);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.page) queryParams.append('page', params.page.toString());
      
      queryString = `?${queryParams.toString()}`;
    }
    
    return await apiRequest(`/exercises${queryString}`);
  },
  
  // Get exercise by ID
  getExerciseById: async (id: string) => {
    return await apiRequest(`/exercises/${id}`);
  },
  
  // Create a new custom exercise
  createExercise: async (data: {
    name: string;
    description?: string;
    instructions?: string;
    target_muscles?: { primary: string[]; secondary: string[] };
    category?: string;
    movement_type?: string;
    equipment?: string;
    difficulty?: string;
    media?: { image_url?: string; video_url?: string };
  }) => {
    return await apiRequest('/exercises', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Update an exercise
  updateExercise: async (id: string, data: {
    name?: string;
    description?: string;
    instructions?: string;
    target_muscles?: { primary: string[]; secondary: string[] };
    category?: string;
    movement_type?: string;
    equipment?: string;
    difficulty?: string;
    media?: { image_url?: string; video_url?: string };
  }) => {
    return await apiRequest(`/exercises/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  // Delete an exercise
  deleteExercise: async (id: string) => {
    return await apiRequest(`/exercises/${id}`, {
      method: 'DELETE',
    });
  },
  
  // Add exercise to favorites
  addFavorite: async (exerciseId: string) => {
    try {
      const response = await apiRequest(`/exercises/favorites/add/${exerciseId}`, {
        method: 'POST'
      });
      return response;
    } catch (error) {
      console.error('Error adding exercise to favorites:', error);
      throw error;
    }
  },
  
  // Remove exercise from favorites
  removeFavorite: async (exerciseId: string) => {
    try {
      const response = await apiRequest(`/exercises/favorites/remove/${exerciseId}`, {
        method: 'DELETE'
      });
      return response;
    } catch (error) {
      console.error('Error removing exercise from favorites:', error);
      throw error;
    }
  },
  
  // Get favorite exercises
  getFavorites: async () => {
    try {
      console.log('Fetching favorites from API');
      const response = await apiRequest('/exercises/favorites');
      console.log('Favorites response:', response);
      return response;
    } catch (error) {
      console.error('Error getting favorite exercises:', error);
      throw error;
    }
  },
  
  // Get recent exercises
  getRecentExercises: async () => {
    try {
      console.log('[RecentExercises] Fetching recent exercises from API');
      const response = await apiRequest('/exercises/recent');
      console.log('[RecentExercises] Recent exercises response:', response);
      return response;
    } catch (error) {
      console.error('[RecentExercises] Error getting recent exercises:', error);
      throw error;
    }
  },
  
  // Add or update an exercise in the recent list
  addToRecentExercises: async (exerciseId: string) => {
    try {
      console.log(`[RecentExercises] Adding exercise ${exerciseId} to recent list`);
      const response = await apiRequest('/exercises/recent', {
        method: 'POST',
        body: JSON.stringify({ exerciseId })
      });
      console.log('[RecentExercises] Added to recent exercises:', response);
      return response;
    } catch (error) {
      console.error('[RecentExercises] Error adding to recent exercises:', error);
      throw error;
    }
  }
};

// Custom Workout API
export const customWorkoutAPI = {
  // Get all custom workouts for the user
  getWorkouts: async (params?: { 
    category?: string;
    search?: string;
    limit?: number;
    page?: number;
  }) => {
    try {
      console.log('[CustomWorkout] Fetching custom workouts with params:', params);
      let queryString = '';
      
      if (params) {
        const queryParams = new URLSearchParams();
        
        if (params.category) queryParams.append('category', params.category);
        if (params.search) queryParams.append('search', params.search);
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.page) queryParams.append('page', params.page.toString());
        
        queryString = `?${queryParams.toString()}`;
      }
      
      const response = await apiRequest(`/workouts${queryString}`);
      console.log('[CustomWorkout] Received workouts:', response);
      return response;
    } catch (error) {
      console.error('[CustomWorkout] Error getting workouts:', error);
      throw error;
    }
  },
  
  // Get workout by ID
  getWorkoutById: async (id: string) => {
    try {
      console.log(`[CustomWorkout] Fetching workout with ID: ${id}`);
      const response = await apiRequest(`/workouts/${id}`);
      console.log('[CustomWorkout] Received workout details:', response);
      return response;
    } catch (error) {
      console.error('[CustomWorkout] Error getting workout:', error);
      throw error;
    }
  },
  
  // Create a new custom workout
  createWorkout: async (data: {
    name: string;
    description?: string;
    exercises?: Array<{
      exercise: string;
      sets?: number;
      reps?: string;
      weight?: number;
      restTime?: number;
      notes?: string;
    }>;
    category?: string;
    difficulty?: string;
    duration?: number;
    tags?: string[];
    isPublic?: boolean;
  }) => {
    try {
      console.log('[CustomWorkout] Creating new workout:', data.name);
      const response = await apiRequest('/workouts', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      console.log('[CustomWorkout] Created workout:', response);
      return response;
    } catch (error) {
      console.error('[CustomWorkout] Error creating workout:', error);
      throw error;
    }
  },
  
  // Update an existing workout
  updateWorkout: async (id: string, data: {
    name?: string;
    description?: string;
    exercises?: Array<{
      exercise: string;
      sets?: number;
      reps?: string;
      weight?: number;
      restTime?: number;
      notes?: string;
    }>;
    category?: string;
    difficulty?: string;
    duration?: number;
    tags?: string[];
    isPublic?: boolean;
  }) => {
    try {
      console.log(`[CustomWorkout] Updating workout ${id}:`, data);
      const response = await apiRequest(`/workouts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      console.log('[CustomWorkout] Updated workout:', response);
      return response;
    } catch (error) {
      console.error('[CustomWorkout] Error updating workout:', error);
      throw error;
    }
  },
  
  // Delete a workout
  deleteWorkout: async (id: string) => {
    try {
      console.log(`[CustomWorkout] Deleting workout: ${id}`);
      const response = await apiRequest(`/workouts/${id}`, {
        method: 'DELETE',
      });
      console.log('[CustomWorkout] Deleted workout:', response);
      return response;
    } catch (error) {
      console.error('[CustomWorkout] Error deleting workout:', error);
      throw error;
    }
  },
  
  // Mark a workout as completed
  completeWorkout: async (id: string) => {
    try {
      console.log(`[CustomWorkout] Marking workout ${id} as completed`);
      const response = await apiRequest(`/workouts/${id}/complete`, {
        method: 'PUT',
      });
      console.log('[CustomWorkout] Workout completed:', response);
      return response;
    } catch (error) {
      console.error('[CustomWorkout] Error completing workout:', error);
      throw error;
    }
  }
};

// Workout Log API
export const workoutLogAPI = {
  // Get all workout logs for the user
  getWorkoutLogs: async (params?: {
    startDate?: string;
    endDate?: string;
    exerciseId?: string;
    page?: number;
    limit?: number;
  }) => {
    try {
      console.log('[WorkoutLog] Fetching workout logs');
      const queryParams = new URLSearchParams();
      
      if (params) {
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);
        if (params.exerciseId) queryParams.append('exerciseId', params.exerciseId);
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
      }
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const response = await apiRequest(`/workout-log${queryString}`);
      
      console.log('[WorkoutLog] Fetched workout logs:', response);
      return response;
    } catch (error) {
      console.error('[WorkoutLog] Error fetching workout logs:', error);
      throw error;
    }
  },
  
  // Get a specific workout log
  getWorkoutLog: async (id: string) => {
    try {
      console.log(`[WorkoutLog] Fetching workout log: ${id}`);
      const response = await apiRequest(`/workout-log/${id}`);
      console.log('[WorkoutLog] Fetched workout log:', response);
      return response;
    } catch (error) {
      console.error('[WorkoutLog] Error fetching workout log:', error);
      throw error;
    }
  },
  
  // Log a new workout session
  logWorkout: async (data: {
    exerciseId: string;
    exerciseName: string;
    duration: number;
    date?: Date;
    sets: Array<{
      weight: string;
      reps: string;
      notes?: string;
    }>;
    notes?: string;
  }) => {
    try {
      console.log('[WorkoutLog] Logging workout:', data);
      
      // Calculate end time based on duration
      const startTime = data.date || new Date();
      const endTime = new Date(startTime.getTime() + (data.duration * 1000));
      
      // Assume 30% of total time is rest time as an example
      const restTime = Math.round(data.duration * 0.3);
      const activeTime = data.duration - restTime;
      
      // Format the data for the API
      const workoutData = {
        exercise: data.exerciseId,
        startTime,
        endTime,
        totalDuration: data.duration,
        restTime,
        activeTime,
        sets: data.sets.map((set, index) => ({
          setNumber: index + 1,
          weight: set.weight,
          reps: set.reps,
          completed: true // Assuming completed sets since they are being submitted
        })),
        notes: data.notes || ''
      };
      
      const response = await apiRequest('/workout-log', {
        method: 'POST',
        body: JSON.stringify(workoutData),
      });
      
      console.log('[WorkoutLog] Workout logged successfully:', response);
      return response;
    } catch (error) {
      console.error('[WorkoutLog] Error logging workout:', error);
      throw error;
    }
  },
  
  // Delete a workout log
  deleteWorkoutLog: async (id: string) => {
    try {
      console.log(`[WorkoutLog] Deleting workout log: ${id}`);
      const response = await apiRequest(`/workout-log/${id}`, {
        method: 'DELETE',
      });
      console.log('[WorkoutLog] Deleted workout log:', response);
      return response;
    } catch (error) {
      console.error('[WorkoutLog] Error deleting workout log:', error);
      throw error;
    }
  }
};

// Stats API for dashboard
export const statsAPI = {
  getDashboardStats: async () => {
    try {
      console.log('[Stats] Fetching dashboard stats');
      const response = await apiRequest('/stats/dashboard');
      console.log('[Stats] Dashboard stats response:', response);
      return response;
    } catch (error) {
      console.error('[Stats] Error fetching dashboard stats:', error);
      throw error;
    }
  }
}; 