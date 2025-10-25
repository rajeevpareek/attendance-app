import { useState, useCallback } from 'react';
import { type Coordinates } from '../types';

interface GeolocationState {
  loading: boolean;
  error: GeolocationPositionError | null;
  coordinates: Coordinates | null;
}

export const useGeolocation = () => {
  const [geolocation, setGeolocation] = useState<GeolocationState>({
    loading: false,
    error: null,
    coordinates: null,
  });

  const getGeolocation = useCallback(() => {
    return new Promise<Coordinates>((resolve, reject) => {
      if (!navigator.geolocation) {
        const error = new Error("Geolocation is not supported by your browser.");
        // We can't use GeolocationPositionError here, so we fake it.
        // FIX: Explicitly type the custom error object as GeolocationPositionError to ensure type compatibility.
        // This resolves the error where properties like `PERMISSION_DENIED` were inferred as `number` instead of the required literal type `1`.
        // The error code is also updated to a more semantically correct value.
        const positionError: GeolocationPositionError = {
            code: 2, // POSITION_UNAVAILABLE
            message: error.message,
            PERMISSION_DENIED: 1,
            POSITION_UNAVAILABLE: 2,
            TIMEOUT: 3
        };
        setGeolocation({ loading: false, error: positionError, coordinates: null });
        reject(positionError);
        return;
      }

      setGeolocation({ loading: true, error: null, coordinates: null });

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: Coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setGeolocation({ loading: false, error: null, coordinates: coords });
          resolve(coords);
        },
        (error) => {
          setGeolocation({ loading: false, error, coordinates: null });
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }, []);

  return { ...geolocation, getGeolocation };
};
