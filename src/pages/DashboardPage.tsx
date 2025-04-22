import React, { useState } from 'react';
import Dashboard from '@/components/dashboard/Dashboard';
import TestDataGenerator from '@/components/dashboard/TestDataGenerator';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Database } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const [showTestDataGenerator, setShowTestDataGenerator] = useState(false);

  return (
    <Layout activePage="dashboard">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Your Fitness Dashboard</h1>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowTestDataGenerator(!showTestDataGenerator)}
          >
            <Database className="mr-2 h-4 w-4" />
            {showTestDataGenerator ? 'Hide Test Tools' : 'Show Test Tools'}
          </Button>
        </div>
        
        {showTestDataGenerator && (
          <div className="mb-8">
            <TestDataGenerator />
          </div>
        )}
        
        <Dashboard />
      </div>
    </Layout>
  );
};

export default DashboardPage; 