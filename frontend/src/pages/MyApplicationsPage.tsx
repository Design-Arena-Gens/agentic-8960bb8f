import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, Application } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Briefcase } from 'lucide-react';

export function MyApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await api.getMyApplications();
      setApplications(data);
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>My Applications</CardTitle>
            <CardDescription>Track your job applications</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-600">Loading applications...</p>
            ) : applications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">You haven't applied to any jobs yet</p>
                <Button onClick={() => navigate('/dashboard')}>
                  Browse Jobs
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div key={app.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-start gap-3">
                        <Briefcase className="w-5 h-5 text-gray-600 mt-1" />
                        <div>
                          {app.job ? (
                            <>
                              <h3 className="font-semibold text-lg">{app.job.title}</h3>
                              <p className="text-sm text-gray-600">{app.job.company}</p>
                              <p className="text-sm text-gray-600">{app.job.location}</p>
                            </>
                          ) : (
                            <h3 className="font-semibold text-lg">Job ID: {app.job_id}</h3>
                          )}
                        </div>
                      </div>
                      <Badge>{app.status}</Badge>
                    </div>
                    {app.message && (
                      <div className="mt-3 p-3 bg-gray-50 rounded">
                        <p className="text-sm font-medium mb-1">Your Message:</p>
                        <p className="text-sm text-gray-700">{app.message}</p>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Applied on {new Date(app.created_at).toLocaleDateString()}
                    </p>
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
