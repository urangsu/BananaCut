import React from 'react';

interface AdSlotProps {
  slotId: string;
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ slotId, className = "" }) => {
  // Validate slotId structure to prevent errors
  if (!/^\d+$/.test(slotId)) {
    throw new Error('INVALID_ADSENSE_SLOT_ID');
  }

  // Safe mode: return null immediately before AdSense is fully approved
  return null;
};
