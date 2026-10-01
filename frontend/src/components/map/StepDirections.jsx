import React from 'react';
import { Volume2, VolumeX, Footprints, Clock, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { SketchButton } from '../common/SketchButton';

export const StepDirections = ({
  route,
  isSpeaking,
  currentStepIndex,
  onSpeakAll,
  onStopSpeak,
  isSpeechSupported
}) => {
  if (!route) {
    return (
      <div className="border-[3px] border-pencil border-wobbly-md bg-white p-5 shadow-sketch text-center">
        <p className="font-hand text-lg text-pencil/70">
          Pick an origin and destination to calculate walking trail directions.
        </p>
      </div>
    );
  }

  return (
    <div className="border-[3px] border-pencil border-wobbly-md bg-white p-4 md:p-5 shadow-sketch relative">
      {/* Tape decoration */}
      <div className="tape-strip" />

      {/* Header with Distance and ETA */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-dashed border-pencil/20 pb-3 mb-4">
        <div>
          <h4 className="font-marker text-2xl text-pencil">Trail Directions</h4>
          <div className="flex items-center gap-3 text-sm font-hand mt-1">
            <span className="flex items-center gap-1 font-bold text-marker-blue">
              <Footprints className="w-4 h-4 stroke-[2.5]" />
              {route.total_distance_m} meters
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 font-bold text-marker-red">
              <Clock className="w-4 h-4 stroke-[2.5]" />
              ~{route.eta_minutes} min walk (at 1.2 m/s)
            </span>
          </div>
        </div>

        {/* Voice Guidance Button */}
        {isSpeechSupported && (
          <div>
            {isSpeaking ? (
              <SketchButton
                variant="danger"
                onClick={onStopSpeak}
                className="!py-1.5 !px-3 text-base flex items-center gap-1.5"
              >
                <VolumeX className="w-4 h-4 stroke-[2.5]" />
                Stop Voice
              </SketchButton>
            ) : (
              <SketchButton
                variant="secondary"
                onClick={() => onSpeakAll(route.steps)}
                className="!py-1.5 !px-3 text-base flex items-center gap-1.5"
              >
                <Volume2 className="w-4 h-4 stroke-[2.5]" />
                Read Aloud
              </SketchButton>
            )}
          </div>
        )}
      </div>

      {/* Route Mode Indicators */}
      <div className="flex flex-wrap gap-2 mb-3">
        {route.used_accessible_only && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-hand font-bold bg-[#e8f5e9] text-[#2e7d32] border border-[#2e7d32] border-wobbly">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Step-Free Route
          </span>
        )}
        {route.rain_penalty_applied && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-hand font-bold bg-[#e3f2fd] text-marker-blue border border-marker-blue border-wobbly">
            ☂️ Rain-Sheltered Route
          </span>
        )}
      </div>

      {/* Steps List with Notebook Ruled Lines */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {route.steps.map((step, idx) => {
          const isCurrentSpoken = isSpeaking && currentStepIndex === idx;

          return (
            <div
              key={idx}
              className={`p-2.5 border-2 border-pencil border-wobbly transition-all flex items-start gap-2.5 ${
                isCurrentSpoken
                  ? 'bg-paper-yellow shadow-sketch scale-[1.01]'
                  : 'bg-paper-bg hover:bg-white'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-pencil text-white font-hand font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <div className="font-hand text-base text-pencil leading-tight">
                {step}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
