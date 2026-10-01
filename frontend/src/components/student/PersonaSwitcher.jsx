import React from 'react';
import { User, Accessibility, MapPin, Calendar, BookOpen } from 'lucide-react';
import { SketchButton } from '../common/SketchButton';
import { StickyNote } from '../common/StickyNote';

export const PersonaSwitcher = ({
  personas = {},
  activePersonaKey = 'meera',
  onSelectPersona = () => {},
  timetable = []
}) => {
  const currentPersona = personas[activePersonaKey];

  return (
    <div className="border-[3px] border-pencil border-wobbly-md bg-white p-4 md:p-5 shadow-sketch relative">
      {/* Tape Decoration */}
      <div className="tape-strip" />

      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-dashed border-pencil/20 pb-3 mb-3">
        <div>
          <h3 className="font-marker text-2xl text-pencil flex items-center gap-2">
            <User className="w-5 h-5 text-marker-blue stroke-[2.5]" />
            Student Notebook Dossier
          </h3>
          <p className="font-hand text-sm text-pencil/70">
            Switch demo persona to test tailored recommendation & routing profiles.
          </p>
        </div>

        {/* Persona toggle buttons */}
        <div className="flex items-center gap-2">
          {Object.entries(personas).map(([key, p]) => (
            <SketchButton
              key={key}
              variant={activePersonaKey === key ? 'activeTab' : 'secondary'}
              onClick={() => onSelectPersona(key)}
              className="!py-1.5 !px-3 text-base"
            >
              {p.name} {p.needs_step_free ? '♿' : '💻'}
            </SketchButton>
          ))}
        </div>
      </div>

      {currentPersona && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Profile Card */}
          <div className="md:col-span-1 p-3 bg-paper-bg border-2 border-pencil border-wobbly">
            <div className="flex items-center justify-between mb-1">
              <span className="font-marker text-xl text-pencil">{currentPersona.name}</span>
              {currentPersona.needs_step_free && (
                <span className="px-2 py-0.5 text-xs font-hand font-bold bg-marker-blue text-white border border-pencil border-wobbly flex items-center gap-1">
                  <Accessibility className="w-3.5 h-3.5" /> Wheelchair User
                </span>
              )}
            </div>
            <p className="font-hand text-sm text-pencil/80 mb-2">{currentPersona.department}</p>
            
            <div className="flex items-center gap-1 text-xs font-hand text-pencil/70 mb-2">
              <MapPin className="w-3.5 h-3.5 text-marker-red" />
              <span>Current Spot: <strong>{currentPersona.location_name}</strong></span>
            </div>

            <div className="mt-2">
              <span className="text-xs font-hand font-bold text-pencil uppercase tracking-wider block mb-1">
                Interests:
              </span>
              <div className="flex flex-wrap gap-1">
                {currentPersona.interests.map((interest, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-xs font-hand bg-white border border-pencil border-wobbly text-pencil"
                  >
                    #{interest}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Timetable Snippet */}
          <div className="md:col-span-2 p-3 bg-paper-yellow/40 border-2 border-pencil border-wobbly">
            <div className="flex items-center justify-between mb-2">
              <span className="font-marker text-lg text-pencil flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-pencil stroke-[2.5]" />
                Today's Schedule & Gaps
              </span>
              <span className="text-xs font-hand text-pencil/60">Class timetable</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-hand">
              {currentPersona.timetable_today.map((slot, idx) => {
                const isFree = slot.subject.toLowerCase().includes('free') || !slot.node_id;

                return (
                  <div
                    key={idx}
                    className={`p-2 border border-pencil border-wobbly flex items-center justify-between ${
                      isFree 
                        ? 'bg-paper-yellow border-dashed border-pencil font-bold text-[#b78103]' 
                        : 'bg-white text-pencil'
                    }`}
                  >
                    <div>
                      <div className="text-xs text-pencil/60">{slot.start} – {slot.end}</div>
                      <div className="font-bold leading-tight">{slot.subject}</div>
                    </div>
                    {isFree ? (
                      <span className="text-xs px-1.5 py-0.5 bg-pencil text-paper-yellow rounded-sm">
                        Free Gap 💡
                      </span>
                    ) : (
                      <span className="text-xs text-pencil/60 font-mono">
                        {slot.node_id}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
