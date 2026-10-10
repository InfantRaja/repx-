import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const UnitContext = createContext();

export const UnitProvider = ({ children }) => {
  const { user, updateProfile } = useAuth();

  const [unit, setUnitState] = useState(() => {
    return user?.preferences?.unit || localStorage.getItem('repx_unit') || 'kg';
  });

  const [distanceUnit, setDistanceUnitState] = useState(() => {
    return localStorage.getItem('repx_distance_unit') || 'km';
  });

  // Sync if user profile updates
  useEffect(() => {
    if (user?.preferences?.unit && user.preferences.unit !== unit) {
      setUnitState(user.preferences.unit);
      localStorage.setItem('repx_unit', user.preferences.unit);
    }
  }, [user?.preferences?.unit]);

  const setUnit = async (newUnit) => {
    setUnitState(newUnit);
    localStorage.setItem('repx_unit', newUnit);
    if (updateProfile) {
      try {
        await updateProfile({
          preferences: { unit: newUnit },
        });
      } catch (e) {
        // Silently fallback to local state if offline
      }
    }
  };

  const setDistanceUnit = (newDist) => {
    setDistanceUnitState(newDist);
    localStorage.setItem('repx_distance_unit', newDist);
  };

  // Stepper increment: 2.5 for KG, 5 for LBS
  const weightStep = unit === 'lbs' ? 5 : 2.5;

  // Convert kg value to display weight
  const convertWeight = (valInKg) => {
    if (valInKg === null || valInKg === undefined || isNaN(valInKg)) return 0;
    if (unit === 'lbs') {
      return Math.round(Number(valInKg) * 2.20462 * 10) / 10;
    }
    return Number(valInKg);
  };

  // Convert current unit value back to kg for storage
  const toKg = (valInCurrentUnit) => {
    if (!valInCurrentUnit || isNaN(valInCurrentUnit)) return 0;
    if (unit === 'lbs') {
      return Math.round((Number(valInCurrentUnit) / 2.20462) * 10) / 10;
    }
    return Number(valInCurrentUnit);
  };

  // Format with unit label: e.g. "80 kg" or "176.4 lbs"
  const formatWeight = (val, explicitUnit) => {
    if (val === null || val === undefined || isNaN(val)) return `0 ${explicitUnit || unit}`;
    return `${val} ${explicitUnit || unit}`;
  };

  return (
    <UnitContext.Provider
      value={{
        unit,
        setUnit,
        distanceUnit,
        setDistanceUnit,
        weightStep,
        convertWeight,
        toKg,
        formatWeight,
      }}
    >
      {children}
    </UnitContext.Provider>
  );
};

export const useUnit = () => {
  const context = useContext(UnitContext);
  if (!context) {
    return {
      unit: 'kg',
      setUnit: () => {},
      distanceUnit: 'km',
      setDistanceUnit: () => {},
      weightStep: 2.5,
      convertWeight: (w) => w,
      toKg: (w) => w,
      formatWeight: (w) => `${w} kg`,
    };
  }
  return context;
};

export default UnitContext;
