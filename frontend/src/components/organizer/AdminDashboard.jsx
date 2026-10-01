import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Building2, AlertTriangle, CheckCircle2, 
  TrendingUp, RefreshCw, ShieldCheck, Check, X, Clock, MapPin, Sparkles, AlertCircle
} from 'lucide-react';
import { SketchButton } from '../common/SketchButton';

export const AdminDashboard = ({ 
  isOpen, 
  onClose,
  onEventApproved = () => {}
}) => {
  const [stats, setStats] = useState(null);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('approvals'); // 'approvals' | 'analytics'
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchAdminData();
    }
  }, [isOpen]);

  const fetchAdminData = async () => {
    setLoading(true);
    setFeedbackMsg(null);
    try {
      const [statsRes, pendingRes] = await Promise.all([
        fetch('http://localhost:8000/api/admin/stats'),
        fetch('http://localhost:8000/api/admin/pending-events')
      ]);
      const statsData = await statsRes.json();
      const pendingData = await pendingRes.json();
      setStats(statsData);
      setPendingEvents(pendingData);
    } catch (err) {
      console.error("Admin data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (eventId, action) => {
    setActionLoadingId(eventId);
    setFeedbackMsg(null);
    try {
      const resp = await fetch('http://localhost:8000/api/admin/moderate-event', {
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
        // Refresh data
        await fetchAdminData();
        // Notify parent so student events feed refreshes
        onEventApproved();
      }
    } catch (err) {
      console.error("Moderation error:", err);
      setFeedbackMsg("Failed to execute moderation action.");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pencil/60 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-4xl bg-paper-bg border-[4px] border-pencil border-wobbly-md p-6 shadow-sketchLg max-h-[92vh] overflow-y-auto">
        {/* Authentic Tape Decoration */}
        <div className="tape-strip !top-[-14px]" />

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-dashed border-pencil/30 pb-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-marker-red stroke-[2.5]" />
              <h3 className="font-marker text-3xl text-pencil">
                Dean of Student Affairs Moderation Desk
              </h3>
            </div>
            <p className="font-hand text-sm text-pencil/70">
              Campus authority ledger: verify student proposals, approve events for public discovery, and audit hall capacity.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAdminData}
              title="Refresh ledger"
              className="p-1.5 border-2 border-pencil border-wobbly bg-white hover:bg-paper-yellow transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 text-pencil ${loading ? 'animate-spin' : ''}`} />
            </button>
            <SketchButton variant="secondary" onClick={onClose} className="!py-1 !px-3 text-sm">
              Close Desk
            </SketchButton>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b-2 border-pencil/20 pb-3 mb-4">
          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-4 py-1.5 font-hand font-bold text-sm border-2 border-pencil border-wobbly transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'approvals'
                ? 'bg-paper-yellow shadow-[2px_2px_0px_#2d2d2d]'
                : 'bg-white hover:bg-paper-bg text-pencil/70'
            }`}
          >
            <span>🛡️ Student Event Approvals</span>
            {pendingEvents.length > 0 && (
              <span className="px-1.5 py-0.2 bg-marker-red text-white text-xs rounded-full font-bold animate-pulse">
                {pendingEvents.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-1.5 font-hand font-bold text-sm border-2 border-pencil border-wobbly transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-paper-yellow shadow-[2px_2px_0px_#2d2d2d]'
                : 'bg-white hover:bg-paper-bg text-pencil/70'
            }`}
          >
            <span>📊 Venue & Attendance Ledger</span>
          </button>
        </div>

        {/* Toast feedback message */}
        {feedbackMsg && (
          <div className="mb-4 p-3 bg-paper-yellow border-2 border-pencil border-wobbly flex items-center justify-between text-xs font-hand font-bold text-pencil shadow-xs">
            <span>⚡ {feedbackMsg}</span>
            <button onClick={() => setFeedbackMsg(null)} className="text-pencil/60 hover:text-pencil cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {/* TAB 1: PENDING APPROVALS QUEUE */}
        {activeTab === 'approvals' && (
          <div className="space-y-4">
            <div className="p-3 bg-white border-2 border-pencil border-wobbly flex items-center justify-between text-xs font-hand">
              <div>
                <strong className="text-pencil block text-sm">Policy Notice:</strong>
                <span className="text-pencil/80">
                  Events submitted by students require official admin clearance for room availability and safety before they are visible to the campus.
                </span>
              </div>
              <span className="px-2.5 py-1 bg-paper-yellow border border-pencil rounded font-bold shrink-0 ml-3">
                {pendingEvents.length} Pending Review
              </span>
            </div>

            {pendingEvents.length === 0 ? (
              <div className="p-12 text-center bg-white border-2 border-dashed border-pencil/30 rounded-xl">
                <CheckCircle2 className="w-12 h-12 text-[#2e7d32] mx-auto mb-2" />
                <h4 className="font-marker text-2xl text-pencil mb-1">Queue is All Clear!</h4>
                <p className="font-hand text-sm text-pencil/70">
                  Every student submission has been moderated and approved.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-4 bg-white border-2 border-pencil border-wobbly shadow-sketch relative hover:shadow-sketchLg transition-all"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-pencil text-white rounded">
                            {evt.category}
                          </span>
                          <span className="text-xs font-hand font-bold text-marker-blue">
                            Submitter: {evt.submitted_by || evt.organizer}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-paper-yellow text-pencil border border-pencil rounded font-bold">
                            PENDING DEAN REVIEW
                          </span>
                        </div>
                        <h4 className="font-marker text-2xl text-pencil leading-tight">
                          {evt.title}
                        </h4>
                      </div>

                      {/* Action Moderation Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          disabled={actionLoadingId === evt.id}
                          onClick={() => handleModerate(evt.id, 'approve')}
                          className="px-3 py-1.5 bg-[#e8f5e9] hover:bg-[#2e7d32] text-[#2e7d32] hover:text-white border-2 border-[#2e7d32] border-wobbly font-hand font-bold text-sm transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Approve & Publish</span>
                        </button>

                        <button
                          disabled={actionLoadingId === evt.id}
                          onClick={() => handleModerate(evt.id, 'reject')}
                          className="px-3 py-1.5 bg-marker-red/10 hover:bg-marker-red text-marker-red hover:text-white border-2 border-marker-red border-wobbly font-hand font-bold text-sm transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                        >
                          <X className="w-4 h-4 stroke-[3]" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-3 items-start mb-3">
                      {evt.image_url && (
                        <div className="w-20 h-20 shrink-0 bg-paper-bg p-1 border-2 border-pencil rounded-md overflow-hidden shadow-xs">
                          <img 
                            src={evt.image_url} 
                            alt={evt.title} 
                            className="w-full h-full object-cover rounded" 
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <p className="font-hand text-sm text-pencil/80 flex-1 leading-relaxed">
                        {evt.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-hand text-pencil/70 pt-2 border-t border-pencil/20">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-marker-blue" />
                        <span>Slot: <strong>{evt.start} – {evt.end}</strong></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-marker-red" />
                        <span>Hall: <strong>{evt.venue_name || evt.venue_id}</strong></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-pencil" />
                        <span>Max Capacity: <strong>{evt.capacity} students</strong></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ANALYTICS & CAPACITY LEDGER */}
        {activeTab === 'analytics' && stats && (
          <div className="space-y-6">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-white border-2 border-pencil border-wobbly shadow-sketch">
                <span className="text-xs font-hand uppercase tracking-wider text-pencil/60 block">
                  Total Events
                </span>
                <span className="font-marker text-3xl text-pencil">
                  {stats.total_events}
                </span>
              </div>

              <div className="p-3.5 bg-paper-yellow border-2 border-pencil border-wobbly shadow-sketch">
                <span className="text-xs font-hand uppercase tracking-wider text-pencil/60 block">
                  Total RSVPs
                </span>
                <span className="font-marker text-3xl text-pencil">
                  {stats.total_rsvps}
                </span>
              </div>

              <div className="p-3.5 bg-[#e8f5e9] border-2 border-[#2e7d32] border-wobbly shadow-sketch">
                <span className="text-xs font-hand uppercase tracking-wider text-pencil/60 block">
                  Verified QR Check-Ins
                </span>
                <span className="font-marker text-3xl text-[#2e7d32]">
                  {stats.total_checkins}
                </span>
              </div>

              <div className="p-3.5 bg-white border-2 border-pencil border-wobbly shadow-sketch">
                <span className="text-xs font-hand uppercase tracking-wider text-pencil/60 block">
                  Turnout Rate
                </span>
                <span className="font-marker text-3xl text-marker-blue">
                  {stats.overall_turnout_percent}%
                </span>
              </div>
            </div>

            {/* Overbooking Alerts */}
            {stats.capacity_alerts?.length > 0 && (
              <div className="p-4 bg-marker-red/10 border-[3px] border-marker-red border-wobbly">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-marker-red stroke-[2.5]" />
                  <h4 className="font-marker text-xl text-marker-red">
                    Over-Capacity Crowd Warnings Detected!
                  </h4>
                </div>
                <div className="space-y-1.5 font-hand text-sm">
                  {stats.capacity_alerts.map((a, i) => (
                    <div key={i} className="flex items-center justify-between text-pencil">
                      <span>• <strong>{a.event_title}</strong> at {a.venue}</span>
                      <span className="font-bold text-marker-red">
                        {a.rsvps} RSVPs booked for {a.capacity} seats!
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Venue Utilization Table */}
            <div className="p-4 bg-white border-[3px] border-pencil border-wobbly shadow-sketch">
              <h4 className="font-marker text-xl text-pencil mb-3 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-pencil stroke-[2.5]" />
                Campus Hall Utilization & Headcount Breakdown
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-hand text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-pencil text-xs uppercase tracking-wider text-pencil/70 bg-paper-bg">
                      <th className="py-2 px-3">Hall / Venue</th>
                      <th className="py-2 px-3">Capacity</th>
                      <th className="py-2 px-3">Events</th>
                      <th className="py-2 px-3">RSVPs</th>
                      <th className="py-2 px-3">Verified Check-Ins</th>
                      <th className="py-2 px-3">Occupancy Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pencil/20">
                    {stats.venue_utilization?.map((v) => (
                      <tr key={v.venue_id} className="hover:bg-paper-bg/60 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-pencil">
                          {v.name}
                        </td>
                        <td className="py-2.5 px-3">{v.capacity} seats</td>
                        <td className="py-2.5 px-3">{v.events_count}</td>
                        <td className="py-2.5 px-3 font-bold">{v.total_rsvps}</td>
                        <td className="py-2.5 px-3 font-bold text-[#2e7d32]">{v.total_checkins}</td>
                        <td className="py-2.5 px-3">
                          {v.overbooked_alert ? (
                            <span className="px-2 py-0.5 text-xs bg-marker-red/10 text-marker-red border border-marker-red border-wobbly font-bold">
                              Over Capacity ⚠️
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-xs bg-[#e8f5e9] text-[#2e7d32] border border-[#2e7d32] border-wobbly font-bold">
                              {v.occupancy_rate}% occupied
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Category Mix */}
            <div className="p-4 bg-paper-yellow/40 border-2 border-pencil border-wobbly">
              <span className="font-marker text-lg text-pencil block mb-2">
                Event Category Mix on Campus:
              </span>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.category_mix || {}).map(([cat, count]) => (
                  <span
                    key={cat}
                    className="px-3 py-1 bg-white border-2 border-pencil border-wobbly font-hand text-sm font-bold flex items-center gap-1.5"
                  >
                    <span>{cat}</span>
                    <span className="w-5 h-5 rounded-full bg-pencil text-white text-xs flex items-center justify-center font-mono">
                      {count}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
