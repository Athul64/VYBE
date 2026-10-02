import React, { useState, useEffect } from 'react';
import { X, Clock, Sparkles, MapPin, Footprints, Calendar, ArrowRight } from 'lucide-react';
import { SketchButton } from '../common/SketchButton';
import { API_BASE } from '../../config';

export const FreeGapFinder = ({
  isOpen,
  onClose,
  activePersonaKey,
  onRsvp,
  onNavigate
}) => {
  const [gaps, setGaps] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchFreeGaps();
    }
  }, [isOpen, activePersonaKey]);

  const fetchFreeGaps = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/free-gaps?student=${activePersonaKey}`);
      const data = await resp.json();
      setGaps(data);
    } catch (err) {
      console.error("Error fetching free gaps:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pencil/60 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-2xl bg-paper-bg border-[4px] border-pencil border-wobbly-md p-6 shadow-sketchLg max-h-[90vh] overflow-y-auto">
        {/* Authentic Tape Strip */}
        <div className="tape-strip !top-[-14px]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 border-2 border-pencil border-wobbly bg-paper-muted hover:bg-marker-red hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Header */}
        <div className="mb-4 border-b-2 border-dashed border-pencil/30 pb-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 bg-paper-yellow border border-pencil border-wobbly">
              <Sparkles className="w-4 h-4 text-marker-red fill-marker-red" />
            </span>
            <h3 className="font-marker text-3xl text-pencil">
              What Fits My Free Hour?
            </h3>
          </div>
          <p className="font-hand text-base text-pencil/80">
            Scans your class schedule gaps (≥ 45 mins), factors in walking transit time, and surfaces events you can reach and complete on time!
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="p-8 text-center font-hand text-xl text-pencil animate-pulse">
            Analyzing timetable gaps & pathfinder transit times... ⏳
          </div>
        ) : gaps.length === 0 ? (
          <div className="p-8 text-center bg-white border-2 border-dashed border-pencil border-wobbly">
            <p className="font-hand text-lg text-pencil/70">
              No free timetable gaps (≥ 45 mins) found for this student persona today.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {gaps.map((gap, gIdx) => (
              <div
                key={gIdx}
                className="p-4 bg-paper-yellow/40 border-[2.5px] border-pencil border-wobbly"
              >
                {/* Gap Header */}
                <div className="flex items-center justify-between border-b-2 border-dashed border-pencil/20 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-marker-blue stroke-[2.5]" />
                    <span className="font-marker text-xl text-pencil">
                      Free Window: {gap.gap_start} – {gap.gap_end}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 bg-pencil text-paper-yellow font-hand font-bold text-sm border-wobbly">
                    {gap.duration_minutes} min duration
                  </span>
                </div>

                {/* Matching Events for this Gap */}
                {gap.matching_events.length === 0 ? (
                  <p className="font-hand text-sm text-pencil/70 italic p-3 bg-white border border-pencil border-wobbly">
                    No scheduled campus events fall neatly into this specific gap duration with transit accounted for.
                  </p>
                ) : (
                  <div className="space-y-3">
                    <span className="text-xs font-hand font-bold uppercase tracking-wider text-pencil/70 block">
                      ⚡ Reachable Events Fitting This Gap:
                    </span>

                    {gap.matching_events.map((matchItem) => (
                      <div
                        key={matchItem.event.id}
                        className="p-3.5 bg-white border-2 border-pencil border-wobbly shadow-sketchHover hover:shadow-sketch transition-all"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-1 text-xs font-hand text-pencil/70 mb-1">
                          <span className="font-bold text-marker-blue uppercase">
                            {matchItem.event.category}
                          </span>
                          <span>
                            Slot: <strong>{matchItem.event.start} – {matchItem.event.end}</strong>
                          </span>
                        </div>

                        <h4 className="font-marker text-xl text-pencil leading-tight mb-1">
                          {matchItem.event.title}
                        </h4>

                        <p className="font-hand text-xs italic text-pencil/80 mb-2">
                          💬 "{matchItem.reason}"
                        </p>

                        <div className="flex items-center gap-3 text-xs font-hand text-pencil/80 mb-3">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-marker-red" />
                            {matchItem.venue_name}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Footprints className="w-3.5 h-3.5 text-marker-blue" />
                            ~{matchItem.walk_eta_min} min walk from current location
                          </span>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-dashed border-pencil/20">
                          <SketchButton
                            variant="primary"
                            onClick={() => {
                              onRsvp(matchItem.event);
                              onClose();
                            }}
                            className="!py-1 !px-3 text-sm"
                          >
                            RSVP to Event ✍️
                          </SketchButton>

                          <SketchButton
                            variant="secondary"
                            onClick={() => {
                              onNavigate(matchItem.event.node_id);
                              onClose();
                            }}
                            className="!py-1 !px-3 text-sm"
                          >
                            View Route Map 🗺️
                          </SketchButton>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
