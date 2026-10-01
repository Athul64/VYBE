import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Compass, AlertTriangle, ArrowRight, CheckCircle2, 
  MapPin, Clock, Footprints, ShieldCheck, CloudRain, Users, Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';

export const LandingPage = ({
  personas = {},
  activePersonaKey = 'admin',
  onSelectPersona = () => {},
  currentUser,
  onOpenLogin = () => {},
  onLogout = () => {},
  pendingApprovalsCount = 0,
  onOpenAdmin = () => {}
}) => {
  const navigate = useNavigate();

  const fallbackPersonas = {
    admin: {
      name: "Campus Administrator",
      department: "Campus Administration (ASIET)",
      current_location_name: "Shankara Block (N13)"
    }
  };

  const currentPersona = personas[activePersonaKey] || fallbackPersonas[activePersonaKey] || fallbackPersonas.meera;

  return (
    <div className="h-screen w-full max-w-full overflow-hidden flex flex-col bg-paper-bg text-pencil font-sans select-none justify-between">
      
      {/* 1. Header (Compact ~50px) */}
      <header className="h-13 shrink-0 border-b-2 border-pencil bg-white/90 backdrop-blur-xs px-6 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <span className="w-3.5 h-3.5 rounded-full bg-marker-red border-2 border-pencil inline-block"></span>
          <div className="flex items-baseline gap-2">
            <h1 className="font-marker text-2xl text-pencil tracking-tight">
              VYBE ⚡
            </h1>
            <span className="text-xs text-pencil/70 font-medium italic border-l border-pencil/30 pl-2 hidden sm:inline">
              Adi Shankara Institute of Engineering & Technology (ASIET), Kalady
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* User ID Authentication Badge */}
          {currentUser ? (
            <div className="flex items-center gap-2 text-xs font-medium text-pencil bg-paper-yellow/50 px-2.5 py-1 border-2 border-pencil rounded-lg shadow-xs">
              <span className="text-[10px] uppercase font-bold px-1 bg-pencil text-white rounded">
                {currentUser.role}
              </span>
              <strong className="text-pencil truncate max-w-[130px] sm:max-w-none">
                {currentUser.name}
              </strong>
              <span className="font-mono text-pencil/70 text-[11px] hidden md:inline">
                ({currentUser.student_id})
              </span>
              <button
                onClick={onOpenLogin}
                className="ml-1 text-[11px] underline font-bold text-marker-blue hover:text-marker-red cursor-pointer"
              >
                Switch
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="px-3 py-1 text-xs font-bold border-2 border-pencil rounded-lg bg-white hover:bg-paper-yellow transition-all cursor-pointer shadow-[2px_2px_0px_#2d2d2d]"
            >
              Sign In with Student ID 🪪
            </button>
          )}

          {/* Admin Moderation Button if Admin is Logged In */}
          {currentUser?.role === 'admin' && (
            <button
              onClick={onOpenAdmin}
              className="px-3 py-1 font-bold text-xs border-2 border-marker-red rounded-lg bg-[#ffebee] hover:bg-marker-red hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-[2px_2px_0px_#ff4d4d]"
            >
              <span>🛡️ Moderation Desk</span>
              {pendingApprovalsCount > 0 && (
                <span className="px-1.5 py-0.2 bg-marker-red text-white text-[10px] rounded-full font-bold">
                  {pendingApprovalsCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => navigate('/events')}
            className="px-4 py-1.5 font-bold text-xs sm:text-sm border-2 border-pencil rounded-lg bg-paper-yellow hover:bg-pencil hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-[2px_2px_0px_#2d2d2d]"
          >
            <span>Open Events Notebook</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Main Hero Presentation (Full-Width Balanced Desk Grid) */}
      <main className="flex-1 min-h-0 max-w-7xl mx-auto w-full px-6 py-3 flex flex-col justify-between">
        
        {/* Top 2-Column Split: Story & Persona on Left, Live Campus Corkboard on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch flex-1 min-h-0 mb-3">
          
          {/* LEFT HERO CARD (7 Cols): The Value Prop & Persona Selector */}
          <div className="lg:col-span-7 bg-white border-2 border-pencil rounded-xl p-6 shadow-sketch flex flex-col justify-between relative">
            <div className="tape-strip !top-[-10px] !w-28 !h-4" />

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-paper-yellow border border-pencil rounded-full text-xs font-bold uppercase tracking-wider mb-2.5">
                <span className="w-2 h-2 rounded-full bg-marker-red animate-ping" />
                Adi Shankara (ASIET) Kalady, Kerala • Campus Trail & Event Discovery
              </div>

              <h2 className="font-marker text-4xl sm:text-5xl text-pencil tracking-tight leading-none mb-2">
                Campus Events Tailored To Your Timetable.
              </h2>

              <p className="text-sm sm:text-base text-pencil/80 leading-relaxed mb-4">
                No more buried WhatsApp flyers or missed talks. <strong>VYBE</strong> automatically ranks campus sessions at <strong>Adi Shankara Institute of Engineering & Technology, Kalady</strong> to your timetable, reveals what fits your empty free hours, and routes you via step-free ramps or rain shelters.
              </p>

              {/* Authenticated User Status or Sign-In Callout */}
              <div className="mb-4">
                {currentUser ? (
                  <div className="p-3.5 bg-paper-yellow/50 border-2 border-pencil rounded-xl text-left shadow-[2px_2px_0px_#2d2d2d]">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{currentUser.role === 'admin' ? '🛡️' : '🎓'}</span>
                        <div>
                          <span className="font-marker text-lg text-pencil">{currentUser.name}</span>
                          <span className="text-xs text-pencil/70 ml-2 font-mono">({currentUser.student_id})</span>
                        </div>
                      </div>
                      <span className="text-xs px-2 py-0.5 bg-pencil text-white font-bold rounded uppercase">
                        {currentUser.role}
                      </span>
                    </div>
                    <div className="text-xs text-pencil/80">
                      Department: <strong>{currentUser.department}</strong>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-white border-2 border-dashed border-pencil/50 rounded-xl text-left shadow-xs flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="font-marker text-lg text-pencil block">
                        Get Started with your Campus ID 🪪
                      </span>
                      <span className="text-xs text-pencil/70 block">
                        Register your student account or sign in as Admin (admin / admin123).
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={onOpenLogin}
                      className="px-4 py-2 bg-paper-yellow hover:bg-pencil hover:text-white border-2 border-pencil rounded-lg font-bold text-xs shadow-[2px_2px_0px_#2d2d2d] transition-all cursor-pointer"
                    >
                      Sign In / Register ✍️
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Big Primary Action Button */}
            <div className="pt-2 flex flex-wrap items-center gap-3 border-t border-pencil/20">
              <button
                onClick={() => navigate('/events')}
                className="px-6 py-2.5 bg-marker-red hover:bg-pencil text-white font-bold text-base sm:text-lg border-2 border-pencil rounded-xl shadow-[3px_3px_0px_#2d2d2d] transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Enter Campus Events Notebook</span>
                <ArrowRight className="w-5 h-5 stroke-[3]" />
              </button>

              <button
                onClick={() => navigate('/events')}
                className="px-4 py-2.5 bg-paper-yellow hover:bg-white text-pencil font-bold text-sm sm:text-base border-2 border-pencil rounded-xl shadow-[2px_2px_0px_#2d2d2d] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Compass className="w-4 h-4 text-marker-blue" />
                <span>View Campus Zone Map</span>
              </button>
            </div>
          </div>

          {/* RIGHT LIVE CORKBOARD CARD (5 Cols): Interactive Campus Preview & Pinned Sticky Notes */}
          <div className="lg:col-span-5 bg-paper-bg border-2 border-pencil rounded-xl p-4 shadow-sketch flex flex-col justify-between relative overflow-hidden">
            <div className="thumbtack !top-[-8px]" />

            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-pencil/20 mb-2">
              <span className="font-marker text-lg text-pencil flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-marker-blue" />
                ASIET Kalady Campus Trail
              </span>
              <span className="text-[11px] px-2 py-0.5 bg-white border border-pencil rounded font-bold">
                1.2 m/s Walking ETA
              </span>
            </div>

            {/* Interactive SVG Campus Trail Preview */}
            <div className="flex-1 min-h-[140px] bg-white border border-pencil/40 rounded-lg p-2 relative flex items-center justify-center overflow-hidden mb-3">
              <svg viewBox="0 0 400 240" className="w-full h-full object-contain">
                {/* Lawn */}
                <path d="M 120 140 Q 160 120 200 150 Q 180 190 130 180 Z" fill="#edf4e8" stroke="#93a886" strokeWidth="1" strokeDasharray="3 3" />
                <text x="135" y="160" fontSize="9" fill="#78926b" fontFamily="system-ui">Saraswathi Quad</text>
                
                {/* Aryabhata Block */}
                <rect x="40" y="30" width="100" height="90" fill="#f7f3ec" stroke="#2d2d2d" strokeWidth="1.5" rx="4" />
                <text x="46" y="45" fontSize="8.5" fontWeight="bold" fill="#6e685f" fontFamily="system-ui">Aryabhata (CSE & AI)</text>
                
                {/* Shankara Admin Block */}
                <rect x="225" y="30" width="105" height="90" fill="#f7f3ec" stroke="#2d2d2d" strokeWidth="1.5" rx="4" />
                <text x="230" y="45" fontSize="8.5" fontWeight="bold" fill="#6e685f" fontFamily="system-ui">Shankara Admin / Aud.</text>

                {/* Library */}
                <rect x="260" y="130" width="100" height="80" fill="#f7f3ec" stroke="#2d2d2d" strokeWidth="1.5" rx="4" />
                <text x="268" y="145" fontSize="8.5" fontWeight="bold" fill="#6e685f" fontFamily="system-ui">Central Library Hub</text>

                {/* Walkways */}
                <line x1="80" y1="90" x2="160" y2="100" stroke="#2d5da1" strokeWidth="3" strokeLinecap="round" />
                <line x1="160" y1="100" x2="240" y2="100" stroke="#2d5da1" strokeWidth="3" strokeLinecap="round" />
                <line x1="240" y1="100" x2="280" y2="150" stroke="#2d5da1" strokeWidth="3" strokeLinecap="round" />
                <line x1="80" y1="180" x2="150" y2="150" stroke="#8c877d" strokeWidth="1.5" strokeDasharray="4 3" />

                {/* Animated Red Trail */}
                <motion.path
                  d="M 80 90 L 160 100 L 240 100 L 250 80"
                  fill="none"
                  stroke="#ff4d4d"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Origin Pin */}
                <circle cx="80" cy="90" r="5" fill="#2d5da1" stroke="#2d2d2d" strokeWidth="1.5" />
                <text x="45" y="110" fontSize="8" fontWeight="bold" fill="#2d5da1" fontFamily="system-ui">Turing Lab 📍</text>

                {/* Destination Pin */}
                <circle cx="250" cy="80" r="5" fill="#ff4d4d" stroke="#2d2d2d" strokeWidth="1.5" />
                <text x="220" y="70" fontSize="8" fontWeight="bold" fill="#ff4d4d" fontFamily="system-ui">Central Auditorium 🎯</text>
              </svg>
            </div>

            {/* Pinned Mini Post-it Insights */}
            <div className="space-y-2">
              <div className="p-2.5 bg-paper-yellow border border-pencil rounded-lg text-xs flex items-center justify-between shadow-xs">
                <div>
                  <span className="font-bold text-pencil block">💡 Fits 11:00 AM Free Window:</span>
                  <span className="text-[11px] text-pencil/80">AI & ML Club Sprint (11:30) • 2 min walk</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 bg-pencil text-paper-yellow rounded font-bold">Reachable</span>
              </div>

              <div className="p-2.5 bg-[#ffebee] border border-marker-red rounded-lg text-xs flex items-center justify-between shadow-xs">
                <div>
                  <span className="font-bold text-marker-red block">🚨 Automatic Clash Flagged:</span>
                  <span className="text-[11px] text-pencil/80">Web3 DevFest clashes with Discrete Math</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 bg-marker-red text-white rounded font-bold">2 Alts Ready</span>
              </div>
            </div>

          </div>

        </div>

        {/* Bottom 3-Column Core Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="p-3.5 bg-white border-2 border-pencil rounded-xl shadow-sketch">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-marker-red fill-marker-red" />
              <h3 className="font-marker text-base text-pencil">Personalized Relevance</h3>
            </div>
            <p className="text-xs text-pencil/80 leading-relaxed font-medium">
              Multi-factor scoring (50% interest match + 20% time fit + 15% transit proximity + 15% popularity) with an explainable reason on every card.
            </p>
          </div>

          <div className="p-3.5 bg-white border-2 border-pencil rounded-xl shadow-sketch">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-marker-red" />
              <h3 className="font-marker text-base text-pencil">Clash & Free-Hour Finder</h3>
            </div>
            <p className="text-xs text-pencil/80 leading-relaxed font-medium">
              Checks timetable overlaps and transit walk buffers. Scans 45+ minute schedule gaps to surface sessions you can reach and complete on time.
            </p>
          </div>

          <div className="p-3.5 bg-white border-2 border-pencil rounded-xl shadow-sketch">
            <div className="flex items-center gap-2 mb-1">
              <Compass className="w-4 h-4 text-marker-blue" />
              <h3 className="font-marker text-base text-pencil">25-Node Dijkstra Navigation</h3>
            </div>
            <p className="text-xs text-pencil/80 leading-relaxed font-medium">
              Step-free ramp rerouting for wheelchair users, covered arcades in rain mode (3× lawn penalty), and turn-by-turn Web Speech TTS audio.
            </p>
          </div>

        </div>

      </main>

      {/* 3. Footer (Clean ~28px) */}
      <footer className="h-8 shrink-0 text-center text-xs text-pencil/60 border-t border-pencil/20 flex items-center justify-center px-4 bg-white/50">
        <span>VYBE ⚡ • 25-Node Campus Architectural Topology • Walking ETAs at 1.2 m/s • College Hackathon PRD</span>
      </footer>

    </div>
  );
};
