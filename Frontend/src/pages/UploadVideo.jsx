import { useRef, useState } from 'react';
import { useTraffic } from '../context/TrafficContext';
import AIVisionOverlay from '../components/AIVisionOverlay';
import EmergencyAlertBanner from '../components/EmergencyAlertBanner';
import { exportMember2PerceptionCSV } from '../utils/exportPerceptionCsv';
import { useNavigate } from 'react-router-dom';
import {
  CloudUpload,
  FileVideo,
  CheckCircle2,
  ArrowUpCircle,
  Sparkles,
  ArrowRight,
  Zap,
  Film,
  FileSpreadsheet,
} from 'lucide-react';

export default function UploadVideoPage() {
  const {
    videoUrl,
    fileName,
    isCustomUpload,
    isAnalyzing,
    analysisProgress,
    laneMetrics,
    breakdown,
    totalVehicleCount,
    uploadCustomVideo,
  } = useTraffic();

  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const handleFile = (file) => {
    if (!file) return;
    uploadCustomVideo(file);
  };

  const handleChange = (event) => {
    const file = event.target.files?.[0];
    handleFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    handleFile(file);
  };

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <section className="flex flex-col gap-4 py-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="rounded-md bg-blue-100 px-2.5 py-1 text-[11px] font-bold text-blue-700 uppercase tracking-wider">
            MEMBER 2 PERCEPTION PIPELINE
          </span>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 tracking-tight">Add Traffic Footage</h2>
          <p className="mt-1 text-sm text-slate-500 max-w-2xl">
            Upload recorded traffic video for YOLO11 + ByteTrack vision inference, vehicle density extraction, and structured CSV export for Member 1 & Member 3.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => exportMember2PerceptionCSV(laneMetrics, fileName)}
            className="inline-flex items-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs font-bold text-blue-700 shadow-sm transition hover:bg-blue-100"
          >
            <FileSpreadsheet className="h-4 w-4 text-blue-600" />
            <span>Export Member 2 Perception CSV</span>
          </button>

          <button
            onClick={() => navigate('/optimizer')}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700"
          >
            <span>View Diagrammatic Animation</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Flashing Emergency Alert Banner if active */}
      <EmergencyAlertBanner />

      {/* Upload Dropzone */}
      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card space-y-4">
        <div
          className={`flex min-h-[260px] flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-6 transition-all duration-200 ${
            dragActive ? 'border-blue-500 bg-blue-50/50 scale-[0.99]' : 'border-slate-300 bg-slate-50/60 hover:border-slate-400'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 shadow-sm">
            <CloudUpload className="h-8 w-8" />
          </div>

          <div className="space-y-1 text-center">
            <p className="text-xl font-bold text-slate-900">Drag & drop your traffic video here</p>
            <p className="text-xs font-medium text-slate-500">Supported formats: MP4, AVI, MOV (Max 500MB)</p>
          </div>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700"
          >
            <ArrowUpCircle className="h-4 w-4" />
            <span>Browse video files</span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="video/mp4,video/avi,video/quicktime"
            className="hidden"
            onChange={handleChange}
          />
        </div>

        {/* Uploaded File Summary & Direct HTML5 Player */}
        {fileName && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-600 p-2.5 text-white">
                  <Film className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold">Active Video Source</p>
                  <p className="text-sm font-bold text-slate-900">{fileName}</p>
                </div>
              </div>

              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Ready & Active</span>
              </span>
            </div>

            {/* Explicit HTML5 Native Video Player with Full Browser Controls */}
            {isCustomUpload && (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-black mt-2">
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full max-h-[340px] object-contain"
                />
              </div>
            )}
          </div>
        )}

        {/* Analysis Progress */}
        {isAnalyzing && (
          <div className="space-y-2 rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center justify-between text-xs text-blue-800 font-bold">
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 animate-spin text-blue-600" />
                Running YOLO11 + ByteTrack Vehicle Detection Engine...
              </span>
              <span>{analysisProgress}%</span>
            </div>
            <div className="overflow-hidden rounded-full bg-blue-200 h-2">
              <div
                className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                style={{ width: `${analysisProgress}%` }}
              />
            </div>
          </div>
        )}
      </section>

      {/* Video Preview & Car Density Extraction Results */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileVideo className="h-5 w-5 text-blue-600" />
              <span>YOLO11 + ByteTrack Vision Feed</span>
            </h3>
            <span className="rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
              Source: <strong>{fileName}</strong>
            </span>
          </div>

          <AIVisionOverlay height="440px" />
        </div>

        {/* Extracted Density Breakdown */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card space-y-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Member 2 Output Telemetry</p>
            <h3 className="mt-1 text-xl font-bold text-slate-900">Perception Extraction</h3>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">Total Vehicles</p>
                <p className="text-3xl font-extrabold text-slate-900 mt-1">{totalVehicleCount}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-500">Overall Density</p>
                <span className="mt-1 inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700 border border-red-200">
                  Critical (84%)
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
              <p className="text-xs font-bold text-slate-800">Vehicle Type Breakdown</p>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <div className="flex justify-between rounded-xl bg-white border border-slate-200 p-2 text-slate-700">
                  <span>Cars</span> <strong className="text-blue-600">{breakdown.cars}</strong>
                </div>
                <div className="flex justify-between rounded-xl bg-white border border-slate-200 p-2 text-slate-700">
                  <span>Trucks</span> <strong className="text-amber-600">{breakdown.trucks}</strong>
                </div>
                <div className="flex justify-between rounded-xl bg-white border border-slate-200 p-2 text-slate-700">
                  <span>Buses</span> <strong className="text-purple-600">{breakdown.buses}</strong>
                </div>
                <div className="flex justify-between rounded-xl bg-red-50 border border-red-200 p-2 text-red-700">
                  <span>Emergency</span> <strong>{breakdown.emergency}</strong>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2.5">
              <p className="text-xs font-bold text-slate-800">Corridor Vehicle Counts</p>
              {Object.entries(laneMetrics).map(([laneKey, data]) => (
                <div key={laneKey} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-700">
                    <span className="uppercase font-bold">{laneKey} Corridor</span>
                    <span>{data.count} vehicles ({data.density})</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        data.density === 'Critical' ? 'bg-red-500' : data.density === 'High' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, (data.count / 20) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => exportMember2PerceptionCSV(laneMetrics, fileName)}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Export CSV for Member 1 & Member 3</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
