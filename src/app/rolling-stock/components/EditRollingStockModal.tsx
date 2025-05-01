'use client';

import React from 'react';
import { RollingStock, Industry } from '@/app/shared/types/models';
import RollingStockForm from './RollingStockForm';

interface EditRollingStockModalProps {
  rollingStock: RollingStock | null;
  industries: Industry[];
  onSave: (rollingStock: RollingStock) => Promise<void>;
  onCancel: () => void;
  isOpen: boolean;
}

export default function EditRollingStockModal({
  rollingStock,
  industries,
  onSave,
  onCancel,
  isOpen
}: EditRollingStockModalProps) {
  const handleSave = async (updatedRollingStock: RollingStock): Promise<void> => {
    await onSave(updatedRollingStock);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl overflow-y-auto max-h-[90vh]">
        <RollingStockForm
          rollingStock={rollingStock || undefined}
          industries={industries}
          onSave={handleSave}
          onCancel={onCancel}
          isNew={!rollingStock}
        />
      </div>
    </div>
  );
} 