import { useState, useEffect, useCallback } from 'react';
export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface GeolocationState {
  coordinates: Coordinates | null;
  error: string | null;
  loading: boolean;
  permissionGranted: boolean;
  timestamp: number | null;
}

export function useGeolocation(watch: boolean = false) {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    error: null,
    loading: false,
    permissionGranted: false,
    timestamp: null
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: 'Geolocation is not supported by your browser.',
        loading: false
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          coordinates: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy
          },
          error: null,
          loading: false,
          permissionGranted: true,
          timestamp: pos.timestamp
        });
      },
      (err) => {
        let msg = 'Failed to obtain location telemetry.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission denied. Using fallback simulated coordinates.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Location position unavailable.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out.';
        }

        // Graceful fallback with standard coordinates so emergency workflow never breaks
        setState({
          coordinates: {
            latitude: 37.7749,
            longitude: -122.4194,
            accuracy: 10
          },
          error: msg,
          loading: false,
          permissionGranted: false,
          timestamp: Date.now()
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  }, []);

  useEffect(() => {
    if (!watch || !navigator.geolocation) return;

    let watchId: number;
    try {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setState({
            coordinates: {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy
            },
            error: null,
            loading: false,
            permissionGranted: true,
            timestamp: pos.timestamp
          });
        },
        () => {
          // Keep current coordinates on watch failure
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch {
      // Ignored
    }

    return () => {
      if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
    };
  }, [watch]);

  return { ...state, requestLocation };
}
