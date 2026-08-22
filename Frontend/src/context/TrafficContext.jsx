import { createContext, useContext, useEffect, useState } from 'react';

const TrafficContext = createContext(null);

const initialLaneMetrics = {
  north: { count: 18, queueLength: 42, avgSpeed: 31 },
  south: { count: 24, queueLength: 58, avgSpeed: 24 },
  east: { count: 15, queueLength: 35, avgSpeed: 36 },
  west: { count: 11, queueLength: 26, avgSpeed: 41 },
};

const initialSignalState = {
  activeGreenLane: 'south',
  greenTimer: 28,
  minGreen: 8,
  maxGreen: 45,
  delayReduction: 24,
};

export function TrafficProvider({ children }) {
  const [laneMetrics, setLaneMetrics] = useState(initialLaneMetrics);
  const [breakdown, setBreakdown] = useState({ cars: 43, trucks: 12, buses: 8, emergency: 0 });
  const [signalState, setSignalState] = useState(initialSignalState);
  const [activeEmergency, setActiveEmergency] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [fileName, setFileName] = useState('Live intersection feed');
  const [isCustomUpload, setIsCustomUpload] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const totalVehicleCount = Object.values(laneMetrics).reduce((total, lane) => total + lane.count, 0);
  const avgSpeed = Math.round(
    Object.values(laneMetrics).reduce((total, lane) => total + lane.avgSpeed, 0) / Object.keys(laneMetrics).length,
  );

  const updateLaneVehicleCount = (lane, count) => {
    setLaneMetrics((previous) => ({
      ...previous,
      [lane]: { ...previous[lane], count: Math.max(0, count) },
    }));
  };

  const vehicleClearedLane = (lane) => {
    setLaneMetrics((previous) => ({
      ...previous,
      [lane]: { ...previous[lane], count: Math.max(0, previous[lane].count - 1) },
    }));
  };

  const triggerEmergency = (lane = 'south') => {
    setActiveEmergency({ lane });
    setSignalState((previous) => ({ ...previous, activeGreenLane: lane, greenTimer: previous.maxGreen }));
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSignalState((previous) => ({
        ...previous,
        greenTimer: previous.greenTimer > 1 ? previous.greenTimer - 1 : previous.maxGreen,
      }));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => () => {
    if (isCustomUpload && videoUrl) URL.revokeObjectURL(videoUrl);
  }, [isCustomUpload, videoUrl]);

  const uploadCustomVideo = (file) => {
    if (videoUrl && isCustomUpload) URL.revokeObjectURL(videoUrl);
    setVideoUrl(URL.createObjectURL(file));
    setFileName(file.name);
    setIsCustomUpload(true);
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    let progress = 0;
    const timer = window.setInterval(() => {
      progress += 20;
      setAnalysisProgress(progress);
      if (progress >= 100) {
        window.clearInterval(timer);
        setIsAnalyzing(false);
      }
    }, 250);
  };

  return (
    <TrafficContext.Provider
      value={{
        laneMetrics,
        setLaneMetrics,
        breakdown,
        setBreakdown,
        signalState,
        setSignalState,
        activeEmergency,
        setActiveEmergency,
        triggerEmergency,
        clearEmergency: () => setActiveEmergency(null),
        updateLaneVehicleCount,
        vehicleClearedLane,
        totalVehicleCount,
        avgSpeed,
        videoUrl,
        fileName,
        isCustomUpload,
        isAnalyzing,
        analysisProgress,
        uploadCustomVideo,
      }}
    >
      {children}
    </TrafficContext.Provider>
  );
}

export function useTraffic() {
  const context = useContext(TrafficContext);
  if (!context) throw new Error('useTraffic must be used within TrafficProvider');
  return context;
}
