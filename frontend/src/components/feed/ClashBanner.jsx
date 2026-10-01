import React from 'react';
import { AlertTriangle, Clock, Sparkles, X, ChevronRight } from 'lucide-react';

export const ClashBanner = ({
  clashData,
  onClose,
  onSelectAlternative,
  onOpenFreeGapFinder
}) => {
  if (!clashData || !clashData.is_clash) return null;

  const { message, conflicting_slot, walking_time_min, alternative_events } = clashData;

  return (
    <div className="relative mb-3 p-3.5 border-2 border-marker-red rounded-xl bg-[#fff2f2] shadow-[3px_3px_0px_#2d2d2d] select-none transition-all font-sans">
      
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-2.5 right-2.5 p-1 border border-pencil rounded-md bg-white hover:bg-marker-red hover:text-white transition-colors cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Header */}
      <div className="flex items-start gap-2 mb-2 pr-6">
        <div className="p-1 bg-marker-red text-white rounded shrink-0 mt-0.5">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div>
          <h4 className="font-marker text-lg text-marker-red leading-tight">
            Schedule Conflict Detected! 🚨
          </h4>
          <p className="text-xs text-pencil font-semibold mt-0.5">
            {message}
          </p>
        </div>
      </div>

      {/* Conflicting Slot Details */}
      {conflicting_slot && (
        <div className="p-2 bg-white border border-dashed border-marker-red rounded-lg mb-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-pencil">
              📅 Conflicting commitment: {conflicting_slot.subject}
            </span>
            <span className="text-[11px] bg-marker-red text-white px-2 py-0.5 rounded font-bold">
              {conflicting_slot.start} – {conflicting_slot.end}
            </span>
          </div>
          {walking_time_min > 0 && (
            <p className="text-[11px] text-pencil/80 mt-1">
              🚶‍♂️ Estimated walking transition requires ~{walking_time_min} minutes from {conflicting_slot.node_id}.
            </p>
          )}
        </div>
      )}

      {/* Non-Clashing Alternative Suggestions */}
      {alternative_events && alternative_events.length > 0 && (
        <div className="mt-2 pt-2 border-t border-dashed border-marker-red/40">
          <span className="font-bold text-xs text-pencil block mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-marker-blue fill-marker-blue" />
            Recommended Conflict-Free Alternatives:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
            {alternative_events.map((altItem) => (
              <div
                key={altItem.event.id}
                className="p-2.5 bg-white border border-pencil rounded-lg shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-pencil/70 mb-1">
                    <span className="font-bold uppercase text-marker-blue">{altItem.event.category}</span>
                    <span>{altItem.event.start} – {altItem.event.end}</span>
                  </div>
                  <h5 className="font-marker text-base text-pencil leading-tight mb-1">
                    {altItem.event.title}
                  </h5>
                  <p className="text-[11px] text-pencil/70 italic line-clamp-1 mb-2 font-hand">
                    "{altItem.reason}"
                  </p>
                </div>

                <button
                  onClick={() => onSelectAlternative(altItem.event)}
                  className="py-1 px-2 text-xs font-bold bg-paper-yellow hover:bg-pencil hover:text-white border border-pencil rounded-md transition-all cursor-pointer w-full text-center"
                >
                  Switch to this Event ✍️
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Free Gap Finder Trigger */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-pencil/20 text-xs">
        <span className="text-pencil/70 text-[11px]">
          Have an open study slot?
        </span>
        <button
          onClick={onOpenFreeGapFinder}
          className="font-bold text-marker-blue hover:text-pencil underline cursor-pointer flex items-center gap-0.5 text-xs"
        >
          Check "What fits my free hour?" drawer <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
