import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

export type EventType = "harsh_brake" | "acceleration" | "crash" | "sos" | "manual";

export type SafetyEvent = {
  id: string;
  type: EventType;
  timestamp: number;
  location: { lat: number; lng: number } | null;
  speed: number;
};

type RecordingContextType = {
  isRecording: boolean;
  recordingDuration: number;
  gpsActive: boolean;
  gpsCoords: { lat: number; lng: number } | null;
  speed: number;
  accelerometerData: { x: number; y: number; z: number };
  gyroscopeData: { x: number; y: number; z: number };
  events: SafetyEvent[];
  startRecording: () => void;
  stopRecording: () => void;
  triggerSOS: () => void;
  addEvent: (type: EventType) => void;
};

const RecordingContext = createContext<RecordingContextType | null>(null);

const EVENTS_KEY = "aerofleet_events";

export function RecordingProvider({ children }: { children: React.ReactNode }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [gpsActive, setGpsActive] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [speed, setSpeed] = useState(0);
  const [accelerometerData, setAccelerometerData] = useState({ x: 0, y: 0, z: 0 });
  const [gyroscopeData, setGyroscopeData] = useState({ x: 0, y: 0, z: 0 });
  const [events, setEvents] = useState<SafetyEvent[]>([]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sensorRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(EVENTS_KEY);
        if (stored) setEvents(JSON.parse(stored));
      } catch {}
    })();
  }, []);

  const saveEvents = useCallback(async (evts: SafetyEvent[]) => {
    try {
      await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(evts.slice(-50)));
    } catch {}
  }, []);

  const startRecording = useCallback(() => {
    setIsRecording(true);
    setRecordingDuration(0);
    setGpsActive(true);
    setGpsCoords({ lat: 28.6139 + (Math.random() - 0.5) * 0.01, lng: 77.2090 + (Math.random() - 0.5) * 0.01 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    timerRef.current = setInterval(() => {
      setRecordingDuration((d) => d + 1);
    }, 1000);

    sensorRef.current = setInterval(() => {
      const t = Date.now() / 1000;
      setAccelerometerData({
        x: Math.sin(t * 1.1) * 0.3 + (Math.random() - 0.5) * 0.05,
        y: Math.sin(t * 0.7) * 0.2 + (Math.random() - 0.5) * 0.05,
        z: 9.81 + Math.sin(t * 1.3) * 0.1,
      });
      setGyroscopeData({
        x: Math.sin(t * 0.9) * 0.05,
        y: Math.sin(t * 1.2) * 0.03,
        z: Math.sin(t * 0.6) * 0.04,
      });
      setSpeed(40 + Math.sin(t * 0.3) * 20 + (Math.random() - 0.5) * 5);
      setGpsCoords((prev) =>
        prev
          ? { lat: prev.lat + (Math.random() - 0.5) * 0.0001, lng: prev.lng + (Math.random() - 0.5) * 0.0001 }
          : null
      );
    }, 500);
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    setGpsActive(false);
    setSpeed(0);
    if (timerRef.current) clearInterval(timerRef.current);
    if (sensorRef.current) clearInterval(sensorRef.current);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const addEvent = useCallback((type: EventType) => {
    const newEvent: SafetyEvent = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      type,
      timestamp: Date.now(),
      location: gpsCoords,
      speed,
    };
    setEvents((prev) => {
      const updated = [newEvent, ...prev];
      saveEvents(updated);
      return updated;
    });
  }, [gpsCoords, speed, saveEvents]);

  const triggerSOS = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    addEvent("sos");
  }, [addEvent]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (sensorRef.current) clearInterval(sensorRef.current);
    };
  }, []);

  return (
    <RecordingContext.Provider
      value={{
        isRecording,
        recordingDuration,
        gpsActive,
        gpsCoords,
        speed,
        accelerometerData,
        gyroscopeData,
        events,
        startRecording,
        stopRecording,
        triggerSOS,
        addEvent,
      }}
    >
      {children}
    </RecordingContext.Provider>
  );
}

export function useRecording() {
  const ctx = useContext(RecordingContext);
  if (!ctx) throw new Error("useRecording must be used within RecordingProvider");
  return ctx;
}
