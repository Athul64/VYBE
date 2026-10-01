import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Compass, PlusCircle, LayoutDashboard, 
  RotateCcw, Footprints, Clock, Shuffle, Accessibility, CloudRain,
  Volume2, VolumeX, ArrowLeft
} from 'lucide-react';

import { EventCard } from '../components/feed/EventCard';
import { ClashBanner } from '../components/feed/ClashBanner';
import { CampusMapSvg } from '../components/map/CampusMapSvg';

export const EventsPage = ({
  personas = {},
  activePersonaKey,
  setActivePersonaKey,
  events = [],
  categoryFilter,
  setCategoryFilter,
  categories = [],
  rsvpdEventIds = [],
  onRsvp,
  onOpenPass,
  onResetDemo,
  activeClash,
  setActiveClash,
  onOpenFreeGap,
  onOpenCreateEvent,
  onOpenAdmin,
  currentUser,
  onOpenLogin = () => {},
  onLogout = () => {},
  pendingApprovalsCount = 0,
  campusNodes = {},
  campusEdges = [],
  fromNode,
  setFromNode,
  toNode,
  setToNode,
  stepFree,
  setStepFree,
  rainMode,
  setRainMode,
  activeRoute,
  calculateRoute,
  selectedNode,
  setSelectedNode,
  isSpeechSupported,
  isSpeaking,
  currentStepIndex,
  speakSteps,
  stopSpeech,
  theme = 'light',
  onToggleTheme = () => {}
}) => {
  const navigate = useNavigate();
  const activePersona = personas[activePersonaKey];

  const [viewTab, setViewTab] = useState('feed'); // 'feed' | 'my_submissions'
  const [myEvents, setMyEvents] = useState([]);
  const [loadingMyEvents, setLoadingMyEvents] = useState(false);

  useEffect(() => {
    if (viewTab === 'my_submissions' && currentUser) {
      fetchMyEvents();
    }
  }, [viewTab, currentUser]);

  const fetchMyEvents = async () => {
    setLoadingMyEvents(true);
    try {
      const studentId = currentUser?.student_id || 'ADMIN';
      const resp = await fetch(`http://localhost:8000/api/student/my-events?student_id=${studentId}`);
      const data = await resp.json();
      setMyEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("My events error:", err);
    } finally {
      setLoadingMyEvents(false);
    }
  };

  const filteredEvents = events.filter(item => {
    if (categoryFilter === 'All') return true;
    return item.event.category.toLowerCase() === categoryFilter.toLowerCase();
  });

  return (
    <div className="h-screen w-full max-w-full overflow-hidden flex flex-col bg-paper-bg text-pencil font-sans select-none">
      
      {/* 1. TOP APP BAR */}
      <header className="h-14 shrink-0 px-4 border-b-2 border-pencil bg-white/90 backdrop-blur-xs flex items-center justify-between gap-3 z-30">
        
        {/* Brand & Home Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            title="Back to Landing Hero"
            className="px-2.5 py-1 border-2 border-pencil rounded-lg bg-paper-muted hover:bg-paper-yellow cursor-pointer flex items-center gap-1.5 text-xs font-bold transition-all shadow-[2px_2px_0px_#2d2d2d]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cover</span>
          </button>
          
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-marker-red border-2 border-pencil inline-block"></span>
            <h1 
              className="font-marker text-2xl text-pencil tracking-tight cursor-pointer" 
              onClick={() => navigate('/')}
            >
              VYBE ⚡
            </h1>
            <span className="hidden sm:inline text-xs text-pencil/70 font-medium border-l border-pencil/30 pl-2">
              Adi Shankara (ASIET) Kalady • Events & Trail
            </span>
          </div>
        </div>



        {/* Action Buttons */}
        {/* Action Buttons & Profile Controls */}
        <div className="flex items-center gap-2">
          {/* User ID Authentication Pill */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border-2 border-pencil rounded-lg shadow-xs text-xs">
              <span className={`text-[10px] font-bold px-1 rounded text-white uppercase ${
                currentUser.role === 'admin' ? 'bg-marker-red' : 'bg-pencil'
              }`}>
                {currentUser.role === 'admin' ? 'ADMIN' : 'STUDENT'}
              </span>
              <span className="font-bold text-pencil truncate max-w-[100px] sm:max-w-none">
                {currentUser.name}
              </span>
              <span className="text-pencil/60 text-[11px] font-mono hidden md:inline">
                ({currentUser.student_id})
              </span>
              <button
                onClick={onOpenLogin}
                className="ml-0.5 text-[11px] underline font-bold text-marker-blue hover:text-marker-red cursor-pointer"
                title="Switch User Account"
              >
                Switch
              </button>
              <button
                onClick={onLogout}
                className="ml-1 px-1.5 py-0.5 text-[10px] bg-paper-bg hover:bg-marker-red hover:text-white border border-pencil rounded font-bold transition-colors cursor-pointer"
                title="Sign Out"
              >
                Sign Out 🚪
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="px-3 py-1 text-xs font-bold border-2 border-pencil rounded-lg bg-paper-yellow hover:bg-pencil hover:text-white transition-all cursor-pointer shadow-[2px_2px_0px_#2d2d2d]"
            >
              Sign In / Register 🪪
            </button>
          )}

          {/* Role-Specific Header Action Buttons */}
          {currentUser?.role === 'admin' ? (
            /* ADMIN ACTIONS */
            <>
              <button
                onClick={onOpenAdmin}
                className={`px-3 py-1 text-xs sm:text-sm font-bold border-2 border-pencil rounded-lg shadow-[2px_2px_0px_#2d2d2d] flex items-center gap-1.5 cursor-pointer transition-all ${
                  pendingApprovalsCount > 0
                    ? 'bg-marker-red text-white hover:bg-pencil animate-pulse'
                    : 'bg-[#ffebee] hover:bg-marker-red hover:text-white text-marker-red'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Moderation Desk</span>
                {pendingApprovalsCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-white text-marker-red text-[10px] rounded-full font-bold">
                    {pendingApprovalsCount}
                  </span>
                )}
              </button>

              <button
                onClick={onOpenCreateEvent}
                className="px-3 py-1 text-xs sm:text-sm font-bold bg-white hover:bg-pencil hover:text-white text-pencil border-2 border-pencil rounded-lg shadow-[2px_2px_0px_#2d2d2d] flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5 text-marker-red" />
                <span className="hidden md:inline">Publish Event</span>
              </button>
            </>
          ) : (
            /* STUDENT & GUEST ACTION */
            <button
              onClick={onOpenCreateEvent}
              className="px-3.5 py-1 text-xs sm:text-sm font-bold bg-marker-red hover:bg-pencil text-white border-2 border-pencil rounded-lg shadow-[2px_2px_0px_#2d2d2d] flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Propose Event</span>
            </button>
          )}

          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? "Switch to Light Notebook" : "Switch to Dark Slate Blackboard"}
            className="p-1.5 border-2 border-pencil rounded-lg bg-paper-bg hover:bg-paper-yellow transition-colors cursor-pointer shadow-[2px_2px_0px_#2d2d2d] flex items-center justify-center text-xs"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <button
            onClick={onResetDemo}
            title="Reset seeded demo state"
            className="p-1.5 border-2 border-pencil rounded-lg bg-paper-bg hover:bg-paper-yellow transition-colors cursor-pointer shadow-[2px_2px_0px_#2d2d2d]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Admin Moderation Alert Ribbon if Pending Events Exist */}
      {currentUser?.role === 'admin' && pendingApprovalsCount > 0 && (
        <div className="h-8 shrink-0 bg-[#ffebee] border-b-2 border-marker-red px-4 flex items-center justify-between text-xs font-bold text-marker-red">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-marker-red animate-ping" />
            <span>🛡️ Dean Moderation Notice: {pendingApprovalsCount} student event proposal(s) waiting for room clearance.</span>
          </div>
          <button
            onClick={onOpenAdmin}
            className="px-2.5 py-0.5 bg-marker-red text-white text-[11px] rounded hover:bg-pencil cursor-pointer"
          >
            Review & Approve Events →
          </button>
        </div>
      )}

      {/* 2. DYNAMIC CAMPUS TRAIL RIBBON */}
      <div className="h-9 shrink-0 bg-paper-yellow/90 border-b-2 border-dashed border-pencil/30 px-4 flex items-center justify-between gap-3 text-xs overflow-x-auto">
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-marker-red"></span>
          <span className="font-marker font-bold text-pencil text-xs">
            Adi Shankara (ASIET) Kalady • Campus Trail & Event Discovery
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {currentUser?.role !== 'admin' && (
            <button
              onClick={onOpenFreeGap}
              className="px-2.5 py-0.5 bg-white hover:bg-pencil hover:text-white border border-pencil rounded cursor-pointer font-bold transition-colors flex items-center gap-1 shadow-xs"
              title="Find events fitting your timetable free hours"
            >
              <Sparkles className="w-3.5 h-3.5 text-marker-red fill-marker-red" />
              <span>What Fits My Free Hour?</span>
            </button>
          )}

          <span className="hidden md:inline text-[11px] text-pencil/70 font-mono">
            Walking Pace: 1.2 m/s • 25 Architectural Nodes
          </span>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE BODY */}
      <main className="flex-1 min-h-0 grid grid-cols-12 gap-3.5 p-3.5 pt-2 pb-2">
        
        {/* LEFT COLUMN: Student Schedule & Ranked Events Feed (5 Cols) */}
        <div className="col-span-12 lg:col-span-5 h-full flex flex-col min-h-0 bg-white border-2 border-pencil rounded-xl p-3.5 shadow-sketch relative">

          {/* Header Panel: Admin Console vs Student Timetable vs Guest Welcome */}
          {currentUser?.role === 'admin' ? (
            /* 1. ADMIN WORKSPACE STRIP */
            <div className="shrink-0 p-2.5 bg-[#ffebee]/80 border-2 border-marker-red rounded-lg mb-2.5 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-marker text-sm text-pencil font-bold flex items-center gap-1.5">
                  <span className="text-base">🛡️</span> Campus Administration Workspace
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-marker-red text-white rounded font-bold uppercase">
                  Dean of Student Affairs
                </span>
              </div>
              <p className="text-[11px] text-pencil/80 leading-tight mb-2">
                Monitoring live halls, campus venues, and student proposals across Adi Shankara (ASIET).
              </p>
              <div className="flex items-center gap-3 text-[11px] font-bold text-pencil/90">
                <span className="px-2 py-0.5 bg-white border border-pencil rounded">
                  📋 Live Feed: {filteredEvents.length} events
                </span>
                <span className={`px-2 py-0.5 border rounded ${
                  pendingApprovalsCount > 0 ? 'bg-marker-red text-white border-marker-red' : 'bg-white border-pencil text-pencil'
                }`}>
                  ⏳ Pending Approvals: {pendingApprovalsCount}
                </span>
                <span className="px-2 py-0.5 bg-white border border-pencil rounded font-mono hidden sm:inline">
                  🏛️ 6 Venues Active
                </span>
              </div>
            </div>
          ) : activePersona ? (
            /* 2. STUDENT DOSSIER & SCHEDULE STRIP */
            <div className="shrink-0 p-2.5 bg-paper-yellow/30 border border-pencil/40 rounded-lg mb-2.5 text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-marker text-base text-pencil font-bold">
                  {currentUser?.name || activePersona.name}'s Class Schedule ({currentUser?.department || activePersona.department})
                </span>
                <span className="text-[11px] px-2 py-0.5 bg-white border border-pencil rounded font-semibold text-marker-blue">
                  Spot: <strong>{activePersona.current_location_node}</strong> ({activePersona.location_name})
                </span>
              </div>

              {/* Schedule Slots Horizontal Mini-Strip */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                {activePersona.timetable_today?.map((slot, sIdx) => {
                  const isFree = slot.subject.toLowerCase().includes('free') || !slot.node_id;
                  return (
                    <div
                      key={sIdx}
                      onClick={isFree ? onOpenFreeGap : undefined}
                      className={`px-2 py-1 border rounded shrink-0 text-xs leading-tight transition-all ${
                        isFree 
                          ? 'bg-paper-yellow border-dashed border-marker-red text-[#b78103] font-bold cursor-pointer hover:bg-white shadow-xs' 
                          : 'bg-white border-pencil/30 text-pencil font-medium'
                      }`}
                    >
                      <span className="block font-mono text-[10px] text-pencil/60">{slot.start}-{slot.end}</span>
                      <span className="truncate max-w-[120px] block">{slot.subject}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* 3. GUEST VISITOR STRIP */
            <div className="shrink-0 p-2.5 bg-paper-yellow/40 border border-pencil/30 rounded-lg mb-2.5 text-xs flex items-center justify-between">
              <div>
                <span className="font-marker text-xs text-pencil font-bold block">
                  👋 Campus Visitor Mode
                </span>
                <span className="text-[11px] text-pencil/70">
                  Showing verified events at Adi Shankara (ASIET). Sign in anytime above to RSVP or propose sessions.
                </span>
              </div>
              <span className="text-[11px] px-2 py-0.5 bg-white border border-pencil rounded font-mono font-bold text-pencil/70">
                Visitor
              </span>
            </div>
          )}

          {/* Clash Banner if Active */}
          {activeClash && (
            <div className="shrink-0 mb-2">
              <ClashBanner
                clashData={activeClash}
                onClose={() => setActiveClash(null)}
                onSelectAlternative={(altEvent) => {
                  setActiveClash(null);
                  onRsvp(altEvent);
                }}
                onOpenFreeGapFinder={() => {
                  setActiveClash(null);
                  onOpenFreeGap();
                }}
              />
            </div>
          )}

          {/* View Tab Toggle: Campus Board vs My Submissions */}
          <div className="shrink-0 flex items-center justify-between gap-1 pb-2 border-b border-pencil/20 mb-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setViewTab('feed')}
                className={`px-3 py-1 font-hand font-bold text-xs rounded-lg border transition-all cursor-pointer ${
                  viewTab === 'feed'
                    ? 'bg-pencil text-white border-pencil shadow-xs'
                    : 'bg-paper-bg hover:bg-paper-yellow text-pencil border-pencil/30'
                }`}
              >
                <span>Live Events Feed ({filteredEvents.length})</span>
              </button>

              {currentUser && (
                <button
                  onClick={() => setViewTab('my_submissions')}
                  className={`px-3 py-1 font-hand font-bold text-xs rounded-lg border transition-all cursor-pointer ${
                    viewTab === 'my_submissions'
                      ? 'bg-pencil text-white border-pencil shadow-xs'
                      : 'bg-paper-bg hover:bg-paper-yellow text-pencil border-pencil/30'
                  }`}
                >
                  <span>My Submissions ({myEvents.length})</span>
                </button>
              )}
            </div>

            <span className="text-[11px] text-pencil/60 font-medium hidden sm:inline">
              {viewTab === 'feed' ? 'Approved & Live' : 'Track Approval Status'}
            </span>
          </div>

          {/* If Feed View: Category Filter Tabs */}
          {viewTab === 'feed' && (
            <div className="shrink-0 flex items-center justify-between gap-1 pb-2 border-b border-pencil/20">
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      categoryFilter === cat
                        ? 'bg-pencil text-white border-pencil shadow-xs'
                        : 'bg-paper-bg hover:bg-paper-yellow text-pencil border-pencil/30'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <span className="text-[11px] text-pencil/60 font-medium hidden sm:inline">
                Tap card for detail & route
              </span>
            </div>
          )}

          {/* Scrollable Ranked Feed OR My Submissions List */}
          <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-1 mt-2">
            {viewTab === 'my_submissions' ? (
              <div className="space-y-3">
                <div className="p-3 bg-paper-yellow/40 border border-pencil rounded-lg text-xs font-hand flex items-center justify-between">
                  <span>
                    Proposals submitted under <strong>{currentUser?.student_id || 'Current ID'}</strong>:
                  </span>
                  <button
                    onClick={onOpenCreateEvent}
                    className="px-2 py-1 bg-white hover:bg-pencil hover:text-white border border-pencil rounded text-xs font-bold transition-all cursor-pointer"
                  >
                    + Submit New Event
                  </button>
                </div>

                {loadingMyEvents ? (
                  <div className="p-8 text-center text-xs font-hand text-pencil">
                    Loading your submissions ledger... ⏳
                  </div>
                ) : myEvents.length === 0 ? (
                  <div className="p-8 text-center bg-paper-bg border border-dashed border-pencil/30 rounded-xl">
                    <p className="font-hand text-sm text-pencil/70 mb-2">
                      You haven't submitted any campus events yet.
                    </p>
                    <button
                      onClick={onOpenCreateEvent}
                      className="px-3 py-1 bg-paper-yellow border border-pencil rounded-lg font-bold text-xs hover:bg-pencil hover:text-white transition-all cursor-pointer shadow-xs"
                    >
                      Propose a Campus Event Now
                    </button>
                  </div>
                ) : (
                  myEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3.5 bg-paper-bg border-2 border-pencil rounded-xl shadow-xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-pencil text-white rounded">
                              {ev.category}
                            </span>
                            {ev.status === 'pending' && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-paper-yellow text-pencil border border-pencil rounded animate-pulse">
                                ⏳ Pending Admin Verification
                              </span>
                            )}
                            {ev.status === 'approved' && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#e8f5e9] text-[#2e7d32] border border-[#2e7d32] rounded">
                                ✅ Verified & Live On Board
                              </span>
                            )}
                            {ev.status === 'rejected' && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#ffebee] text-marker-red border border-marker-red rounded">
                                ❌ Declined by Dean
                              </span>
                            )}
                          </div>
                          <h4 className="font-marker text-lg text-pencil leading-tight">
                            {ev.title}
                          </h4>
                        </div>
                        <span className="text-xs font-mono font-bold text-pencil/70">
                          {ev.start} - {ev.end}
                        </span>
                      </div>

                      <p className="font-hand text-xs text-pencil/80">
                        {ev.description}
                      </p>

                      <div className="pt-2 border-t border-pencil/20 flex items-center justify-between text-[11px] font-hand text-pencil/70">
                        <span>Venue: <strong>{ev.venue_name || ev.venue_id}</strong></span>
                        <span>Capacity: <strong>{ev.capacity} seats</strong></span>
                      </div>

                      {ev.admin_notes && (
                        <div className="p-2 bg-white border-l-2 border-marker-red text-[11px] font-hand italic text-pencil/80">
                          Note from Dean's Office: "{ev.admin_notes}"
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="p-8 text-center bg-paper-bg border-2 border-dashed border-pencil/40 rounded-xl my-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-paper-yellow border-2 border-pencil flex items-center justify-center mb-2.5 shadow-xs">
                  <PlusCircle className="w-6 h-6 text-marker-red" />
                </div>
                <h3 className="font-marker text-2xl text-pencil mb-1">
                  Campus Board is Clean & Ready! 📋
                </h3>
                <p className="font-hand text-sm text-pencil/80 max-w-sm mx-auto mb-4 leading-relaxed">
                  All dummy events have been cleared. Be the first student or club to propose a live event or workshop at Adi Shankara (ASIET) Kalady!
                </p>
                <div className="flex items-center justify-center">
                  <button
                    onClick={onOpenCreateEvent}
                    className="px-4 py-2 bg-marker-red hover:bg-pencil text-white font-bold text-sm border-2 border-pencil rounded-lg shadow-[2px_2px_0px_#2d2d2d] transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                    <span>{currentUser?.role === 'admin' ? 'Publish First Campus Event ✍️' : 'Propose First Event Now ✍️'}</span>
                  </button>
                </div>
              </div>
            ) : (
              filteredEvents.map((rankedItem) => (
                <div 
                  key={rankedItem.event.id}
                  onClick={(e) => {
                    if (!e.target.closest('button')) {
                      navigate(`/events/${rankedItem.event.id}`);
                    }
                  }}
                  className="cursor-pointer group"
                >
                  <EventCard
                    rankedItem={rankedItem}
                    isRsvpd={rsvpdEventIds.includes(rankedItem.event.id)}
                    onRsvp={onRsvp}
                    onNavigate={(nodeId) => {
                      setToNode(nodeId);
                      calculateRoute(fromNode, nodeId, stepFree, rainMode);
                    }}
                    onViewPass={onOpenPass}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Campus Map SVG & Wayfinding Dock (7 Cols) */}
        <div className="col-span-12 lg:col-span-7 h-full flex flex-col min-h-0 space-y-2.5">
          
          {/* Top: Campus Zone Architectural Plan Map */}
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
            className="flex-1 min-h-0"
          />

          {/* Bottom: Unified Route Wayfinding & Audio Directions Dock */}
          <div className="shrink-0 border-2 border-pencil rounded-xl bg-white p-3 shadow-sketch">
            
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-pencil/20 text-xs">
              <div className="flex items-center gap-2 flex-1 min-w-[300px]">
                <div className="flex-1">
                  <label className="block text-[10px] text-pencil/70 uppercase font-bold flex items-center gap-1 mb-0.5">
                    <span className="w-2 h-2 rounded-full bg-[#2d5da1] inline-block"></span>
                    From:
                  </label>
                  <select
                    value={fromNode}
                    onChange={(e) => setFromNode(e.target.value)}
                    className="w-full text-xs font-medium border border-pencil rounded-md px-2 py-1 bg-paper-bg cursor-pointer focus:ring-1 focus:ring-marker-blue"
                  >
                    {Object.entries(campusNodes).map(([id, n]) => (
                      <option key={id} value={id}>{id}: {n.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => {
                    const tmp = fromNode;
                    setFromNode(toNode);
                    setToNode(tmp);
                  }}
                  title="Swap Origin & Destination"
                  className="p-1.5 border border-pencil rounded-md bg-paper-muted hover:bg-paper-yellow cursor-pointer self-end mb-0.5 shadow-xs"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                </button>

                <div className="flex-1">
                  <label className="block text-[10px] text-pencil/70 uppercase font-bold flex items-center gap-1 mb-0.5">
                    <span className="w-2 h-2 rounded-full bg-marker-red inline-block"></span>
                    To:
                  </label>
                  <select
                    value={toNode}
                    onChange={(e) => setToNode(e.target.value)}
                    className="w-full text-xs font-medium border border-pencil rounded-md px-2 py-1 bg-paper-bg cursor-pointer focus:ring-1 focus:ring-marker-red"
                  >
                    {Object.entries(campusNodes).map(([id, n]) => (
                      <option key={id} value={id}>{id}: {n.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mode Toggles */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStepFree(!stepFree)}
                  className={`px-2.5 py-1 text-xs font-bold border rounded-md flex items-center gap-1.5 cursor-pointer transition-all shadow-xs ${
                    stepFree ? 'bg-marker-blue text-white border-marker-blue' : 'bg-paper-bg hover:bg-paper-muted text-pencil border-pencil/40'
                  }`}
                >
                  <Accessibility className="w-3.5 h-3.5" />
                  <span>Step-Free</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRainMode(!rainMode)}
                  className={`px-2.5 py-1 text-xs font-bold border rounded-md flex items-center gap-1.5 cursor-pointer transition-all shadow-xs ${
                    rainMode ? 'bg-[#2d5da1] text-white border-[#2d5da1]' : 'bg-paper-bg hover:bg-paper-muted text-pencil border-pencil/40'
                  }`}
                >
                  <CloudRain className="w-3.5 h-3.5" />
                  <span>Rain ☂️</span>
                </button>
              </div>
            </div>

            {/* Route Metrics & Audio TTS Controls */}
            {activeRoute ? (
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-bold text-marker-blue text-sm">
                    <Footprints className="w-4 h-4" />
                    {activeRoute.total_distance_m}m
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-bold text-marker-red text-sm">
                    <Clock className="w-4 h-4" />
                    ~{activeRoute.eta_minutes} min walk
                  </span>
                  {activeRoute.used_accessible_only && (
                    <span className="text-[10px] px-2 py-0.5 bg-[#e8f5e9] text-[#2e7d32] border border-[#2e7d32] rounded font-bold">
                      ♿ Accessible Ramp
                    </span>
                  )}
                  {activeRoute.rain_penalty_applied && (
                    <span className="text-[10px] px-2 py-0.5 bg-[#e3f2fd] text-marker-blue border border-marker-blue rounded font-bold">
                      ☂️ Sheltered Path
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isSpeechSupported && (
                    <button
                      onClick={isSpeaking ? stopSpeech : () => speakSteps(activeRoute.steps)}
                      className={`px-3 py-1 text-xs font-bold border-2 border-pencil rounded-lg shadow-[2px_2px_0px_#2d2d2d] flex items-center gap-1.5 cursor-pointer transition-all ${
                        isSpeaking ? 'bg-marker-red text-white' : 'bg-paper-yellow hover:bg-pencil hover:text-white text-pencil'
                      }`}
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5" /> Stop Voice
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" /> Read Aloud 🔊
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="pt-2 text-center text-xs text-pencil/70 font-medium">
                Select origin & destination to compute walking route.
              </div>
            )}

          </div>

        </div>

      </main>
    </div>
  );
};
