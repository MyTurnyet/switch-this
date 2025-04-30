'use client';

import React from 'react';
import { TrainRoute, Location, Industry } from '@/app/shared/types/models';
import TrainRouteForm from './TrainRouteForm';

interface EditTrainRouteModalProps {
  trainRoute: TrainRoute | null;
  locations: Location[];
  industries: Industry[];
  onSave: (trainRoute: TrainRoute) => Promise<void>;
  onCancel: () => void;
  isOpen: boolean;
}

export default function EditTrainRouteModal({
  trainRoute,
  locations,
  industries,
  onSave,
  onCancel,
  isOpen
}: EditTrainRouteModalProps) {
  const handleSave = async (updatedRoute: TrainRoute): Promise<void> => {
    await onSave(updatedRoute);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl overflow-y-auto max-h-[90vh]">
        <TrainRouteForm
          trainRoute={trainRoute || undefined}
          locations={locations}
          industries={industries}
          onSave={handleSave}
          onCancel={onCancel}
          isNew={!trainRoute}
        />
      </div>
    </div>
  );
} 