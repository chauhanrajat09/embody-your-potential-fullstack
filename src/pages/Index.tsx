
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight, Dumbbell, BarChart2, Calendar, Shield, Award } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold gradient-purple gradient-text">EmpowerFit</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/auth" className="text-gray-600 hover:text-empowerfit-purple">
            Log In
          </Link>
          <Link to="/auth">
            <Button className="gradient-purple">Sign Up</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl font-bold leading-tight">
                Track Your Fitness Journey with <span className="gradient-purple gradient-text">EmpowerFit</span>
              </h1>
              <p className="text-xl text-gray-600">
                The ultimate fitness tracking platform to help you achieve your goals, track your progress, and transform your body.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/auth">
                  <Button className="gradient-purple text-lg py-6 px-8">
                    Get Started
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="outline" className="text-lg py-6 px-8">
                    View Demo
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-empowerfit-purple-light to-empowerfit-blue rounded-xl flex items-center justify-center">
                <Dumbbell className="h-24 w-24 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Powerful Features to Track Your Progress
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<Dumbbell className="h-8 w-8" />}
              title="Workout Library"
              description="Access hundreds of pre-made workouts or create your own custom routines."
            />
            <FeatureCard 
              icon={<BarChart2 className="h-8 w-8" />}
              title="Progress Tracking"
              description="Visualize your strength gains and body measurements over time."
            />
            <FeatureCard 
              icon={<Calendar className="h-8 w-8" />}
              title="Scheduling"
              description="Plan your workout routines and set reminders for consistent training."
            />
            <FeatureCard 
              icon={<Award className="h-8 w-8" />}
              title="Achievements"
              description="Earn badges and celebrate milestones throughout your fitness journey."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Fitness Journey?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of users who are reaching their fitness goals with EmpowerFit.
          </p>
          <Link to="/auth">
            <Button className="gradient-purple text-lg py-6 px-8">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <h3 className="text-xl font-bold mb-4 gradient-purple gradient-text">EmpowerFit</h3>
              <p className="text-gray-400 max-w-xs">
                The ultimate fitness tracking platform for achieving your goals.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-lg font-semibold mb-4">Product</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">Features</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Pricing</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Testimonials</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Resources</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Guides</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Support</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Company</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">About</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Careers</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 EmpowerFit. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="bg-empowerfit-purple/10 p-3 rounded-full inline-block mb-4">
        <div className="text-empowerfit-purple">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default Index;
