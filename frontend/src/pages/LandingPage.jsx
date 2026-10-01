import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Compass, AlertTriangle, ArrowRight, 
  MapPin, Clock, Footprints, ShieldCheck, CloudRain
} from 'lucide-react';
import { CampusMapSvg } from '../components/map/CampusMapSvg';

export const LandingPage = ({
  personas = {},
  activePersonaKey = 'admin',
  currentUser,
  onOpenLogin = () => {},
  onLogout = () => {},
  pendingApprovalsCount = 0,
  onOpenAdmin = () => {},
  campusNodes = {},
  campusEdges = [],
  activeRoute = null,
  theme = 'light',
  onToggleTheme = () => {}
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-paper-bg text-pencil font-sans flex flex-col justify-between selection:bg-paper-yellow selection:text-pencil">
      
      {/* 1. Header Navbar (Airy, Uncluttered, Modern) */}
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
            ASIET Kalady
          </span>
        </div>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2 text-xs font-medium bg-paper-yellow/40 px-3 py-1.5 border border-pencil rounded-lg shadow-xs">
              <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded text-white ${
                currentUser.role === 'admin' ? 'bg-marker-red' : 'bg-pencil'
              }`}>
                {currentUser.role === 'admin' ? 'ADMIN' : 'STUDENT'}
              </span>
              <strong className="text-pencil truncate max-w-[120px] sm:max-w-none">
                {currentUser.name}
              </strong>
              <button
                onClick={onLogout}
                className="ml-1 text-[11px] font-bold text-pencil/60 hover:text-marker-red underline cursor-pointer"
                title="Sign Out"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="px-3.5 py-1.5 text-xs font-bold text-pencil hover:text-marker-red cursor-pointer transition-colors border border-transparent hover:border-pencil/30 rounded-lg"
            >
              Sign In / Register 🪪
            </button>
          )}

          {currentUser?.role === 'admin' && (
            <button
              onClick={onOpenAdmin}
              className="px-3 py-1.5 font-bold text-xs border-2 border-marker-red rounded-lg bg-[#ffebee] hover:bg-marker-red hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-[2px_2px_0px_#ff4d4d]"
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
            onClick={onToggleTheme}
            title={theme === 'dark' ? "Switch to Light Notebook" : "Switch to Dark Slate Blackboard"}
            className="p-2 border-2 border-pencil rounded-xl bg-paper-bg hover:bg-paper-yellow transition-all cursor-pointer shadow-[2px_2px_0px_#2d2d2d] flex items-center justify-center text-sm"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <button
            onClick={() => navigate('/events')}
            className="px-4 py-2 font-bold text-xs sm:text-sm border-2 border-pencil rounded-xl bg-paper-yellow hover:bg-pencil hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-[2px_2px_0px_#2d2d2d]"
          >
            <span>Open Events Notebook</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Main Hero Presentation (Spacious, Breathable Desk Grid) */}
      <main className="max-w-7xl mx-auto w-full px-6 sm:px-10 py-8 flex flex-col gap-8 flex-1">
        
        {/* Top 2-Column Split: Story on Left, Live Campus Corkboard on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* LEFT HERO CARD (7 Cols): Value Prop & Call to Action */}
          <div className="lg:col-span-7 bg-white border-2 border-pencil rounded-2xl p-6 sm:p-8 shadow-sketch flex flex-col justify-between relative">
            <div className="tape-strip !top-[-10px] !w-28 !h-4" />

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-paper-yellow/70 border border-pencil rounded-full text-[11px] font-bold uppercase tracking-wider mb-4">
                <span className="w-2 h-2 rounded-full bg-marker-red animate-ping" />
                <span>Adi Shankara (ASIET) Kalady • Event & Trail Discovery</span>
              </div>

              <h2 className="font-marker text-4xl sm:text-5xl text-pencil tracking-tight leading-[1.08] mb-4">
                Campus Events Tailored To Your Timetable.
              </h2>

              <p className="text-sm sm:text-base text-pencil/80 leading-relaxed mb-6 font-medium">
                No more buried WhatsApp flyers or missed talks. <strong>VYBE</strong> automatically matches campus sessions at <strong>Adi Shankara (ASIET) Kalady</strong> to your timetable, surfaces what fits your empty free hours, and routes you via step-free ramps or covered rain shelters.
              </p>

              {/* Clean User Status Strip (No cluttered secondary cards) */}
              <div className="mb-6 p-3.5 rounded-xl border border-pencil/30 bg-paper-bg text-xs">
                {currentUser?.role === 'admin' ? (
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="font-marker text-sm text-pencil block">🛡️ Dean of Student Affairs Administration Desk</span>
                      <span className="text-pencil/70">Verify proposals, audit room capacity, and broadcast approved events.</span>
                    </div>
                    {pendingApprovalsCount > 0 && (
                      <button
                        onClick={onOpenAdmin}
                        className="px-2.5 py-1 bg-marker-red text-white font-bold rounded hover:bg-pencil transition-colors cursor-pointer shrink-0 shadow-xs"
                      >
                        {pendingApprovalsCount} Pending Review →
                      </button>
                    )}
                  </div>
                ) : currentUser ? (
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="font-marker text-sm text-pencil block">🎓 Student Account: {currentUser.name} ({currentUser.student_id})</span>
                      <span className="text-pencil/70">{currentUser.department} • Personalized recommendations active</span>
                    </div>
                    <span className="px-2 py-0.5 bg-paper-yellow border border-pencil rounded font-bold text-[11px]">
                      Timetable Active
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-pencil/80">
                      👋 <strong>Campus Visitor Mode:</strong> Showing verified campus events & accessible trails. Sign in to sync your timetable.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Big Primary Action Button */}
            <div className="pt-4 flex items-center gap-3 border-t border-pencil/20">
              <button
                onClick={() => navigate('/events')}
                className="px-6 py-3 bg-marker-red hover:bg-pencil text-white font-bold text-base sm:text-lg border-2 border-pencil rounded-xl shadow-[3px_3px_0px_#2d2d2d] transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Enter Campus Events Notebook</span>
                <ArrowRight className="w-5 h-5 stroke-[3]" />
              </button>
            </div>
          </div>

          {/* RIGHT CORKBOARD CARD (5 Cols): Interactive Campus Preview */}
          <div className="lg:col-span-5 bg-paper-bg border-2 border-pencil rounded-2xl p-5 sm:p-6 shadow-sketch flex flex-col justify-between relative overflow-hidden">
            <div className="thumbtack !top-[-8px]" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-pencil/20 mb-3">
              <span className="font-marker text-lg text-pencil flex items-center gap-1.5">
                <Compass className="w-4.5 h-4.5 text-marker-blue" />
                ASIET Kalady Campus Trail
              </span>
              <span className="text-[11px] px-2.5 py-0.5 bg-white border border-pencil rounded-md font-mono font-bold text-pencil/80">
                1.2 m/s Pace • 25 Nodes
              </span>
            </div>

            {/* Campus Trail SVG Preview (Crystal-clear, no overlapping text!) */}
            <div 
              onClick={() => navigate('/events')}
              title="Click to explore interactive Campus Trail in Events Notebook"
              className="w-full h-64 sm:h-72 bg-[#fdfbf7] border-2 border-pencil rounded-xl p-2 relative flex items-center justify-center overflow-hidden mb-3 cursor-pointer group shadow-xs hover:border-marker-blue transition-colors"
            >
              <CampusMapSvg
                nodes={campusNodes}
                edges={campusEdges}
                activeRoute={activeRoute}
                currentLocationNode="N08"
                targetEventNode="N16"
                compact={true}
                className="w-full h-full pointer-events-none"
              />
              
              <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 bg-white/95 backdrop-blur-xs border border-pencil rounded-md text-[11px] font-bold text-marker-blue shadow-xs group-hover:bg-pencil group-hover:text-white transition-all flex items-center gap-1">
                <span>Explore Full Trail</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Refined Feature Strip below Map */}
            <div className="p-3 bg-paper-yellow/40 border border-pencil/40 rounded-xl text-xs flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-marker-red shrink-0 fill-marker-red" />
                <span className="text-pencil/90 font-medium">
                  <strong>Free Hour Matching:</strong> Surfaces sessions fitting your empty breaks with step-free & rain-sheltered routing.
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* Bottom 3-Column Core Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          <div className="p-4 bg-white border-2 border-pencil rounded-xl shadow-sketch">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4 text-marker-red fill-marker-red" />
              <h3 className="font-marker text-base text-pencil">Personalized Relevance</h3>
            </div>
            <p className="text-xs text-pencil/80 leading-relaxed font-medium">
              Multi-factor scoring combining interest matching, time fit, transit proximity, and popularity with an explainable reason on every event card.
            </p>
          </div>

          <div className="p-4 bg-white border-2 border-pencil rounded-xl shadow-sketch">
            <div className="flex items-center gap-2 mb-1.5">
              <AlertTriangle className="w-4 h-4 text-marker-red" />
              <h3 className="font-marker text-base text-pencil">Clash & Free-Hour Finder</h3>
            </div>
            <p className="text-xs text-pencil/80 leading-relaxed font-medium">
              Checks timetable overlaps and transit walk buffers. Automatically surfaces sessions that fit inside your 45+ minute free periods.
            </p>
          </div>

          <div className="p-4 bg-white border-2 border-pencil rounded-xl shadow-sketch">
            <div className="flex items-center gap-2 mb-1.5">
              <Compass className="w-4 h-4 text-marker-blue" />
              <h3 className="font-marker text-base text-pencil">25-Node Architectural Trail</h3>
            </div>
            <p className="text-xs text-pencil/80 leading-relaxed font-medium">
              Step-free ramp rerouting for mobility needs, covered arcades in rain mode, and turn-by-turn Web Speech TTS audio navigation across ASIET.
            </p>
          </div>

        </div>

      </main>

    </div>
  );
};
