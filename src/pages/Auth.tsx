import React, { useState } from 'react';
import AuthForm from '@/components/auth/AuthForm';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Auth: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();

  const handleAuth = async (email: string, password: string, isLogin: boolean, name?: string) => {
    setIsLoading(true);
    try {
      console.log('Starting auth process:', isLogin ? 'login' : 'register');
      
      if (isLogin) {
        await login(email, password);
        console.log('Login successful via AuthContext');
        toast({
          title: "Logged In",
          description: "Welcome back!"
        });
      } else {
        if (!name) {
          throw new Error('Name is required');
        }
        await register(name, email, password);
        console.log('Registration successful via AuthContext');
        toast({
          title: "Registered",
          description: "Account created successfully!"
        });
      }
      
      // After successful auth, navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Authentication failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md mb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-purple gradient-text">EmpowerFit</h1>
          <p className="text-gray-600 mt-2">Track. Progress. Achieve.</p>
        </div>
        <AuthForm onSubmit={handleAuth} isLoading={isLoading} />
      </div>
      <div className="w-full max-w-md text-center mt-6 text-sm text-gray-500">
        <p>By signing up, you agree to our Terms of Service and Privacy Policy.</p>
      </div>
    </div>
  );
};

export default Auth;
