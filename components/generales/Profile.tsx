import React from 'react';
import ChangePasswordForm from './ChangePasswordForm';

const ProfilePage = () => {
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Perfil de Usuario
        </h1>
        <div className="mt-5 md:mt-0 md:col-span-2">
          <div className="shadow sm:rounded-md sm:overflow-hidden">
            <div className="px-4 py-5 bg-white dark:bg-gray-800 space-y-6 sm:p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Cambiar Contraseña
              </h2>
              <ChangePasswordForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;