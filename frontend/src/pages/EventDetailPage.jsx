import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Clock, MapPin, Users, Footprints, Sparkles, 
  AlertTriangle, Check, Compass, Ticket, Volume2, VolumeX,
  Accessibility, CloudRain, ShieldCheck, Building2, Calendar
} from 'lucide-react';

import { SketchButton } from '../components/common/SketchButton';
import { CampusMapSvg } from '../components/map/CampusMapSvg';
import { ClashBanner } from '../components/feed/ClashBanner';
import { useSpeech } from '../hooks/useSpeech';

const API_BASE = 'http://localhost:8000/api';

export const EventDetailPage = ({
  events = [],
  personas = {},
  activePersonaKey,
  rsvpdEventIds = [],
  onRsvp,
  onOpenPass,
  campusNodes = {},
  campusEdges = [],
  venues = {},
  onOpenFreeGap,
  currentUser,
  onOpenLogin,
  theme = 'light',
  onToggleTheme = () => {}
}) => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [stepFree, setStepFree] = useState(false);
  const [rainMode, setRainMode] = useState(false);
  const [route, setRoute] = useState(null);
  const [clashResult, setClashResult] = useState(null);

  const {
    isSupported: isSpeechSupported,
    isSpeaking,
    currentStepIndex,
    speakSteps,
    stop: stopSpeech
  } = useSpeech();

  const [fetchedItem, setFetchedItem] = useState(null);
  const [loadingEvent, setLoadingEvent] = useState(false);

  const currentPersona = personas[activePersonaKey];
  const rankedItem = events.find(item => item.event.id === eventId) || fetchedItem;
  const event = rankedItem ? rankedItem.event : null;

  // Fallback fetch if event not in local events array (e.g. direct URL navigation)
  useEffect(() => {
    if (!event && eventId) {
      setLoadingEvent(true);
      fetch(`${API_BASE}/events/${eventId}?student=${activePersonaKey}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) setFetchedItem(data);
        })
        .catch(err => console.error("Event fetch error:", err))
        .finally(() => setLoadingEvent(false));
    }
  }, [eventId, event, activePersonaKey]);

  // Set initial step-free based on student mobility needs
  useEffect(() => {
    if (currentPersona) {
      setStepFree(currentPersona.needs_step_free);
    }
  }, [currentPersona]);

  // Calculate route from student's current location to this event's venue
  useEffect(() => {
    if (currentPersona && event) {
      const from = currentPersona.current_location_node || 'N01';
      const to = event.node_id;
      fetchRoute(from, to, stepFree, rainMode);
      checkClash(event);
    }
  }, [currentPersona, event, stepFree, rainMode]);

  const fetchRoute = async (from, to, step_free, rain_penalty) => {
    try {
      const query = new URLSearchParams({
        from,
        to,
        stepfree: String(step_free),
        covered: String(rain_penalty)
      });
      const resp = await fetch(`${API_BASE}/route?${query.toString()}`);
      if (resp.ok) {
        const data = await resp.json();
        setRoute(data);
      } else {
        setRoute(null);
      }
    } catch (err) {
      console.error("Route error:", err);
      setRoute(null);
    }
  };

  const checkClash = async (evt) => {
    try {
      const resp = await fetch(`${API_BASE}/check-clash`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: currentUser?.persona_key || activePersonaKey,
          event_id: evt.id
        })
      });
      const data = await resp.json();
      if (data.clash_check && data.clash_check.is_clash) {
        setClashResult(data.clash_check);
      } else {
        setClashResult(null);
      }
    } catch (err) {
      console.error("Clash check failed:", err);
    }
  };

  if (loadingEvent) {
    return (
      <div className="min-h-screen bg-paper-bg p-8 flex flex-col items-center justify-center font-hand">
        <h2 className="font-marker text-3xl mb-2 text-pencil">Opening Campus Event Notebook... ⏳</h2>
        <p className="text-pencil/70 text-sm">Fetching event details & trail from Adi Shankara Campus ledger...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-paper-bg p-8 flex flex-col items-center justify-center font-hand">
        <h2 className="font-marker text-3xl mb-4">Event Not Found</h2>
        <SketchButton variant="primary" onClick={() => navigate('/events')}>
          ← Back to Events Feed
        </SketchButton>
      </div>
    );
  }

  const isRsvpd = rsvpdEventIds.includes(event.id);
  const isOverCapacity = event.rsvp_count > event.capacity;
  const venueInfo = venues[event.venue_id];
  const originNodeName = campusNodes[currentPersona?.current_location_node]?.name || "Current Spot";
  const venueNodeName = campusNodes[event.node_id]?.name || event.venue_id;

  return (
    <div className="min-h-screen bg-paper-bg text-pencil font-sans pb-16 selection:bg-paper-yellow selection:text-pencil">
      
      {/* Sticky Top Header */}
      <header className="border-b-2 border-pencil bg-white/80 backdrop-blur-xs py-3 px-4 sm:px-8 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/events')}
              className="px-3 py-1 font-hand font-bold text-sm border-2 border-pencil border-wobbly bg-paper-muted hover:bg-paper-yellow transition-all cursor-pointer flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Events Notebook</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm font-hand">
            <span className="text-pencil/70 hidden sm:inline">Active Pass:</span>
            <div
              onClick={onOpenLogin}
              title="Click to switch account or sign in"
              className="px-2.5 py-0.5 bg-paper-yellow border-2 border-pencil border-wobbly font-bold cursor-pointer hover:bg-white transition-all shadow-xs flex items-center gap-1.5"
            >
              <span>🪪 {currentUser?.student_id || 'Sign In'}</span>
              <span className="text-pencil/70">({currentUser?.name || currentPersona?.name})</span>
            </div>

            <button
              onClick={onToggleTheme}
              title={theme === 'dark' ? "Switch to Light Notebook" : "Switch to Dark Slate Blackboard"}
              className="p-1 border-2 border-pencil rounded-lg bg-paper-bg hover:bg-paper-yellow transition-colors cursor-pointer shadow-[2px_2px_0px_#2d2d2d] flex items-center justify-center text-xs"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Detail Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        
        {/* Clash Alert Banner at Top if Conflict Detected */}
        {clashResult && (
          <div className="mb-6">
            <ClashBanner
              clashData={clashResult}
              onClose={() => setClashResult(null)}
              onSelectAlternative={(altEvent) => {
                navigate(`/events/${altEvent.id}`);
              }}
              onOpenFreeGapFinder={onOpenFreeGap}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Event Story, Explainability & Agenda (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Primary Event Header Note */}
            <div className="relative p-6 bg-white border-[3.5px] border-pencil border-wobbly-md shadow-sketchLg">
              {/* Tape decoration */}
              <div className="tape-strip !top-[-12px]" />

              {/* Prominent Polaroid Photo Frame of the Event */}
              <div className="relative mb-5 bg-paper-bg p-3 pb-4 border-[2.5px] border-pencil rounded-xl shadow-[3px_3px_0px_#2d2d2d] rotate-[-0.5deg]">
                <div className="w-full h-56 sm:h-72 overflow-hidden rounded-lg border-2 border-pencil bg-pencil/5 relative">
                  <img
                    src={event.image_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80"}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80";
                    }}
                  />
                  <div className="absolute top-2.5 left-2.5 px-3 py-1 bg-white/95 backdrop-blur-xs border-2 border-pencil rounded-md font-hand font-bold text-xs shadow-xs text-pencil flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-marker-red animate-ping" />
                    <span>📍 Adi Shankara (ASIET) Kalady • {venueInfo?.name || venueNodeName}</span>
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-paper-yellow/95 border border-pencil rounded text-[11px] font-mono font-bold text-pencil shadow-xs">
                    Event Ref: {event.id}
                  </div>
                </div>
                <div className="mt-2.5 flex items-center justify-between text-xs font-hand text-pencil/80 px-1">
                  <span className="font-bold italic">📷 {event.title} — Official Event Flyer / Venue Photo</span>
                  <span className="font-mono text-[11px] bg-paper-yellow px-2 py-0.5 border border-pencil rounded">ASIET Kalady</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-xs font-hand font-bold bg-pencil text-white border border-pencil border-wobbly uppercase tracking-wider">
                    {event.category}
                  </span>
                  <span className="text-xs text-pencil/70">
                    Host: <strong>{event.organizer}</strong>
                  </span>
                </div>

                {rankedItem && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-paper-yellow border border-pencil border-wobbly text-xs font-bold text-pencil">
                    <Sparkles className="w-3.5 h-3.5 text-marker-red fill-marker-red" />
                    <span>{Math.round(rankedItem.score * 100)}% Student Match</span>
                  </div>
                )}
              </div>

              <h1 className="font-marker text-3xl sm:text-4xl text-pencil leading-tight mb-3">
                {event.title}
              </h1>

              {/* Explainability Reason Line */}
              {rankedItem && (
                <div className="p-3 mb-4 bg-paper-yellow/60 border-l-[4px] border-pencil text-sm font-hand italic text-pencil">
                  💬 "{rankedItem.reason}"
                </div>
              )}

              {/* Key Quick Facts Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-xs font-hand">
                <div className="p-2 bg-paper-bg border border-pencil border-wobbly flex flex-col justify-center">
                  <span className="text-pencil/60 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-marker-blue" /> Time Slot:
                  </span>
                  <span className="font-bold text-sm">{event.start} – {event.end}</span>
                </div>

                <div className="p-2 bg-paper-bg border border-pencil border-wobbly flex flex-col justify-center">
                  <span className="text-pencil/60 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-marker-red" /> Hall:
                  </span>
                  <span className="font-bold text-sm truncate">{venueInfo?.name || event.venue_id}</span>
                </div>

                <div className="p-2 bg-paper-bg border border-pencil border-wobbly flex flex-col justify-center">
                  <span className="text-pencil/60 flex items-center gap-1">
                    <Footprints className="w-3.5 h-3.5 text-pencil" /> Walk Transit:
                  </span>
                  <span className="font-bold text-sm truncate">
                    {route ? `${route.total_distance_m}m (~${route.eta_minutes}m)` : "Calculating..."}
                  </span>
                </div>

                <div className={`p-2 border border-wobbly flex flex-col justify-center ${
                  isOverCapacity ? 'bg-marker-red/10 border-marker-red text-marker-red' : 'bg-paper-bg border-pencil'
                }`}>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> RSVPs / Seats:
                  </span>
                  <span className="font-bold text-sm">
                    {event.rsvp_count} / {event.capacity} {isOverCapacity && '⚠️'}
                  </span>
                </div>
              </div>

              {/* Capacity Warning Alert */}
              {isOverCapacity && (
                <div className="p-2.5 bg-marker-red/10 border-2 border-marker-red border-wobbly text-marker-red text-xs font-bold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    Demand Warning: {event.rsvp_count} RSVPs have exceeded the room's {event.capacity}-seat capacity! Entry will be first-come, first-served.
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-3 border-t-2 border-dashed border-pencil/20">
                {isRsvpd ? (
                  <SketchButton
                    variant="postit"
                    onClick={() => onOpenPass(event)}
                    className="!py-2 !px-5 text-lg flex items-center gap-1.5"
                  >
                    <Ticket className="w-5 h-5 stroke-[2.5]" />
                    <span>View Official Campus Pass (QR)</span>
                  </SketchButton>
                ) : (
                  <SketchButton
                    variant={clashResult ? 'danger' : 'primary'}
                    onClick={() => onRsvp(event)}
                    className="!py-2 !px-6 text-lg"
                  >
                    {clashResult ? "RSVP Anyway (Override Clash)" : "RSVP: Going! ✍️"}
                  </SketchButton>
                )}

                <button
                  onClick={() => {
                    const el = document.getElementById('map-trail-dock');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-2 font-hand font-bold text-base border-2 border-pencil border-wobbly bg-paper-muted hover:bg-paper-yellow transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-marker-blue" />
                  <span>Jump to Trail Directions</span>
                </button>
              </div>
            </div>

            {/* Event Description & Workshop Agenda */}
            <div className="p-6 bg-white border-[3px] border-pencil border-wobbly-md shadow-sketch">
              <h3 className="font-marker text-2xl text-pencil mb-2">
                About this Session
              </h3>
              <p className="font-hand text-base text-pencil/90 leading-relaxed mb-4">
                {event.description}
              </p>

              <h4 className="font-marker text-lg text-pencil mb-2">
                What to Bring & Prepare
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm font-hand text-pencil/80 mb-4">
                <li>Charged laptop with power adapter</li>
                <li>College Student ID Card for venue check-in verification</li>
                <li>Curiosity, notebook for ideas, and peer collaboration mindset</li>
              </ul>

              {/* Tags */}
              <div className="pt-3 border-t border-dashed border-pencil/20">
                <span className="text-xs uppercase font-bold text-pencil/60 block mb-1">Tags:</span>
                <div className="flex flex-wrap gap-1.5">
                  {event.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 bg-paper-bg border border-pencil border-wobbly text-xs font-hand text-pencil"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Interactive Campus SVG Map & Turn-by-Turn Wayfinding (5 Cols) */}
          <div id="map-trail-dock" className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
            
            {/* Campus SVG Map */}
            <div className="border-[3px] border-pencil border-wobbly-md bg-paper-bg p-3 shadow-sketch">
              <div className="flex items-center justify-between mb-2 pb-1 border-b border-dashed border-pencil/20">
                <span className="font-marker text-xl text-pencil flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-marker-blue" />
                  Route to {venueNodeName}
                </span>
                <span className="text-xs bg-paper-muted px-2 py-0.5 border border-pencil border-wobbly font-hand">
                  From: {originNodeName}
                </span>
              </div>

              <CampusMapSvg
                nodes={campusNodes}
                edges={campusEdges}
                activeRoute={route}
                stepFree={stepFree}
                rainMode={rainMode}
                currentLocationNode={currentPersona?.current_location_node}
                targetEventNode={event.node_id}
              />
            </div>

            {/* Wayfinding Controls & Audio TTS */}
            <div className="border-[3px] border-pencil border-wobbly-md bg-white p-4 shadow-sketch">
              
              {/* Mode Toggles */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-dashed border-pencil/20">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStepFree(!stepFree)}
                    className={`px-3 py-1.5 text-xs sm:text-sm font-bold border-2 border-pencil border-wobbly flex items-center gap-1.5 cursor-pointer transition-all ${
                      stepFree ? 'bg-marker-blue text-white' : 'bg-paper-bg hover:bg-paper-muted text-pencil'
                    }`}
                  >
                    <Accessibility className="w-4 h-4" />
                    <span>Step-Free Ramp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRainMode(!rainMode)}
                    className={`px-3 py-1.5 text-xs sm:text-sm font-bold border-2 border-pencil border-wobbly flex items-center gap-1.5 cursor-pointer transition-all ${
                      rainMode ? 'bg-[#2d5da1] text-white' : 'bg-paper-bg hover:bg-paper-muted text-pencil'
                    }`}
                  >
                    <CloudRain className="w-4 h-4" />
                    <span>Rain Sheltered ☂️</span>
                  </button>
                </div>

                {isSpeechSupported && route && (
                  <SketchButton
                    variant={isSpeaking ? "danger" : "secondary"}
                    onClick={isSpeaking ? stopSpeech : () => speakSteps(route.steps)}
                    className="!py-1 !px-2.5 text-xs flex items-center gap-1"
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5" /> Stop
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" /> Read Aloud 🔊
                      </>
                    )}
                  </SketchButton>
                )}
              </div>

              {/* Route Summary */}
              {route ? (
                <div>
                  <div className="flex items-center justify-between text-sm font-hand mb-2">
                    <span className="font-bold flex items-center gap-1 text-marker-blue">
                      <Footprints className="w-4 h-4" /> Total Walk: {route.total_distance_m}m
                    </span>
                    <span className="font-bold flex items-center gap-1 text-marker-red">
                      <Clock className="w-4 h-4" /> ETA: ~{route.eta_minutes} min (at 1.2 m/s)
                    </span>
                  </div>

                  {/* Turn by turn steps list */}
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {route.steps.map((st, i) => (
                      <div
                        key={i}
                        className={`p-2 border border-pencil border-wobbly text-xs font-hand flex items-start gap-2 ${
                          isSpeaking && currentStepIndex === i ? 'bg-paper-yellow font-bold shadow-sketchHover' : 'bg-paper-bg'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full bg-pencil text-white text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="leading-tight">{st}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-xs text-pencil/60 py-4">
                  No path available under chosen constraints.
                </div>
              )}

            </div>

          </div>

        </div>

      </main>

    </div>
  );
};
