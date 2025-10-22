import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, Job, Profile } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Briefcase, Search, LogOut, User, Star } from 'lucide-react';

export function SeekerDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [matchedJobs, setMatchedJobs] = useState<Job[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [jobsData, profileData] = await Promise.all([
        api.getJobs(),
        api.getProfile().catch(() => null),
      ]);
      setJobs(jobsData);
      setProfile(profileData);
      
      if (profileData) {
        const matched = await api.getMatchedJobs();
        setMatchedJobs(matched);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      const data = await api.getJobs(searchTerm || undefined, locationFilter || undefined);
      setJobs(data);
    } catch (error) {
      console.error('Failed to search jobs:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Job Seeker Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
          </div>
          <div className="flex gap-2">
            {!profile && (
              <Button onClick={() => navigate('/seeker/profile')}>
                <User className="w-4 h-4 mr-2" />
                Create Profile
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate('/seeker/applications')}>
              My Applications
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!profile && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">Complete your profile</h3>
                  <p className="text-sm text-gray-600">Create a profile to get personalized job matches</p>
                </div>
                <Button onClick={() => navigate('/seeker/profile')}>
                  Create Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {matchedJobs.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Recommended Jobs
              </CardTitle>
              <CardDescription>Jobs that match your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {matchedJobs.slice(0, 3).map((job) => (
                  <div
                    key={job.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/seeker/jobs/${job.id}`)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{job.title}</h3>
                        <p className="text-sm text-gray-600">{job.company}</p>
                      </div>
                      <Badge variant="secondary">Match: {job.match_score}</Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{job.location}</p>
                    {job.salary && <p className="text-sm text-gray-600 mb-2">{job.salary}</p>}
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Search jobs by title, skills, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="w-64">
                <Input
                  placeholder="Location"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch}>
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Jobs</CardTitle>
            <CardDescription>Browse all job opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-600">Loading jobs...</p>
            ) : jobs.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No jobs found</p>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/seeker/jobs/${job.id}`)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{job.title}</h3>
                        <p className="text-sm text-gray-600">{job.company}</p>
                      </div>
                      <Briefcase className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{job.location}</p>
                    {job.salary && <p className="text-sm text-gray-600 mb-2">{job.salary}</p>}
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
