import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { AtSign, Lock, AlertCircle, User, Loader } from "lucide-react";
import DiscordLogin from './DiscordLogin';

interface AuthFormProps {
  onSubmit: (email: string, password: string, isLogin: boolean, name?: string) => void;
  isLoading?: boolean;
}

const AuthForm: React.FC<AuthFormProps> = ({ onSubmit, isLoading = false }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [activeTab, setActiveTab] = useState<string>('login');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const validateForm = () => {
    setError(null);
    
    if (!email || !password) {
      setError("Please fill in all required fields");
      return false;
    }
    
    if (!email.includes('@')) {
      setError("Please enter a valid email address");
      return false;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    
    if (activeTab === 'register') {
      if (!name) {
        setError("Please enter your name");
        return false;
      }
      
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    onSubmit(email, password, activeTab === 'login', activeTab === 'register' ? name : undefined);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center gradient-purple gradient-text">
          {activeTab === 'login' ? 'Welcome Back' : 'Join EmpowerFit'}
        </CardTitle>
        <CardDescription className="text-center">
          {activeTab === 'login' 
            ? 'Sign in to access your workouts and progress' 
            : 'Create an account to start your fitness journey'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="login" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center border rounded-md px-3 py-2">
                  <AtSign className="h-5 w-5 text-gray-400 mr-2" />
                  <Input 
                    type="email" 
                    placeholder="Email"
                    className="border-none focus:outline-none focus:ring-0 p-0"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center border rounded-md px-3 py-2">
                  <Lock className="h-5 w-5 text-gray-400 mr-2" />
                  <Input 
                    type="password" 
                    placeholder="Password"
                    className="border-none focus:outline-none focus:ring-0 p-0"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-500 px-3 py-2 rounded-md text-sm flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {error}
                </div>
              )}

              <Button className="w-full gradient-purple" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : 'Log In'}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="register">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center border rounded-md px-3 py-2">
                  <User className="h-5 w-5 text-gray-400 mr-2" />
                  <Input 
                    type="text" 
                    placeholder="Full Name"
                    className="border-none focus:outline-none focus:ring-0 p-0"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center border rounded-md px-3 py-2">
                  <AtSign className="h-5 w-5 text-gray-400 mr-2" />
                  <Input 
                    type="email" 
                    placeholder="Email"
                    className="border-none focus:outline-none focus:ring-0 p-0"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center border rounded-md px-3 py-2">
                  <Lock className="h-5 w-5 text-gray-400 mr-2" />
                  <Input 
                    type="password" 
                    placeholder="Password"
                    className="border-none focus:outline-none focus:ring-0 p-0"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center border rounded-md px-3 py-2">
                  <Lock className="h-5 w-5 text-gray-400 mr-2" />
                  <Input 
                    type="password" 
                    placeholder="Confirm Password"
                    className="border-none focus:outline-none focus:ring-0 p-0"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-500 px-3 py-2 rounded-md text-sm flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {error}
                </div>
              )}

              <Button className="w-full gradient-purple" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : 'Register'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <DiscordLogin />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center text-sm">
        {activeTab === 'login' ? (
          <p>Don't have an account? <span className="text-empowerfit-purple cursor-pointer" onClick={() => setActiveTab('register')}>Register</span></p>
        ) : (
          <p>Already have an account? <span className="text-empowerfit-purple cursor-pointer" onClick={() => setActiveTab('login')}>Login</span></p>
        )}
      </CardFooter>
    </Card>
  );
};

export default AuthForm;
