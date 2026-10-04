import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, LayoutDashboard, Building2, AlertTriangle, 
  CheckCircle2, TrendingUp, RefreshCw, Check, X, Clock, 
  MapPin, Sparkles, AlertCircle, ArrowLeft, ArrowRight,
  Lock, KeyRound, UserCheck, Trash2, Calendar, Compass
} from 'lucide-react';
import { API_BASE } from '../config';

export const AdminPage = ({
  currentUser,
  onLoginSuccess = () => {},
  onLogout = () => {},
  theme = 'light',
  onToggleTheme = () => {},
  onResetDemo = () => {}
}) => {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [venues, setVenues] = useState({});
  const [activeTab, setActiveTab] = useState('approvals'); // 'approvals' | 'analytics' | 'all_events'
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  // Quick login states if not logged in as admin
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  const fetchAdminData = async () => {
    setLoading(true);
    setFeedbackMsg(null);
    try {
      const [statsRes, pendingRes, eventsRes, campusRes] = await Promise.all([
        fetch(`${API_BASE}/admin/stats`),
        fetch(`${API_BASE}/admin/pending-events`),
        fetch(`${API_BASE}/events`),
        fetch(`${API_BASE}/campus`)
      ]);
      const statsData = await statsRes.json();
      const pendingData = await pendingRes.json();
      const eventsData = await eventsRes.json();
      const campusData = await campusRes.json();

      setStats(statsData);
      setPendingEvents(Array.isArray(pendingData) ? pendingData : []);
      setAllEvents(Array.isArray(eventsData) ? eventsData : []);
      setVenues(campusData?.venues || {});
    } catch (err) {
      console.error("Admin data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (e) => {
    if (e) e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: adminUsername,
          password: adminPassword
        })
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        setLoginError(data.detail || "Invalid admin credentials. Use admin / admin123");
      } else if (data.role !== 'admin') {
        setLoginError("This account is not authorized as an Administrator.");
      } else {
        onLoginSuccess(data);
      }
    } catch (err) {
      setLoginError("Unable to connect to login server.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleModerate = async (eventId, action) => {
    setActionLoadingId(eventId);
    setFeedbackMsg(null);
    try {
      const resp = await fetch(`${API_BASE}/admin/moderate-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          action: action,
          admin_notes: action === 'approve' 
            ? "Verified & approved by Campus Affairs Dean." 
            : "Declined by Dean of Student Affairs."
        })
      });
      const data = await resp.json();
      if (data.success) {
        setFeedbackMsg(data.message);
        await fetchAdminData();
      }
    } catch (err) {
      console.error("Moderation error:", err);
      setFeedbackMsg("Failed to execute moderation action.");
    } finally {
      setActionLoadingId(null);
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
          <span className="text-[11px] font-bold px-2 py-0.5 bg-marker-red text-white border border-pencil rounded-md hidden sm:inline-block">
            ADMIN DESK
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

          {isAdmin && (
            <button
              onClick={onLogout}
              className="px-3 py-1.5 text-xs font-bold bg-marker-red text-white border-2 border-pencil rounded-lg hover:bg-pencil transition-all cursor-pointer shadow-xs"
            >
              Sign Out
            </button>
          )}
        </div>
      </header>

      {/* 2. Main Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-6">
        
        {/* Access Barrier if NOT Admin */}
        {!isAdmin ? (
          <div className="max-w-md mx-auto my-12 bg-white border-[3px] border-pencil rounded-2xl p-6 sm:p-8 shadow-sketchLg relative text-center">
            <div className="thumbtack !top-[-10px]" />
            <div className="w-14 h-14 bg-[#ffebee] border-2 border-pencil rounded-2xl mx-auto flex items-center justify-center mb-4">
              <ShieldCheck className="w-8 h-8 text-marker-red" />
            </div>

            <h2 className="font-marker text-2xl sm:text-3xl text-pencil mb-2">
              Administrator Access Only
            </h2>
            <p className="font-hand text-sm sm:text-base text-pencil/70 mb-6">
              You must sign in with Dean of Student Affairs credentials to access the moderation ledger, approvals queue, and venue audit desk.
            </p>

            {loginError && (
              <div className="mb-4 p-2.5 bg-marker-red/10 border-2 border-marker-red rounded-lg text-xs font-bold text-marker-red flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleQuickLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold uppercase text-pencil/70 mb-1">
                  Admin ID
                </label>
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full px-3 py-2 border-2 border-pencil rounded-lg bg-paper-bg font-mono text-sm focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-pencil/70 mb-1">
                  Password (Hint: admin123)
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border-2 border-pencil rounded-lg bg-paper-bg text-sm focus:outline-hidden"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-2.5 bg-marker-red hover:bg-pencil text-white font-bold text-sm border-2 border-pencil rounded-lg shadow-sketch transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {loginLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                <span>Unlock Admin Desk</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAdminUsername('admin');
                    setAdminPassword('admin123');
                  }}
                  className="text-xs text-pencil/60 hover:text-marker-blue underline cursor-pointer font-hand"
                >
                  ⚡ Fill Demo Credentials (admin / admin123)
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            {/* Admin Header Title Banner */}
            <div className="bg-white border-2 border-pencil rounded-2xl p-5 sm:p-6 shadow-sketch relative flex flex-wrap items-center justify-between gap-4">
              <div className="tape-strip !top-[-12px]" />
              <div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-8 h-8 text-marker-red" />
                  <h2 className="font-marker text-2xl sm:text-3xl text-pencil">
                    Dean of Student Affairs Ledger
                  </h2>
                </div>
                <p className="font-hand text-sm sm:text-base text-pencil/70 mt-1">
                  Manage student event approvals, audit room capacity, resolve campus clashes, and inspect live venue booking records.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchAdminData}
                  disabled={loading}
                  className="px-3 py-1.5 bg-paper-bg hover:bg-paper-yellow border-2 border-pencil rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh Ledger</span>
                </button>
                <button
                  onClick={onResetDemo}
                  className="px-3 py-1.5 bg-marker-red/10 hover:bg-marker-red hover:text-white border-2 border-pencil rounded-lg text-xs font-bold text-marker-red flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                  title="Reset campus events back to pristine seed state"
                >
                  <span>Reset Demo State</span>
                </button>
              </div>
            </div>

            {/* Notification alert */}
            {feedbackMsg && (
              <div className="p-3 bg-paper-yellow border-2 border-pencil rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between shadow-xs">
                <span>{feedbackMsg}</span>
                <button onClick={() => setFeedbackMsg(null)} className="hover:text-marker-red cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white border-2 border-pencil rounded-xl p-4 shadow-sketch">
                <div className="flex items-center justify-between text-pencil/60 text-xs font-bold">
                  <span>PENDING APPROVAL</span>
                  <Clock className="w-4 h-4 text-paper-yellow" />
                </div>
                <div className="font-marker text-3xl text-marker-red mt-2">
                  {stats?.pending_approvals ?? pendingEvents.length}
                </div>
                <p className="text-[11px] text-pencil/60 mt-1">Awaiting verification</p>
              </div>

              <div className="bg-white border-2 border-pencil rounded-xl p-4 shadow-sketch">
                <div className="flex items-center justify-between text-pencil/60 text-xs font-bold">
                  <span>LIVE EVENTS</span>
                  <CheckCircle2 className="w-4 h-4 text-[#2e7d32]" />
                </div>
                <div className="font-marker text-3xl text-pencil mt-2">
                  {stats?.total_events ?? allEvents.length}
                </div>
                <p className="text-[11px] text-pencil/60 mt-1">Discoverable on map</p>
              </div>

              <div className="bg-white border-2 border-pencil rounded-xl p-4 shadow-sketch">
                <div className="flex items-center justify-between text-pencil/60 text-xs font-bold">
                  <span>TOTAL ATTENDEES</span>
                  <TrendingUp className="w-4 h-4 text-marker-blue" />
                </div>
                <div className="font-marker text-3xl text-pencil mt-2">
                  {stats?.total_rsvps ?? 0}
                </div>
                <p className="text-[11px] text-pencil/60 mt-1">Confirmed student RSVPs</p>
              </div>

              <div className="bg-white border-2 border-pencil rounded-xl p-4 shadow-sketch">
                <div className="flex items-center justify-between text-pencil/60 text-xs font-bold">
                  <span>CAPACITY ALERTS</span>
                  <AlertTriangle className="w-4 h-4 text-marker-red" />
                </div>
                <div className="font-marker text-3xl text-marker-red mt-2">
                  {stats?.capacity_alerts?.length ?? 0}
                </div>
                <p className="text-[11px] text-pencil/60 mt-1">Halls at &gt;90% capacity</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b-2 border-pencil gap-2">
              <button
                onClick={() => setActiveTab('approvals')}
                className={`px-4 py-2 text-xs sm:text-sm font-bold border-2 border-b-0 border-pencil rounded-t-lg transition-all cursor-pointer ${
                  activeTab === 'approvals' 
                    ? 'bg-paper-yellow text-pencil' 
                    : 'bg-white hover:bg-paper-bg text-pencil/70'
                }`}
              >
                Pending Proposals ({pendingEvents.length})
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-2 text-xs sm:text-sm font-bold border-2 border-b-0 border-pencil rounded-t-lg transition-all cursor-pointer ${
                  activeTab === 'analytics' 
                    ? 'bg-paper-yellow text-pencil' 
                    : 'bg-white hover:bg-paper-bg text-pencil/70'
                }`}
              >
                Halls & Capacity Audit
              </button>

              <button
                onClick={() => setActiveTab('all_events')}
                className={`px-4 py-2 text-xs sm:text-sm font-bold border-2 border-b-0 border-pencil rounded-t-lg transition-all cursor-pointer ${
                  activeTab === 'all_events' 
                    ? 'bg-paper-yellow text-pencil' 
                    : 'bg-white hover:bg-paper-bg text-pencil/70'
                }`}
              >
                Active Events Directory ({allEvents.length})
              </button>
            </div>

            {/* Tab 1: Pending Approvals Queue */}
            {activeTab === 'approvals' && (
              <div className="space-y-4">
                {pendingEvents.length === 0 ? (
                  <div className="bg-white border-2 border-pencil rounded-xl p-8 text-center shadow-sketch">
                    <CheckCircle2 className="w-12 h-12 text-[#2e7d32] mx-auto mb-2" />
                    <h3 className="font-marker text-xl text-pencil">Approval Queue Clean!</h3>
                    <p className="font-hand text-sm text-pencil/70 mt-1">
                      No student proposals currently pending review. All submissions have been processed.
                    </p>
                  </div>
                ) : (
                  pendingEvents.map((ev) => (
                    <div 
                      key={ev.id}
                      className="bg-white border-2 border-pencil rounded-xl p-4 sm:p-5 shadow-sketch relative flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 max-w-xl">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-paper-yellow border border-pencil rounded uppercase">
                            {ev.category}
                          </span>
                          <span className="text-xs font-mono text-pencil/60">ID: {ev.id}</span>
                        </div>

                        <h4 className="font-marker text-xl text-pencil">{ev.title}</h4>
                        <p className="text-xs text-pencil/80 line-clamp-2">{ev.description}</p>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-pencil/70 pt-1 font-mono">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-marker-blue" />
                            {ev.start} – {ev.end}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-marker-red" />
                            {venues[ev.venue_id]?.name || ev.venue_id}
                          </span>
                          <span>Organizer: <strong>{ev.organizer}</strong></span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleModerate(ev.id, 'approve')}
                          disabled={actionLoadingId === ev.id}
                          className="px-4 py-2 bg-[#e8f5e9] hover:bg-[#2e7d32] text-[#2e7d32] hover:text-white border-2 border-pencil rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Approve Event</span>
                        </button>
                        <button
                          onClick={() => handleModerate(ev.id, 'reject')}
                          disabled={actionLoadingId === ev.id}
                          className="px-4 py-2 bg-marker-red/10 hover:bg-marker-red text-marker-red hover:text-white border-2 border-pencil rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <X className="w-4 h-4 stroke-[3]" />
                          <span>Decline</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 2: Analytics & Capacity Audit */}
            {activeTab === 'analytics' && (
              <div className="space-y-4">
                {/* Live Capacity Overflow Warning */}
                {stats?.capacity_alerts && stats.capacity_alerts.length > 0 && (
                  <div className="bg-[#ffebee] border-2 border-marker-red rounded-xl p-4 shadow-sketch">
                    <div className="flex items-center gap-2 font-bold text-marker-red text-sm mb-2">
                      <AlertTriangle className="w-5 h-5 shrink-0" />
                      <span>CRITICAL ROOM OVERFLOW WARNINGS</span>
                    </div>
                    <ul className="space-y-2">
                      {stats.capacity_alerts.map((alert, idx) => (
                        <li key={idx} className="text-xs bg-white/80 p-2.5 rounded border border-marker-red/40 flex items-center justify-between">
                          <div>
                            <strong>{alert.event_title}</strong>: {alert.rsvps} RSVPs registered for a {alert.capacity}-seat hall ({alert.venue_name}).
                          </div>
                          <span className="font-bold text-marker-red">
                            +{alert.rsvps - alert.capacity} Overflow!
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Venue Utilization Table */}
                <div className="bg-white border-2 border-pencil rounded-xl p-4 shadow-sketch overflow-x-auto">
                  <h4 className="font-marker text-lg text-pencil mb-3">Campus Venues & Capacity Utilization</h4>
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="border-b-2 border-pencil font-bold text-pencil/70 uppercase">
                      <tr>
                        <th className="py-2 px-3">Venue Code</th>
                        <th className="py-2 px-3">Venue Name</th>
                        <th className="py-2 px-3">Campus Node</th>
                        <th className="py-2 px-3">Capacity</th>
                        <th className="py-2 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pencil/20 font-mono">
                      {Object.values(venues).map((v) => (
                        <tr key={v.id || v.venue_id} className="hover:bg-paper-bg/60 transition-colors">
                          <td className="py-2.5 px-3 font-bold">{v.id || v.venue_id}</td>
                          <td className="py-2.5 px-3 font-sans font-medium">{v.name}</td>
                          <td className="py-2.5 px-3">{v.node_id}</td>
                          <td className="py-2.5 px-3">{v.capacity} Seats</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 bg-[#e8f5e9] text-[#2e7d32] border border-[#2e7d32]/40 rounded text-[10px] font-bold font-sans">
                              OPERATIONAL
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 3: All Events Directory */}
            {activeTab === 'all_events' && (
              <div className="space-y-3">
                {allEvents.map((ev) => (
                  <div key={ev.id} className="bg-white border-2 border-pencil rounded-xl p-3.5 shadow-xs flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-paper-yellow border border-pencil rounded uppercase">
                          {ev.category}
                        </span>
                        <h5 className="font-bold text-sm text-pencil">{ev.title}</h5>
                      </div>
                      <p className="text-xs text-pencil/70 mt-1 font-mono">
                        {ev.start} – {ev.end} | {venues[ev.venue_id]?.name || ev.venue_id} | RSVPs: {ev.rsvps_count || 0}
                      </p>
                    </div>

                    <button
                      onClick={() => navigate(`/events/${ev.id}`)}
                      className="px-3 py-1.5 border border-pencil rounded-lg text-xs font-bold bg-paper-bg hover:bg-paper-yellow flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Event</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};
