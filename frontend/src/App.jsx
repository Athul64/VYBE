import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, Compass, Calendar, PlusCircle, LayoutDashboard, 
  MapPin, CheckCircle, RefreshCcw, HelpCircle, Footprints, AlertTriangle 
} from 'lucide-react';

import { DemoBadge } from './components/common/DemoBadge';
import { SketchButton } from './components/common/SketchButton';
import { StickyNote } from './components/common/StickyNote';

import { EventCard } from './components/feed/EventCard';
import { ClashBanner } from './components/feed/ClashBanner';
import { FreeGapFinder } from './components/feed/FreeGapFinder';

import { CampusMapSvg } from './components/map/CampusMapSvg';
import { RouteControls } from './components/map/RouteControls';
import { StepDirections } from './components/map/StepDirections';

import { PersonaSwitcher } from './components/student/PersonaSwitcher';
import { QrPassModal } from './components/student/QrPassModal';

import { EventCreateModal } from './components/organizer/EventCreateModal';
import { AdminDashboard } from './components/organizer/AdminDashboard';

import { useSpeech } from './hooks/useSpeech';

const API_BASE = 'http://localhost:8000/api';

export default function App() {
  // Demo Personas & Active Persona
  const [personas, setPersonas] = useState({});
  const [activePersonaKey, setActivePersonaKey] = useState('meera');

  // Campus Data
  const [campusNodes, setCampusNodes] = useState({});
  const [campusEdges, setCampusEdges] = useState([]);
  const [venues, setVenues] = useState({});

  // Ranked Events Feed
  const [events, setEvents] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [rsvpdEventIds, setRsvpdEventIds] = useState(['EVT-01']);

  // Navigation Route State
  const [fromNode, setFromNode] = useState('N08');
  const [toNode, setToNode] = useState('N09');
  const [stepFree, setStepFree] = useState(false);
  const [rainMode, setRainMode] = useState(false);
  const [activeRoute, setActiveRoute] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  // Modals & Panels
  const [activeClash, setActiveClash] = useState(null);
  const [selectedEventForPass, setSelectedEventForPass] = useState(null);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [isFreeGapOpen, setIsFreeGapOpen] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [showDemoGuide, setShowDemoGuide] = useState(true);

  // Text-To-Speech hook
  const { 
    isSupported: isSpeechSupported, 
    isSpeaking, 
    currentStepIndex, 
    speakSteps, 
    stop: stopSpeech 
  } = useSpeech();

  // Initial Data Fetch
  useEffect(() => {
    fetchCampusData();
    fetchPersonas();
  }, []);

  // Fetch Ranked Events when Persona changes
  useEffect(() => {
    fetchEvents(activePersonaKey);
  }, [activePersonaKey]);

  // Sync navigation default origin to persona's location and mobility needs
  useEffect(() => {
    if (personas[activePersonaKey]) {
      const p = personas[activePersonaKey];
      setFromNode(p.current_location_node);
      setStepFree(p.needs_step_free);
    }
  }, [activePersonaKey, personas]);

  // Auto-calculate initial route when fromNode and toNode are set
  useEffect(() => {
    if (fromNode && toNode) {
      calculateRoute(fromNode, toNode, stepFree, rainMode);
    }
  }, [fromNode, toNode, stepFree, rainMode]);

  const fetchCampusData = async () => {
    try {
      const resp = await fetch(`${API_BASE}/campus`);
      const data = await resp.json();
      setCampusNodes(data.nodes);
      setCampusEdges(data.edges);
      setVenues(data.venues);
    } catch (err) {
      console.error("Campus fetch failed:", err);
    }
  };

  const fetchPersonas = async () => {
    try {
      const resp = await fetch(`${API_BASE}/personas`);
      const data = await resp.json();
      setPersonas(data);
    } catch (err) {
      console.error("Personas fetch failed:", err);
    }
  };

  const fetchEvents = async (studentKey) => {
    try {
      const resp = await fetch(`${API_BASE}/events?student=${studentKey}`);
      const data = await resp.json();
      setEvents(data);
    } catch (err) {
      console.error("Events fetch failed:", err);
    }
  };

  const calculateRoute = async (from, to, step_free, rain_penalty) => {
    try {
      const query = new URLSearchParams({
        from,
        to,
        stepfree: String(step_free),
        covered: String(rain_penalty)
      });
      const resp = await fetch(`${API_BASE}/route?${query.toString()}`);
      if (!resp.ok) {
        setActiveRoute(null);
        return;
      }
      const data = await resp.json();
      setActiveRoute(data);
    } catch (err) {
      console.error("Route calculation error:", err);
      setActiveRoute(null);
    }
  };

  // RSVP Handler (With Clash Detection PRD FR-3 & FR-4)
  const handleRsvp = async (event) => {
    try {
      const resp = await fetch(`${API_BASE}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: activePersonaKey,
          event_id: event.id
        })
      });
      const data = await resp.json();

      if (data.clash_check && data.clash_check.is_clash) {
        // Schedule conflict detected! Show red banner with alternatives
        setActiveClash(data.clash_check);
      } else {
        // Conflict-free RSVP: mark going and show pass
        setActiveClash(null);
        if (!rsvpdEventIds.includes(event.id)) {
          setRsvpdEventIds(prev => [...prev, event.id]);
        }
        // Refresh event feed to update RSVP counter
        fetchEvents(activePersonaKey);
        setSelectedEventForPass(event);
        setIsPassModalOpen(true);
      }
    } catch (err) {
      console.error("RSVP error:", err);
    }
  };

  // Direct Route To Venue
  const handleNavigateToNode = (targetNodeId) => {
    setToNode(targetNodeId);
    calculateRoute(fromNode, targetNodeId, stepFree, rainMode);
    // Smooth scroll to map section on mobile
    const mapEl = document.getElementById('campus-map-section');
    if (mapEl) {
      mapEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenPass = (event) => {
    setSelectedEventForPass(event);
    setIsPassModalOpen(true);
  };

  const handleResetDemo = async () => {
    try {
      await fetch(`${API_BASE}/reset-demo`, { method: 'POST' });
      fetchEvents(activePersonaKey);
      setRsvpdEventIds(['EVT-01']);
      setActiveClash(null);
      if (personas[activePersonaKey]) {
        setFromNode(personas[activePersonaKey].current_location_node);
        setToNode('N09');
        setStepFree(personas[activePersonaKey].needs_step_free);
        setRainMode(false);
      }
    } catch (err) {
      console.error("Demo reset error:", err);
    }
  };

  // Filtered Events
  const filteredEvents = events.filter(item => {
    if (categoryFilter === 'All') return true;
    return item.event.category.toLowerCase() === categoryFilter.toLowerCase();
  });

  const categories = ['All', 'Workshop', 'Hackathon', 'Competition', 'Design', 'Cultural'];

  return (
    <div className="min-h-screen text-pencil pb-16 font-hand selection:bg-paper-yellow selection:text-pencil">
      {/* Honesty Demo Data Badge Pinned to Viewport */}
      <DemoBadge onResetDemo={handleResetDemo} />

      {/* Main Header / Sketchbook Cover Banner */}
      <header className="pt-6 pb-4 px-4 sm:px-8 border-b-[3px] border-pencil bg-paper-bg relative">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-4 h-4 rounded-full bg-marker-red border-2 border-pencil inline-block"></span>
              <span className="font-hand font-bold text-xs uppercase tracking-widest text-pencil/70">
                CAMPUS WAYFINDING & RELEVANCE ENGINE
              </span>
            </div>
            <h1 className="font-marker text-4xl sm:text-5xl text-pencil tracking-tight">
              VYBE ⚡
            </h1>
            <p className="font-hand text-lg sm:text-xl text-pencil/80 italic mt-0.5">
              "Don't just find the event. Get to it."
            </p>
          </div>

          {/* Navigation Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <SketchButton
              variant="postit"
              onClick={() => setIsFreeGapOpen(true)}
              className="!py-2 !px-3.5 text-base flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-marker-red fill-marker-red" />
              What fits my free hour?
            </SketchButton>

            <SketchButton
              variant="primary"
              onClick={() => setIsCreateEventOpen(true)}
              className="!py-2 !px-3.5 text-base flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              Post Event (Organizer)
            </SketchButton>

            <SketchButton
              variant="secondary"
              onClick={() => setIsAdminOpen(true)}
              className="!py-2 !px-3.5 text-base flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-4 h-4" />
              Admin Ledger
            </SketchButton>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">
        {/* Judging Demo Walkthrough Sticky Note Guide */}
        {showDemoGuide && (
          <div className="relative mb-6 p-4 bg-paper-yellow/90 border-[3px] border-pencil border-wobbly sticky-curl">
            <div className="thumbtack" />
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-marker text-xl text-pencil flex items-center gap-1.5">
                  ⚡ 3-Minute Hackathon Judging Walkthrough Script:
                </h4>
                <p className="font-hand text-sm text-pencil/80 mb-2">
                  Follow the pre-seeded steps from the PRD to verify the entire student journey without breaking:
                </p>
                <div className="flex flex-wrap gap-2 text-xs font-hand">
                  <button
                    onClick={() => {
                      setActivePersonaKey('meera');
                      fetchEvents('meera');
                    }}
                    className="px-2.5 py-1 bg-white border border-pencil border-wobbly font-bold hover:bg-paper-muted cursor-pointer"
                  >
                    1. Load Meera (CS 2nd Yr) 💻
                  </button>

                  <button
                    onClick={() => {
                      const devfest = events.find(e => e.event.id === 'EVT-02');
                      if (devfest) handleRsvp(devfest.event);
                    }}
                    className="px-2.5 py-1 bg-marker-red text-white border border-pencil border-wobbly font-bold hover:opacity-90 cursor-pointer"
                  >
                    2. RSVP 1:30 PM DevFest (Clashes with Discrete Math!) 🚨
                  </button>

                  <button
                    onClick={() => setIsFreeGapOpen(true)}
                    className="px-2.5 py-1 bg-paper-yellow border border-pencil border-wobbly font-bold hover:bg-white cursor-pointer"
                  >
                    3. Check Free Gap (11:00 – 13:00) 💡
                  </button>

                  <button
                    onClick={() => {
                      setActivePersonaKey('arjun');
                      fetchEvents('arjun');
                      setFromNode('N05');
                      setToNode('N08');
                      setStepFree(true);
                      calculateRoute('N05', 'N08', true, false);
                    }}
                    className="px-2.5 py-1 bg-marker-blue text-white border border-pencil border-wobbly font-bold hover:opacity-90 cursor-pointer"
                  >
                    4. Switch to Arjun (Step-Free South Ramp N07) ♿
                  </button>

                  <button
                    onClick={() => {
                      setFromNode('N03');
                      setToNode('N19');
                      setRainMode(true);
                      calculateRoute('N03', 'N19', false, true);
                    }}
                    className="px-2.5 py-1 bg-[#2d5da1] text-white border border-pencil border-wobbly font-bold hover:opacity-90 cursor-pointer"
                  >
                    5. Rain Mode (Covered Walkway N11-N12-N19) ☂️
                  </button>

                  <button
                    onClick={() => setIsCreateEventOpen(true)}
                    className="px-2.5 py-1 bg-white border border-pencil border-wobbly font-bold hover:bg-pencil hover:text-white cursor-pointer"
                  >
                    6. Organizer Double-Booking Test 📋
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowDemoGuide(false)}
                className="text-xs font-hand text-pencil/60 underline hover:text-pencil cursor-pointer"
              >
                Hide Guide
              </button>
            </div>
          </div>
        )}

        {/* Persona Dossier Section */}
        <section className="mb-6">
          <PersonaSwitcher
            personas={personas}
            activePersonaKey={activePersonaKey}
            onSelectPersona={(key) => setActivePersonaKey(key)}
            timetable={personas[activePersonaKey]?.timetable_today || []}
          />
        </section>

        {/* Two-Column Responsive Layout: Feed on Left, Interactive Map on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Ranked Event Feed (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Clash Banner (Displays when conflict occurs) */}
            {activeClash && (
              <ClashBanner
                clashData={activeClash}
                onClose={() => setActiveClash(null)}
                onSelectAlternative={(altEvent) => {
                  setActiveClash(null);
                  handleRsvp(altEvent);
                }}
                onOpenFreeGapFinder={() => {
                  setActiveClash(null);
                  setIsFreeGapOpen(true);
                }}
              />
            )}

            {/* Category Filter Chips */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b-2 border-dashed border-pencil/20">
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1 text-sm font-hand font-bold border-2 border-pencil border-wobbly transition-all cursor-pointer ${
                      categoryFilter === cat
                        ? 'bg-pencil text-white shadow-none translate-x-[1px] translate-y-[1px]'
                        : 'bg-white hover:bg-paper-yellow text-pencil'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <span className="text-xs font-hand text-pencil/70">
                Sorted by PRD Multi-Factor Relevance
              </span>
            </div>

            {/* Event Cards List */}
            {filteredEvents.length === 0 ? (
              <div className="p-8 text-center bg-white border-[3px] border-pencil border-wobbly shadow-sketch">
                <p className="font-hand text-xl text-pencil/70">
                  No events found in category "{categoryFilter}".
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEvents.map((rankedItem, idx) => (
                  <EventCard
                    key={rankedItem.event.id}
                    rankedItem={rankedItem}
                    rotation={idx % 2 === 0 ? -0.5 : 0.5}
                    isRsvpd={rsvpdEventIds.includes(rankedItem.event.id)}
                    onRsvp={handleRsvp}
                    onNavigate={handleNavigateToNode}
                    onViewPass={handleOpenPass}
                  />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Hand-Drawn SVG Map & Navigation (5 Cols) */}
          <div id="campus-map-section" className="lg:col-span-5 space-y-4 lg:sticky lg:top-4">
            
            {/* Campus SVG Map */}
            <CampusMapSvg
              nodes={campusNodes}
              edges={campusEdges}
              activeRoute={activeRoute}
              stepFree={stepFree}
              rainMode={rainMode}
              selectedNode={selectedNode}
              currentLocationNode={fromNode}
              targetEventNode={toNode}
              onSelectNode={(nodeId) => {
                setSelectedNode(nodeId);
                setToNode(nodeId);
              }}
            />

            {/* Route Controls */}
            <RouteControls
              nodes={campusNodes}
              fromNode={fromNode}
              toNode={toNode}
              stepFree={stepFree}
              rainMode={rainMode}
              onChangeFrom={(val) => setFromNode(val)}
              onChangeTo={(val) => setToNode(val)}
              onToggleStepFree={() => setStepFree(!stepFree)}
              onToggleRainMode={() => setRainMode(!rainMode)}
              onFindRoute={() => calculateRoute(fromNode, toNode, stepFree, rainMode)}
              onSwapPoints={() => {
                const temp = fromNode;
                setFromNode(toNode);
                setToNode(temp);
              }}
            />

            {/* Turn-by-Turn Step Directions & TTS */}
            <StepDirections
              route={activeRoute}
              isSpeaking={isSpeaking}
              currentStepIndex={currentStepIndex}
              onSpeakAll={speakSteps}
              onStopSpeak={stopSpeech}
              isSpeechSupported={isSpeechSupported}
            />
          </div>

        </div>
      </main>

      {/* Modals & Slide-ins */}
      <QrPassModal
        event={selectedEventForPass}
        student={personas[activePersonaKey]}
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        onCheckInSuccess={(eventId) => {
          fetchEvents(activePersonaKey);
        }}
      />

      <FreeGapFinder
        isOpen={isFreeGapOpen}
        onClose={() => setIsFreeGapOpen(false)}
        activePersonaKey={activePersonaKey}
        onRsvp={handleRsvp}
        onNavigate={handleNavigateToNode}
      />

      <EventCreateModal
        isOpen={isCreateEventOpen}
        onClose={() => setIsCreateEventOpen(false)}
        venues={venues}
        onEventCreated={(newEvent) => {
          fetchEvents(activePersonaKey);
        }}
      />

      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      {/* Hand-drawn Notebook Footer */}
      <footer className="mt-16 text-center text-xs font-hand text-pencil/60 border-t-2 border-dashed border-pencil/20 pt-6">
        <p>
          VYBE — Built for College Hackathon (12-hour build). Hand-Drawn Sketchbook Design System.
        </p>
        <p className="mt-1">
          Dijkstra Routing Engine on NetworkX • 25-Node Architectural Zone • Zero SaaS Corporate Clutter.
        </p>
      </footer>
    </div>
  );
}
