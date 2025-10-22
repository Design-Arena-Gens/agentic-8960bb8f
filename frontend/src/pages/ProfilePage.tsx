import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, Profile } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft } from 'lucide-react';

export function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [preferredRole, setPreferredRole] = useState('');
  const [preferredLocation, setPreferredLocation] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await api.getProfile();
      setProfile(data);
      setName(data.name);
      setSkills(data.skills.join(', '));
      setExperience(data.experience);
      setPreferredRole(data.preferred_role);
      setPreferredLocation(data.preferred_location);
    } catch (error) {
      console.log('No profile found');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const profileData = {
        name,
        skills: skills.split(',').map(s => s.trim()).filter(s => s),
        experience,
        preferred_role: preferredRole,
        preferred_location: preferredLocation,
      };

      if (profile) {
        await api.updateProfile(profileData);
        setSuccess('Profile updated successfully!');
      } else {
        await api.createProfile(profileData);
        setSuccess('Profile created successfully!');
      }
      
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {profile ? 'Edit Your Profile' : 'Create Your Profile'}
            </CardTitle>
            <CardDescription>
              Help employers find you by completing your profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="skills" className="text-sm font-medium">Skills</label>
                <Input
                  id="skills"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  required
                  placeholder="e.g. Python, React, AWS (comma-separated)"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="experience" className="text-sm font-medium">Experience</label>
                <Textarea
                  id="experience"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  required
                  placeholder="Describe your work experience..."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="preferredRole" className="text-sm font-medium">Preferred Role</label>
                <Input
                  id="preferredRole"
                  value={preferredRole}
                  onChange={(e) => setPreferredRole(e.target.value)}
                  required
                  placeholder="e.g. Software Engineer, Product Manager"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="preferredLocation" className="text-sm font-medium">Preferred Location</label>
                <Input
                  id="preferredLocation"
                  value={preferredLocation}
                  onChange={(e) => setPreferredLocation(e.target.value)}
                  required
                  placeholder="e.g. San Francisco, Remote"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : profile ? 'Update Profile' : 'Create Profile'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
