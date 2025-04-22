import React, { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/api';

const AuthSuccess: React.FC = () => {
  const [queryParams, setQueryParams] = useState<{
    token?: string;
    userId?: string;
    name?: string;
    email?: string;
  }>({});
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get dashboard URL from environment variables or use default
  const dashboardUrl = import.meta.env.VITE_DASHBOARD_URL || '/dashboard';

  useEffect(() => {
    // Parse URL query parameters
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token') || '';
    const userId = params.get('userId') || '';
    const name = params.get('name') || '';
    const email = params.get('email') || '';
    
    setQueryParams({ token, userId, name, email });
    
    // If we have the token and user info from the query parameters
    if (token && userId && name) {
      try {
        console.log('Processing Discord authentication');
        setIsRedirecting(true);
        
        // First create a minimal user object to allow API calls
        const tempUserData = {
          id: userId,
          name: name,
          email: email || '',
          token: token,
        };
        
        // Store temporary user data in localStorage
        localStorage.setItem('userInfo', JSON.stringify(tempUserData));
        
        // Fetch complete user profile to get Discord data
        const fetchUserProfile = async () => {
          try {
            // Use the auth/me endpoint to get full user profile including Discord data
            const userData = await apiRequest('/auth/me');
            
            if (userData && userData.user) {
              // Store the complete user data including Discord profile in localStorage
              const completeUserData = {
                id: userData.user._id,
                name: userData.user.name,
                email: userData.user.email,
                token: token,
                discord: userData.user.discord,
                authProvider: userData.user.authProvider
              };
              
              localStorage.setItem('userInfo', JSON.stringify(completeUserData));
            }
            
            // Redirect to dashboard using environment variable
            window.location.href = dashboardUrl;
          } catch (error) {
            console.error('Error fetching user profile:', error);
            setError('Failed to complete authentication. Please try again.');
            setIsRedirecting(false);
          }
        };
        
        // Set a timeout to ensure token is saved before making the API call
        setTimeout(() => {
          fetchUserProfile();
        }, 500);
      } catch (error) {
        console.error('Error saving auth data:', error);
        setError('Failed to process authentication. Please try again.');
        setIsRedirecting(false);
      }
    } else {
      setError('Missing authentication information. Please try logging in again.');
    }
  }, [navigate, dashboardUrl]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
        <div className="flex items-center justify-center mb-4">
          <Loader className="h-8 w-8 text-empowerfit-purple animate-spin" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Authentication Successful</h1>
        <p className="text-gray-600 mb-4">
          {queryParams.name ? `Welcome, ${queryParams.name}!` : 'You have successfully logged in.'}
        </p>
        <p className="text-gray-500 text-sm">
          {isRedirecting ? 'Redirecting you to the dashboard...' : 'Processing your authentication...'}
        </p>
        {error && (
          <p className="text-red-500 mt-4 text-sm">{error}</p>
        )}
      </div>
    </div>
  );
};

export default AuthSuccess; 