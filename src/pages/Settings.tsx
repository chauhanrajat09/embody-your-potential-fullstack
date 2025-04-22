import React from 'react';
import { useTheme, ThemeMode } from '@/contexts/ThemeContext';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';

const Settings = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Layout activePage="settings">
      <div className="container px-4 py-6 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        
        <div className="space-y-6">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how the application looks and feels.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Theme</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Select your preferred color theme.
                  </p>
                  
                  <RadioGroup 
                    defaultValue={theme} 
                    onValueChange={(value) => setTheme(value as ThemeMode)}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                  >
                    <div>
                      <RadioGroupItem 
                        value="light" 
                        id="theme-light" 
                        className="peer sr-only" 
                      />
                      <Label 
                        htmlFor="theme-light" 
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <Sun className="mb-2 h-6 w-6" />
                        <span>Light</span>
                      </Label>
                    </div>
                    
                    <div>
                      <RadioGroupItem 
                        value="dark" 
                        id="theme-dark" 
                        className="peer sr-only" 
                      />
                      <Label 
                        htmlFor="theme-dark" 
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <Moon className="mb-2 h-6 w-6" />
                        <span>Dark</span>
                      </Label>
                    </div>
                    
                    <div>
                      <RadioGroupItem 
                        value="oled" 
                        id="theme-oled" 
                        className="peer sr-only"
                      />
                      <Label 
                        htmlFor="theme-oled" 
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <Monitor className="mb-2 h-6 w-6" />
                        <span>OLED</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-muted-foreground">
                Current theme: {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </p>
            </CardFooter>
          </Card>
          
          {/* Additional settings sections can be added here */}
        </div>
      </div>
    </Layout>
  );
};

export default Settings; 