import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Building2, AlertTriangle, CheckCircle2, TrendingUp, RefreshCw } from 'lucide-react';
import { SketchButton } from '../common/SketchButton';
import { StickyNote } from '../common/StickyNote';

export const AdminDashboard = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAdminStats();
    }
  }, [isOpen]);

  const fetchAdminStats = async () => {
    setLoading(true);
    try {
      const resp = await fetch('http://localhost:8000/api/admin/stats');
      const data = await resp.json();
      setStats(data);
    } catch (err) {
      console.error("Admin stats error:", err);
    } finally {
      setLoading(false);
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
              <LayoutDashboard className="w-6 h-6 text-marker-blue stroke-[2.5]" />
              <h3 className="font-marker text-3xl text-pencil">
                College Admin & Attendance Ledger
              </h3>
            </div>
            <p className="font-hand text-sm text-pencil/70">
              Real-time audit of campus venue bookings, QR check-ins, and crowd capacity limits.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAdminStats}
              title="Refresh ledger"
              className="p-1.5 border-2 border-pencil border-wobbly bg-white hover:bg-paper-yellow transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 text-pencil ${loading ? 'animate-spin' : ''}`} />
            </button>
            <SketchButton variant="secondary" onClick={onClose} className="!py-1 !px-3 text-sm">
              Close Ledger
            </SketchButton>
          </div>
        </div>

        {loading && !stats ? (
          <div className="p-12 text-center font-hand text-xl text-pencil">
            Tallying attendance logs & venue occupancy... 📊
          </div>
        ) : !stats ? (
          <div className="p-8 text-center font-hand text-pencil">
            Unable to load stats. Check backend connectivity.
          </div>
        ) : (
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
                  Turnout Ratio
                </span>
                <span className="font-marker text-3xl text-marker-blue">
                  {stats.overall_turnout_percent}%
                </span>
              </div>
            </div>

            {/* Demand vs Capacity Alert Post-it (PRD FR-12) */}
            {stats.capacity_alerts?.length > 0 && (
              <div className="relative p-4 border-[3px] border-marker-red border-wobbly bg-[#ffe5e5] shadow-sketch">
                <div className="thumbtack" />
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-marker-red shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-marker text-xl text-marker-red leading-tight">
                      Demand vs Capacity Warnings!
                    </h4>
                    <p className="font-hand text-sm text-pencil font-bold">
                      The following events have accumulated RSVP interest surpassing their physical room capacities:
                    </p>
                    <div className="mt-2 space-y-1.5">
                      {stats.capacity_alerts.map((alert, idx) => (
                        <div
                          key={idx}
                          className="p-2 bg-white border-2 border-marker-red border-wobbly flex items-center justify-between text-xs font-hand font-bold"
                        >
                          <span className="text-pencil">
                            📌 <strong>{alert.event_title}</strong> at {alert.venue}
                          </span>
                          <span className="text-marker-red">
                            {alert.rsvps} RSVPs for a {alert.capacity}-seat hall (+{alert.rsvps - alert.capacity} overflow!)
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs font-hand text-pencil/70 mt-2 italic">
                      Action recommendation: Consider reassigning to Grand Seminar Hall (120 seats) or APJ Kalam Auditorium (350 seats).
                    </p>
                  </div>
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
