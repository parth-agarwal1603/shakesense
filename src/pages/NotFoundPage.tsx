import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/common/Icon';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-4 py-16">
      <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-outline">
        <Icon name="device_unknown" size={36} />
      </div>
      <h1 className="font-headline-lg text-on-surface">Route Not Found (404)</h1>
      <p className="font-body-lg text-outline max-w-md">
        The requested diagnostic telemetry view or asset route does not exist in the ShakeSense application tree.
      </p>
      <button
        onClick={() => navigate('/overview')}
        className="mt-4 px-6 py-3 rounded-lg bg-primary-container text-on-primary-container font-semibold hover:bg-inverse-primary transition-colors flex items-center gap-2 cursor-pointer"
      >
        <Icon name="dashboard" size={18} />
        <span>Return to Overview</span>
      </button>
    </div>
  );
};

