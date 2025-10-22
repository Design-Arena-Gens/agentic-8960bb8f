import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Users, Search } from 'lucide-react';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">JobMarket</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button onClick={() => navigate('/signup')}>
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Connect Employers with Top Talent
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Post jobs once, reach thousands. Find your dream job with smart matching.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/signup')}>
              Get Started
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
              Browse Jobs
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <Briefcase className="w-12 h-12 text-blue-600 mb-4" />
              <CardTitle>For Employers</CardTitle>
              <CardDescription>Post jobs and find qualified candidates</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Post unlimited job listings</li>
                <li>View applicant profiles</li>
                <li>Manage applications easily</li>
                <li>Reach qualified candidates</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="w-12 h-12 text-blue-600 mb-4" />
              <CardTitle>For Job Seekers</CardTitle>
              <CardDescription>Find your next opportunity</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Browse thousands of jobs</li>
                <li>Get personalized matches</li>
                <li>Apply with one click</li>
                <li>Track your applications</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Search className="w-12 h-12 text-blue-600 mb-4" />
              <CardTitle>Smart Matching</CardTitle>
              <CardDescription>AI-powered job recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Skills-based matching</li>
                <li>Location preferences</li>
                <li>Role recommendations</li>
                <li>Save time searching</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center bg-blue-600 text-white rounded-lg p-12">
          <h3 className="text-3xl font-bold mb-4">Ready to get started?</h3>
          <p className="text-xl mb-6">Join thousands of employers and job seekers today</p>
          <Button size="lg" variant="secondary" onClick={() => navigate('/signup')}>
            Create Your Account
          </Button>
        </div>
      </main>
    </div>
  );
}
