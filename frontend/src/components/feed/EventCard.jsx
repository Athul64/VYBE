import React from 'react';
import { Clock, MapPin, Users, Footprints, Sparkles, AlertCircle, Compass, Check } from 'lucide-react';
import { SketchButton } from '../common/SketchButton';
import { SketchCard } from '../common/SketchCard';

export const EventCard = ({
  rankedItem,
  onRsvp,
  onNavigate,
  onViewPass,
  isRsvpd = false,
  rotation = 0
}) => {
  const { event, reason, distance_m, walk_eta_min, has_clash, clash_reason, venue_name, score } = rankedItem;
  const isOverCapacity = event.rsvp_count > event.capacity;

  return (
    <SketchCard 
      rotation={rotation}
      decoration={has_clash ? 'tack' : isRsvpd ? 'tack-blue' : null}
      className={`relative mb-4 transition-all duration-150 ${has_clash ? 'border-marker-red/80 bg-[#fff5f5]' : 'bg-white'}`}
    >
      {/* Category & Relevance Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 text-xs font-hand font-bold bg-paper-muted border border-pencil border-wobbly text-pencil uppercase tracking-wider">
            {event.category}
          </span>
          <span className="text-xs font-hand text-pencil/60">
            Organized by {event.organizer}
          </span>
        </div>

        {/* Explainability Match Pill */}
        <div className="flex items-center gap-1 px-2 py-0.5 bg-paper-yellow border border-pencil border-wobbly text-xs font-hand font-bold text-pencil">
          <Sparkles className="w-3.5 h-3.5 text-marker-red fill-marker-red" />
          <span>Match: {Math.round(score * 100)}%</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="font-marker text-2xl text-pencil leading-tight mb-1.5">
        {event.title}
      </h3>

      {/* Plain Language Reason Line (PRD FR-2 & FR-16) */}
      <div className="p-2 mb-3 bg-paper-yellow/50 border-l-[3px] border-pencil text-sm font-hand italic text-pencil">
        💬 "{reason}"
      </div>

      {/* Description */}
      <p className="font-hand text-base text-pencil/80 mb-3 leading-snug">
        {event.description}
      </p>

      {/* Metadata Badges (Time, Venue, Distance, Attendance) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-xs font-hand">
        {/* Time */}
        <div className="p-1.5 bg-paper-bg border border-pencil border-wobbly flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-marker-blue shrink-0" />
          <span className="font-bold truncate">{event.start} – {event.end}</span>
        </div>

        {/* Venue */}
        <div className="p-1.5 bg-paper-bg border border-pencil border-wobbly flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-marker-red shrink-0" />
          <span className="font-bold truncate">{venue_name}</span>
        </div>

        {/* Walking ETA */}
        <div className="p-1.5 bg-paper-bg border border-pencil border-wobbly flex items-center gap-1.5">
          <Footprints className="w-3.5 h-3.5 text-pencil shrink-0" />
          <span className="truncate">{distance_m}m (~{walk_eta_min} min walk)</span>
        </div>

        {/* RSVP Count & Capacity Warning */}
        <div className={`p-1.5 border border-wobbly flex items-center gap-1.5 ${isOverCapacity ? 'bg-marker-red/10 border-marker-red text-marker-red font-bold' : 'bg-paper-bg border-pencil'}`}>
          <Users className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">
            {event.rsvp_count}/{event.capacity} RSVPs {isOverCapacity && '⚠️'}
          </span>
        </div>
      </div>

      {/* Clash Warning Callout if Event card has clash */}
      {has_clash && (
        <div className="mb-3 p-2 bg-marker-red/10 border-2 border-marker-red border-wobbly text-marker-red text-xs font-hand font-bold flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Warning: Overlaps with your timetable slot ({clash_reason || 'class conflict'}).</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t-2 border-dashed border-pencil/20">
        <div className="flex items-center gap-2">
          {isRsvpd ? (
            <SketchButton
              variant="postit"
              onClick={() => onViewPass(event)}
              className="!py-1.5 !px-3 text-base flex items-center gap-1"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              View Pass (QR)
            </SketchButton>
          ) : (
            <SketchButton
              variant={has_clash ? 'danger' : 'primary'}
              onClick={() => onRsvp(event)}
              className="!py-1.5 !px-4 text-base"
            >
              RSVP: Going! ✍️
            </SketchButton>
          )}
        </div>

        <SketchButton
          variant="secondary"
          onClick={() => onNavigate(event.node_id)}
          className="!py-1.5 !px-3 text-base flex items-center gap-1"
        >
          <Compass className="w-4 h-4 stroke-[2.5]" />
          Route to Venue
        </SketchButton>
      </div>
    </SketchCard>
  );
};
