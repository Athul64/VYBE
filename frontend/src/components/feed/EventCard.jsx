import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, Users, Footprints, Sparkles, AlertCircle, Compass, Check, ArrowUpRight } from 'lucide-react';

export const EventCard = ({
  rankedItem,
  onRsvp,
  onNavigate,
  onViewPass,
  isRsvpd = false
}) => {
  const navigate = useNavigate();
  const { event, reason, distance_m, walk_eta_min, has_clash, clash_reason, venue_name, score } = rankedItem;
  const isOverCapacity = event.rsvp_count > event.capacity;
  const imageUrl = event.image_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80";

  const handleCardClick = (e) => {
    // If the click is on an interactive button or input, do not trigger card navigation
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    navigate(`/events/${event.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`relative p-3.5 border-2 rounded-xl transition-all duration-150 shadow-[3px_3px_0px_#2d2d2d] hover:shadow-[5px_5px_0px_#2d2d2d] hover:-translate-y-0.5 cursor-pointer ${
        has_clash ? 'border-marker-red bg-[#fff7f7]' : isRsvpd ? 'bg-[#f6faff] border-marker-blue' : 'bg-white border-pencil'
      }`}
    >
      {/* Category & Relevance Badge */}
      <div className="flex items-center justify-between gap-1 mb-2 font-sans">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-xs font-bold bg-paper-muted border border-pencil rounded text-pencil uppercase tracking-wider">
            {event.category}
          </span>
          <span className="text-xs text-pencil/70 truncate max-w-[150px] font-medium">
            {event.organizer}
          </span>
        </div>

        {/* Explainability Match Pill */}
        <div className="flex items-center gap-1 px-2 py-0.5 bg-paper-yellow border border-pencil rounded text-xs font-bold text-pencil shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-marker-red fill-marker-red" />
          <span>{Math.round(score * 100)}% match</span>
        </div>
      </div>

      {/* Main Content with Polaroid Thumbnail & Title */}
      <div className="flex gap-3 items-start mb-2.5">
        {/* Polaroid Style Thumbnail */}
        <div 
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/events/${event.id}`);
          }}
          className="w-24 h-24 sm:w-26 sm:h-26 shrink-0 bg-white p-1 pb-3 border-2 border-pencil rounded-md shadow-[2px_2px_0px_#2d2d2d] group cursor-pointer relative overflow-hidden flex flex-col items-center"
          title="Click to view full event photo and details"
        >
          <div className="w-full h-full relative overflow-hidden rounded-sm bg-paper-muted">
            <img 
              src={imageUrl} 
              alt={event.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=400&q=80";
              }}
            />
            <div className="absolute inset-0 bg-pencil/0 group-hover:bg-pencil/25 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 text-[10px] bg-white border border-pencil px-1.5 py-0.5 rounded font-bold shadow-xs">
                Inspect 🔍
              </span>
            </div>
          </div>
          <span className="text-[9px] font-hand font-bold text-pencil/70 pt-0.5 truncate max-w-full">
            ASIET Photo
          </span>
        </div>

        {/* Title, Explainability & Snippet */}
        <div className="flex-1 min-w-0">
          <h3 
            className="font-marker text-lg sm:text-xl text-pencil leading-tight mb-1 hover:text-marker-blue transition-colors flex items-center justify-between gap-1 group/title"
          >
            <span className="truncate">{event.title}</span>
            <ArrowUpRight className="w-4 h-4 text-pencil/40 group-hover/title:text-marker-blue shrink-0" />
          </h3>

          {/* Plain Language Reason Line */}
          <div className="p-1.5 mb-1.5 bg-paper-yellow/50 border-l-[3px] border-pencil rounded-r text-xs font-hand italic text-pencil leading-tight line-clamp-2">
            💬 "{reason}"
          </div>

          {/* Description */}
          <p className="font-sans text-xs text-pencil/80 leading-snug line-clamp-2">
            {event.description}
          </p>
        </div>
      </div>

      {/* Metadata Badges (Time, Venue, Distance, Attendance) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-2.5 text-xs font-sans">
        {/* Time */}
        <div className="p-1.5 bg-paper-bg border border-pencil/30 rounded flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-marker-blue shrink-0" />
          <span className="font-semibold truncate">{event.start} – {event.end}</span>
        </div>

        {/* Venue */}
        <div className="p-1.5 bg-paper-bg border border-pencil/30 rounded flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-marker-red shrink-0" />
          <span className="font-semibold truncate">{venue_name}</span>
        </div>

        {/* Walking ETA */}
        <div className="p-1.5 bg-paper-bg border border-pencil/30 rounded flex items-center gap-1.5">
          <Footprints className="w-3.5 h-3.5 text-pencil shrink-0" />
          <span className="font-medium truncate">{distance_m}m (~{walk_eta_min}m)</span>
        </div>

        {/* RSVP Count & Capacity Warning */}
        <div className={`p-1.5 rounded flex items-center gap-1.5 ${
          isOverCapacity ? 'bg-marker-red/10 border border-marker-red text-marker-red font-bold' : 'bg-paper-bg border border-pencil/30'
        }`}>
          <Users className="w-3.5 h-3.5 shrink-0" />
          <span className="font-medium truncate">
            {event.rsvp_count}/{event.capacity} {isOverCapacity && '⚠️'}
          </span>
        </div>
      </div>

      {/* Clash Warning Callout if Event card has clash */}
      {has_clash && (
        <div className="mb-2.5 p-2 bg-marker-red/10 border border-marker-red rounded text-marker-red text-xs font-sans font-bold flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Warning: Overlaps with {clash_reason || 'timetable slot'}.</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-dashed border-pencil/20 font-sans">
        <div className="flex items-center gap-2">
          {/* Detailed View CTA */}
          <button
            onClick={() => navigate(`/events/${event.id}`)}
            className="px-2.5 py-1 text-xs font-bold border-2 border-pencil rounded-lg shadow-[2px_2px_0px_#2d2d2d] bg-paper-yellow hover:bg-pencil hover:text-paper-yellow text-pencil flex items-center gap-1 cursor-pointer transition-all"
          >
            <span>View Details 🔍</span>
          </button>

          {isRsvpd ? (
            <button
              onClick={() => onViewPass(event)}
              className="px-2.5 py-1 text-xs font-bold bg-[#e8f5e9] hover:bg-pencil hover:text-white border-2 border-pencil rounded-lg shadow-[2px_2px_0px_#2d2d2d] flex items-center gap-1 cursor-pointer transition-all text-emerald-800"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Pass (QR)</span>
            </button>
          ) : (
            <button
              onClick={() => onRsvp(event)}
              className={`px-2.5 py-1 text-xs font-bold border-2 border-pencil rounded-lg shadow-[2px_2px_0px_#2d2d2d] cursor-pointer transition-all ${
                has_clash ? 'bg-marker-red text-white hover:bg-pencil' : 'bg-white hover:bg-marker-red hover:text-white text-pencil'
              }`}
            >
              RSVP ✍️
            </button>
          )}
        </div>

        <button
          onClick={() => onNavigate(event.node_id)}
          className="px-2.5 py-1 text-xs font-bold border-2 border-pencil rounded-lg shadow-[2px_2px_0px_#2d2d2d] bg-paper-muted hover:bg-marker-blue hover:text-white text-pencil flex items-center gap-1 cursor-pointer transition-all"
        >
          <Compass className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Route Map</span>
        </button>
      </div>
    </div>
  );
};
