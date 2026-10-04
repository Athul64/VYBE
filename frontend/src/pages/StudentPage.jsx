import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, Ticket, Clock, MapPin, Footprints, 
  Accessibility, CheckCircle2, AlertTriangle, ArrowRight, 
  Calendar, Sparkles, User, RefreshCw, Compass, ShieldCheck,
  QrCode, BookOpen, ChevronRight
} from 'lucide-react';
import { API_BASE } from '../config';

export const StudentPage = ({
  currentUser,
  personas = {},
  activePersonaKey,
  setActivePersonaKey = () => {},
  rsvpdEventIds = [],
  onOpenPass = () => {},
  onOpenLogin = () => {},
  onLogout = () => {},
  theme = 'light',
  onToggleTheme = () => {},
  campusNodes = {},
  venues = {}
}) => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('passes'); // 'passes' | 'free_gaps' | 'timetable'
  const [myEvents, setMyEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [freeGaps, setFreeGaps] = useState([]);
  const [loadingGaps, setLoadingGaps] = useState(false);
  const [stepFreeMode, setStepFreeMode] = useState(currentUser?.needs_step_free || false);

  const effectiveStudentId = currentUser?.student_id || activePersonaKey || 'meera';
  const activePersona = personas[activePersonaKey] || {
    id: effectiveStudentId,
    name: currentUser?.name || "Student Explorer",
    major: currentUser?.department || "Computer Science",
    current_location_node: "N08",
    interests: ["Tech", "Hackathons"],
    timetable_today: []
  };

  useEffect(() => {
    fetchMyEvents();
    fetchFreeGaps();
  }, [effectiveStudentId]);

  const fetchMyEvents = async () => {
    setLoadingEvents(true);
    try {
      const resp = await fetch(`${API_BASE}/student/my-events?student_id=${effectiveStudentId}`);
      const data = await resp.json();
      setMyEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading student events:", err);
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchFreeGaps = async () => {
    setLoadingGaps(true);
    try {
      const resp = await fetch(`${API_BASE}/free-gaps?student=${effectiveStudentId}`);
      const data = await resp.json();
      setFreeGaps(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading free gaps:", err);
    } finally {
      setLoadingGaps(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-paper-bg text-pencil font-sans flex flex-col justify-between selection:bg-paper-yellow selection:text-pencil">
      {/* 1. Header Navbar */}
      <header className="h-16 shrink-0 border-b-2 border-pencil bg-white/95 backdrop-blur-md px-6 sm:px-10 flex items-center justify-between z-30 sticky top-0">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-marker-red border-2 border-pencil inline-block"></span>
          <h1 
            onClick={() => navigate('/')} 
            className="font-marker text-2xl sm:text-3xl text-pencil tracking-tight cursor-pointer hover:opacity-85 transition-opacity"
          >
            VYBE ⚡
          </h1>
          <span className="text-[11px] font-bold px-2 py-0.5 bg-paper-yellow border border-pencil rounded-md text-pencil hidden sm:inline-block">
            STUDENT PORTAL
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => navigate('/events')}
            className="px-3 py-1.5 font-bold text-xs border-2 border-pencil rounded-lg bg-paper-bg hover:bg-paper-yellow transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Compass className="w-4 h-4 text-marker-blue" />
            <span className="hidden sm:inline">Events & Map</span>
          </button>


          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 border-2 border-pencil rounded-lg bg-paper-bg hover:bg-paper-yellow transition-all cursor-pointer shadow-xs"
            title={theme === 'dark' ? 'Switch to Light Notebook' : 'Switch to Dark Slate'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {currentUser ? (
            <button
              onClick={onLogout}
              className="px-3 py-1.5 text-xs font-bold bg-marker-red text-white border-2 border-pencil rounded-lg hover:bg-pencil transition-all cursor-pointer shadow-xs"
            >
              Sign Out
            </button>
          ) : (
            <button
              onClick={onOpenLogin}
              className="px-3 py-1.5 text-xs font-bold bg-paper-yellow border-2 border-pencil rounded-lg hover:bg-pencil hover:text-white transition-all cursor-pointer shadow-xs"
            >
              Sign In / Register
            </button>
          )}
        </div>
      </header>

      {/* 2. Main Content Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-6">

        {/* Student College ID Card Banner */}
        <div className="bg-white border-[3px] border-pencil rounded-2xl p-5 sm:p-6 shadow-sketch relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="tape-strip !top-[-12px]" />

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-paper-yellow border-2 border-pencil rounded-2xl flex items-center justify-center shrink-0 shadow-sketch relative">
              <GraduationCap className="w-9 h-9 sm:w-11 sm:h-11 text-pencil stroke-[2.5]" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#2e7d32] border border-pencil rounded-full flex items-center justify-center text-white text-[9px] font-bold">
                ✓
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 bg-marker-blue text-white rounded font-mono">
                  {currentUser?.student_id || activePersona.id?.toUpperCase() || 'STUDENT'}
                </span>
                <span className="text-xs font-bold text-pencil/70">
                  {currentUser?.role === 'admin' ? 'Administrator Account' : 'Student Scholar'}
                </span>
              </div>
              <h2 className="font-marker text-2xl sm:text-3xl text-pencil">
                {currentUser?.name || activePersona.name}
              </h2>
              <p className="font-hand text-sm text-pencil/70 flex items-center gap-1.5">
                <span>{currentUser?.department || activePersona.major || 'Computer Science & Engineering'}</span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono text-xs">
                  <MapPin className="w-3.5 h-3.5 text-marker-red inline" />
                  Near {campusNodes[activePersona.current_location_node]?.name || activePersona.current_location_node || 'Campus Center'}
                </span>
              </p>
            </div>
          </div>

          {/* Quick Controls on ID badge */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto border-t-2 md:border-t-0 border-pencil/20 pt-4 md:pt-0">
            {/* Step-Free Toggle */}
            <button
              onClick={() => setStepFreeMode(!stepFreeMode)}
              className={`px-3 py-2 border-2 border-pencil rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-all ${
                stepFreeMode 
                  ? 'bg-marker-blue text-white shadow-sketch' 
                  : 'bg-paper-bg hover:bg-paper-yellow text-pencil'
              }`}
              title="Prioritizes ramps and elevators over stairs"
            >
              <Accessibility className="w-4 h-4" />
              <span>{stepFreeMode ? '♿ Step-Free: ON' : '♿ Step-Free: OFF'}</span>
            </button>

            {/* Persona Switcher dropdown for quick testing */}
            <div className="flex items-center gap-1.5 bg-paper-bg border-2 border-pencil rounded-xl px-2.5 py-1.5 text-xs shadow-xs">
              <span className="text-[11px] font-bold text-pencil/60">Demo Persona:</span>
              <select
                value={activePersonaKey}
                onChange={(e) => setActivePersonaKey(e.target.value)}
                className="font-bold bg-transparent text-pencil focus:outline-hidden cursor-pointer"
              >
                {Object.entries(personas).map(([key, p]) => (
                  <option key={key} value={key}>
                    {p.name} ({p.major?.split(' ')[0] || key})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b-2 border-pencil gap-2">
          <button
            onClick={() => setActiveTab('passes')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold border-2 border-b-0 border-pencil rounded-t-lg transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'passes' 
                ? 'bg-paper-yellow text-pencil' 
                : 'bg-white hover:bg-paper-bg text-pencil/70'
            }`}
          >
            <Ticket className="w-4 h-4 text-marker-red" />
            <span>My Registered Passes ({myEvents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('free_gaps')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold border-2 border-b-0 border-pencil rounded-t-lg transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'free_gaps' 
                ? 'bg-paper-yellow text-pencil' 
                : 'bg-white hover:bg-paper-bg text-pencil/70'
            }`}
          >
            <Sparkles className="w-4 h-4 text-marker-blue" />
            <span>Free-Hour Activities ({freeGaps.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('timetable')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold border-2 border-b-0 border-pencil rounded-t-lg transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'timetable' 
                ? 'bg-paper-yellow text-pencil' 
                : 'bg-white hover:bg-paper-bg text-pencil/70'
            }`}
          >
            <Calendar className="w-4 h-4 text-pencil/70" />
            <span>Class Timetable</span>
          </button>
        </div>

        {/* TAB 1: Registered Event Passes */}
        {activeTab === 'passes' && (
          <div className="space-y-4">
            {loadingEvents ? (
              <div className="p-8 text-center bg-white border-2 border-pencil rounded-xl shadow-sketch">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-pencil/60 mb-2" />
                <p className="text-sm font-bold text-pencil/70">Scanning registered event ledger...</p>
              </div>
            ) : myEvents.length === 0 ? (
              <div className="bg-white border-2 border-pencil rounded-xl p-8 text-center shadow-sketch">
                <Ticket className="w-12 h-12 text-paper-yellow mx-auto mb-2" />
                <h3 className="font-marker text-xl text-pencil">No Event Passes Registered Yet</h3>
                <p className="font-hand text-sm text-pencil/70 max-w-md mx-auto mt-1 mb-4">
                  Browse today's workshops, competitions, and seminars on the campus map and tap RSVP to secure your verified entry ticket.
                </p>
                <button
                  onClick={() => navigate('/events')}
                  className="px-5 py-2.5 bg-marker-red hover:bg-pencil text-white font-bold text-xs sm:text-sm border-2 border-pencil rounded-lg shadow-sketch transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <Compass className="w-4 h-4" />
                  <span>Discover Campus Events</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myEvents.map((ev) => (
                  <div 
                    key={ev.id} 
                    className="bg-white border-2 border-pencil rounded-xl p-5 shadow-sketch relative flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-paper-yellow border border-pencil rounded uppercase">
                          {ev.category}
                        </span>
                        <span className="px-2 py-0.5 bg-[#e8f5e9] text-[#2e7d32] border border-[#2e7d32]/40 rounded text-[10px] font-bold">
                          ✓ ENTRY PASS ACTIVE
                        </span>
                      </div>

                      <h4 className="font-marker text-xl text-pencil">{ev.title}</h4>
                      <p className="text-xs text-pencil/80 line-clamp-2">{ev.description}</p>

                      <div className="space-y-1 text-xs text-pencil/70 font-mono pt-1">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-marker-blue shrink-0" />
                          <span>{ev.start} – {ev.end}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-marker-red shrink-0" />
                          <span>{venues[ev.venue_id]?.name || ev.venue_id}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-4 mt-4 border-t border-dashed border-pencil/30">
                      <button
                        onClick={() => onOpenPass(ev)}
                        className="flex-1 py-2 bg-paper-yellow hover:bg-pencil hover:text-white border-2 border-pencil rounded-lg text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Show QR Pass</span>
                      </button>

                      <button
                        onClick={() => navigate(`/events/${ev.id}`)}
                        className="px-3 py-2 bg-paper-bg hover:bg-paper-yellow border-2 border-pencil rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                        title="View walking directions"
                      >
                        <Footprints className="w-4 h-4 text-marker-red" />
                        <span>Trail</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Free-Gap Recommendations */}
        {activeTab === 'free_gaps' && (
          <div className="space-y-4">
            <div className="bg-paper-yellow/40 border-2 border-pencil rounded-xl p-4 text-xs text-pencil/80 flex items-center gap-2 shadow-xs">
              <Sparkles className="w-5 h-5 text-marker-red shrink-0" />
              <span>
                These activities fit precisely into empty windows in your academic timetable, calculated with sufficient walking transit buffers to and from your lecture halls.
              </span>
            </div>

            {loadingGaps ? (
              <div className="p-8 text-center bg-white border-2 border-pencil rounded-xl shadow-sketch">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-pencil/60 mb-2" />
                <p className="text-sm font-bold text-pencil/70">Scanning timetable free periods...</p>
              </div>
            ) : freeGaps.length === 0 ? (
              <div className="bg-white border-2 border-pencil rounded-xl p-8 text-center shadow-sketch">
                <CheckCircle2 className="w-10 h-10 text-[#2e7d32] mx-auto mb-2" />
                <h4 className="font-marker text-lg text-pencil">No Empty Class Periods Right Now</h4>
                <p className="font-hand text-sm text-pencil/70 mt-1">
                  You have a full schedule or your free intervals don't align with active workshops today.
                </p>
              </div>
            ) : (
              freeGaps.map((gap, idx) => (
                <div key={idx} className="bg-white border-2 border-pencil rounded-xl p-4 sm:p-5 shadow-sketch space-y-3">
                  <div className="flex items-center justify-between border-b border-dashed border-pencil/30 pb-2">
                    <span className="font-bold text-sm text-marker-blue flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      Free Window: {gap.gap_start} – {gap.gap_end} ({gap.duration_minutes} mins)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-paper-yellow border border-pencil rounded">
                      FITS SCHEDULE
                    </span>
                  </div>

                  <div className="space-y-2">
                    {gap.fitting_events?.map((ev) => (
                      <div key={ev.id} className="p-3 bg-paper-bg border border-pencil rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h5 className="font-bold text-sm text-pencil">{ev.title}</h5>
                          <p className="text-xs text-pencil/70 font-mono mt-0.5">
                            {ev.start} – {ev.end} | {venues[ev.venue_id]?.name || ev.venue_id}
                          </p>
                        </div>

                        <button
                          onClick={() => navigate(`/events/${ev.id}`)}
                          className="px-3 py-1.5 bg-paper-yellow hover:bg-pencil hover:text-white border border-pencil rounded-md text-xs font-bold flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                        >
                          <span>View Trail</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: Academic Timetable */}
        {activeTab === 'timetable' && (
          <div className="bg-white border-2 border-pencil rounded-xl p-5 shadow-sketch space-y-4">
            <div className="flex items-center justify-between border-b-2 border-pencil pb-3">
              <h4 className="font-marker text-xl text-pencil flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-marker-blue" />
                <span>Today's Academic Schedule ({activePersona.major || 'Engineering'})</span>
              </h4>
              <span className="text-xs font-mono text-pencil/60">ASIET Semester Cycle</span>
            </div>

            {(!activePersona.timetable_today || activePersona.timetable_today.length === 0) ? (
              <p className="text-xs text-pencil/70 italic py-4">No mandatory lectures registered for today.</p>
            ) : (
              <div className="space-y-3 font-mono">
                {activePersona.timetable_today.map((slot, idx) => (
                  <div key={idx} className="p-3.5 border-2 border-pencil rounded-xl bg-paper-bg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="font-sans font-bold text-sm text-pencil">{slot.title}</div>
                      <div className="text-xs text-pencil/70 flex items-center gap-2 mt-1">
                        <span>{slot.start} – {slot.end}</span>
                        <span>•</span>
                        <span>Hall: {slot.room || slot.location_node}</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 bg-marker-red/10 text-marker-red border border-marker-red/30 rounded self-start sm:self-auto">
                      MANDATORY LECTURE
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
};
