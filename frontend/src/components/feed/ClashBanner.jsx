import React from 'react';
import { AlertTriangle, Clock, ArrowRight, Sparkles, X, ChevronRight } from 'lucide-react';
import { SketchButton } from '../common/SketchButton';

export const ClashBanner = ({
  clashData,
  onClose,
  onSelectAlternative,
  onOpenFreeGapFinder
}) => {
  if (!clashData || !clashData.is_clash) return null;

  const { message, conflicting_slot, walking_time_min, alternative_events } = clashData;

  return (
    <div className="relative mb-6 p-5 border-[3px] border-marker-red border-wobbly-md bg-[#fff0f0] shadow-sketchLg select-none transition-all animate-fadeIn">
      {/* Red Thumbtack Pin */}
      <div className="thumbtack" />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 p-1 border-2 border-pencil border-wobbly bg-white hover:bg-marker-red hover:text-white transition-colors cursor-pointer"
      >
        <X className="w-4 h-4 stroke-[2.5]" />
      </button>

      {/* Header */}
      <div className="flex items-start gap-2.5 mb-2">
        <div className="p-1.5 bg-marker-red text-white border-2 border-pencil border-wobbly shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div>
          <h4 className="font-marker text-2xl text-marker-red leading-tight">
            Schedule Conflict Detected! 🚨
          </h4>
          <p className="font-hand text-base text-pencil font-bold mt-0.5">
            {message}
          </p>
        </div>
      </div>

      {/* Conflicting Slot Details */}
      {conflicting_slot && (
        <div className="p-2.5 bg-white border-2 border-dashed border-marker-red border-wobbly mb-3 text-sm font-hand">
          <div className="flex items-center justify-between">
            <span className="font-bold text-pencil">
              📅 Conflicting commitment: {conflicting_slot.subject}
            </span>
            <span className="text-xs bg-marker-red text-white px-2 py-0.5 border border-pencil font-bold">
              {conflicting_slot.start} – {conflicting_slot.end}
            </span>
          </div>
          {walking_time_min > 0 && (
            <p className="text-xs text-pencil/80 mt-1">
              🚶‍♂️ Estimated walking transition requires ~{walking_time_min} minutes from {conflicting_slot.node_id}.
            </p>
          )}
        </div>
      )}

      {/* Non-Clashing Alternative Suggestions */}
      {alternative_events && alternative_events.length > 0 && (
        <div className="mt-3 pt-3 border-t-2 border-dashed border-marker-red/40">
          <span className="font-marker text-lg text-pencil block mb-2 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-marker-blue fill-marker-blue" />
            Recommended Conflict-Free Alternatives:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
            {alternative_events.map((altItem) => (
              <div
                key={altItem.event.id}
                className="p-3 bg-white border-2 border-pencil border-wobbly shadow-sketchHover hover:shadow-sketch transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-hand text-pencil/70 mb-1">
                    <span className="font-bold uppercase text-marker-blue">{altItem.event.category}</span>
                    <span>{altItem.event.start} – {altItem.event.end}</span>
                  </div>
                  <h5 className="font-marker text-lg text-pencil leading-tight mb-1">
                    {altItem.event.title}
                  </h5>
                  <p className="font-hand text-xs text-pencil/70 italic line-clamp-1 mb-2">
                    "{altItem.reason}"
                  </p>
                </div>

                <SketchButton
                  variant="postit"
                  onClick={() => onSelectAlternative(altItem.event)}
                  className="!py-1 !px-2 text-sm w-full"
                >
                  Switch to this Event ✍️
                </SketchButton>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Free Gap Finder Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-pencil/20">
        <span className="text-xs font-hand text-pencil/70">
          Looking for events that fit right into your empty class gaps?
        </span>
        <button
          onClick={onOpenFreeGapFinder}
          className="font-hand text-sm font-bold text-marker-blue hover:text-pencil underline cursor-pointer flex items-center gap-1"
        >
          Check "What fits my free hour?" drawer <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
