'use client'

import React, { useState, useEffect } from 'react';
import { Camera, User, Loader2 } from 'lucide-react';
import Image from 'next/image';
import imageLoader from '@/app/lib/image-loader';
import { profileService } from '@/app/lib/profile';
import { getUser } from '@/app/lib/auth';
import { toast } from 'react-hot-toast';
import ChangePasswordForm from './ChangePasswordForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProfileState {
  name: string;
  email: string;
  role: string;
  teamId: number;
  avatarUrl?: string | null;
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<ProfileState>({
    name: '',
    email: '',
    role: '',
    teamId: 0,
    avatarUrl: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [newAvatarUrl, setNewAvatarUrl] = useState('');
  const [updatingAvatar, setUpdatingAvatar] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { user } = await getUser();
        setProfile({
          name: user.name,
          email: user.email,
          role: user.role,
          teamId: user.teamId,
          avatarUrl: user.avatarUrl
        });
      } catch (error) {
        console.error('Error loading user data:', error);
        toast.error('Error loading user data');
      }
    };

    loadUserData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarClick = () => {
    setIsAvatarDialogOpen(true);
  };

  const handleAvatarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAvatarUrl) return;
  
    try {
      setUpdatingAvatar(true);
      const response = await fetch('/api/profile/update-avatar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ avatarUrl: newAvatarUrl }),
      });
  
      if (!response.ok) throw new Error('Failed to update avatar');
  
      const data = await response.json();
      setProfile(prev => ({ ...prev, avatarUrl: data.avatarUrl }));
      setIsAvatarDialogOpen(false);
      setNewAvatarUrl('');
      
      // Actualizar la sesión
      window.location.reload(); // Solución temporal
      // O mejor aún, actualizar el estado global si estás usando un manejador de estado
  
      toast.success('Avatar updated successfully');
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast.error('Error updating avatar');
    } finally {
      setUpdatingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      const { user } = await profileService.updateProfile({
        name: profile.name
      });
      
      setProfile(prev => ({
        ...prev,
        name: user.name
      }));
      
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            User Profile
          </h1>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Avatar Section */}
              <div className="flex flex-col items-center space-y-4">
                <div 
                  className="relative group cursor-pointer"
                  onClick={handleAvatarClick}
                >
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    {profile.avatarUrl ? (
                      <Image 
                        loader={imageLoader}
                        src={profile.avatarUrl} 
                        alt="Profile"
                        width={128}
                        height={128}
                        className="object-cover"
                        priority
                      />
                    ) : (
                      <User className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </div>
                
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Click to change avatar
                </p>
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-gray-50 dark:bg-gray-600 dark:text-gray-300 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Role
                  </label>
                  <input
                    id="role"
                    type="text"
                    value={profile.role}
                    disabled
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-gray-50 dark:bg-gray-600 dark:text-gray-300 sm:text-sm"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      disabled={isLoading}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving...</span>
                        </div>
                      ) : (
                        'Save changes'
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Edit profile
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Password Change Section */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
              Change Password
            </h2>
            <ChangePasswordForm />
          </div>
        </div>

        {/* Avatar URL Dialog */}
        <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Update Avatar</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAvatarSubmit} className="space-y-6">
              {/* Current Avatar Section */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Current Avatar URL
                </label>
                <Input
                  type="text"
                  value={profile.avatarUrl || ''}
                  disabled
                  className="bg-gray-50 dark:bg-gray-700"
                />
              </div>

              {/* New Avatar Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    New Avatar URL
                  </label>
                  <Input
                    type="url"
                    placeholder="Enter new image URL"
                    value={newAvatarUrl}
                    onChange={(e) => setNewAvatarUrl(e.target.value)}
                    required
                  />
                  <p className="text-sm text-gray-500">
                    Enter a direct image URL (.jpg, .jpeg, .png, .gif, .webp)
                  </p>
                </div>

                {/* Preview Section */}
                {newAvatarUrl && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Preview
                    </label>
                    <div className="flex justify-center">
                      <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center relative">
                        <Image
                          loader={imageLoader}
                          src={newAvatarUrl}
                          alt="Avatar Preview"
                          width={128}
                          height={128}
                          className="object-cover"
                          onError={(e: any) => {
                            e.currentTarget.src = '/placeholder-avatar.jpg';
                          }}
                          priority
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsAvatarDialogOpen(false);
                    setNewAvatarUrl('');
                  }}
                  disabled={updatingAvatar}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updatingAvatar || !newAvatarUrl}>
                  {updatingAvatar ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating...</span>
                    </div>
                  ) : (
                    'Update Avatar'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ProfilePage;