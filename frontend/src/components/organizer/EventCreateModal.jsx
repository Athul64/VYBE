import React, { useState } from 'react';
import { X, CalendarPlus, AlertTriangle, CheckCircle, Sparkles, Building2 } from 'lucide-react';
import { SketchButton } from '../common/SketchButton';

export const EventCreateModal = ({
  isOpen,
  onClose,
  venues = {},
  onEventCreated
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Workshop');
  const [description, setDescription] = useState('');
  const [start, setStart] = useState('11:45');
  const [end, setEnd] = useState('12:45');
  const [venueId, setVenueId] = useState('V02'); // Ada Lovelace Hall
  const [organizer, setOrganizer] = useState('Student Coding Guild');
  
  const [conflictError, setConflictError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setConflictError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const resp = await fetch('http://localhost:8000/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          description: description || "Exciting student activity on campus.",
          start,
          end,
          venue_id: venueId,
          organizer
        })
      });
      const data = await resp.json();

      if (!data.success && data.error_type === 'DOUBLE_BOOKING_CONFLICT') {
        setConflictError(data);
      } else if (data.success) {
        setSuccessMessage(data.message);
        if (onEventCreated) onEventCreated(data.event);
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error("Event creation error:", err);
      setConflictError({
        message: "Failed to connect to backend server. Make sure API is running.",
        suggested_free_venues: []
      });
    } finally {
      setLoading(false);
    }
  };

  // Preset triggers for quick judging demo
  const loadDemoClashPreset = () => {
    setTitle("Autonomous Agent Hackathon Kickoff");
    setVenueId("V02"); // Ada Lovelace Hall
    setStart("11:45");
    setEnd("12:45"); // Clashes with EVT-01 (11:30 - 12:30 at V02)!
    setCategory("Hackathon");
    setConflictError(null);
  };

  const loadDemoFreePreset = () => {
    setTitle("Game Dev Society Show & Tell");
    setVenueId("V03"); // APJ Kalam Aud
    setStart("09:00");
    setEnd("10:30");
    setCategory("Workshop");
    setConflictError(null);
  };

  const selectedVenue = venues[venueId];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pencil/60 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-xl bg-paper-bg border-[4px] border-pencil border-wobbly-md p-6 shadow-sketchLg max-h-[90vh] overflow-y-auto">
        {/* Authentic Tape Decoration */}
        <div className="tape-strip !top-[-14px]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 border-2 border-pencil border-wobbly bg-paper-muted hover:bg-marker-red hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Header */}
        <div className="mb-4 border-b-2 border-dashed border-pencil/30 pb-3">
          <div className="flex items-center gap-2 mb-1">
            <CalendarPlus className="w-6 h-6 text-marker-blue stroke-[2.5]" />
            <h3 className="font-marker text-2xl text-pencil">
              Post Campus Event (Organizer)
            </h3>
          </div>
          <p className="font-hand text-sm text-pencil/70">
            Automated double-booking prevention & hall capacity validation.
          </p>

          {/* Quick Demo Fill Buttons */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-xs font-hand font-bold text-pencil/70">Judge Presets:</span>
            <button
              type="button"
              onClick={loadDemoClashPreset}
              className="text-xs font-hand font-bold px-2 py-0.5 bg-marker-red/10 text-marker-red border border-marker-red border-wobbly hover:bg-marker-red hover:text-white cursor-pointer"
            >
              ⚡ Fill Double-Booking Clash Test
            </button>
            <button
              type="button"
              onClick={loadDemoFreePreset}
              className="text-xs font-hand font-bold px-2 py-0.5 bg-[#e8f5e9] text-[#2e7d32] border border-[#2e7d32] border-wobbly hover:bg-[#2e7d32] hover:text-white cursor-pointer"
            >
              ✅ Fill Clean Slot Test
            </button>
          </div>
        </div>

        {/* Conflict Warning Box */}
        {conflictError && (
          <div className="mb-4 p-4 bg-marker-red/10 border-[3px] border-marker-red border-wobbly text-pencil">
            <div className="flex items-start gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-marker-red shrink-0 mt-0.5" />
              <div>
                <h4 className="font-marker text-xl text-marker-red leading-tight">
                  Venue Double-Booking Blocked!
                </h4>
                <p className="font-hand text-sm font-bold mt-0.5">
                  {conflictError.message}
                </p>
              </div>
            </div>

            {conflictError.suggested_free_venues?.length > 0 && (
              <div className="mt-2 pt-2 border-t border-dashed border-marker-red/40 text-xs font-hand">
                <span className="font-bold text-pencil block mb-1">
                  💡 Available alternate halls for this time slot:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {conflictError.suggested_free_venues.map((vName, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-white border border-pencil border-wobbly text-marker-blue font-bold"
                    >
                      {vName}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-4 p-3 bg-[#e8f5e9] border-2 border-[#2e7d32] border-wobbly text-[#2e7d32] font-hand font-bold text-center flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Event Form */}
        <form onSubmit={handleSubmit} className="space-y-3 font-hand">
          <div>
            <label className="block text-xs uppercase tracking-wider text-pencil/70 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Hackathon Pitch Workshop"
              className="w-full text-base font-hand border-2 border-pencil border-wobbly px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-marker-blue"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider text-pencil/70 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-base font-hand border-2 border-pencil border-wobbly px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-marker-blue"
              >
                <option value="Workshop">Workshop</option>
                <option value="Hackathon">Hackathon</option>
                <option value="Keynote">Keynote</option>
                <option value="Competition">Competition</option>
                <option value="Design">Design</option>
                <option value="Meetup">Meetup</option>
                <option value="Cultural">Cultural</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-pencil/70 mb-1">
                Organizer Club / Society
              </label>
              <input
                type="text"
                required
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                className="w-full text-base font-hand border-2 border-pencil border-wobbly px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-marker-blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider text-pencil/70 mb-1">
                Start Time
              </label>
              <input
                type="text"
                required
                value={start}
                onChange={(e) => setStart(e.target.value)}
                placeholder="11:45"
                className="w-full text-base font-hand border-2 border-pencil border-wobbly px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-marker-blue"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-pencil/70 mb-1">
                End Time
              </label>
              <input
                type="text"
                required
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                placeholder="12:45"
                className="w-full text-base font-hand border-2 border-pencil border-wobbly px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-marker-blue"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-pencil/70 mb-1">
                Target Venue
              </label>
              <select
                value={venueId}
                onChange={(e) => setVenueId(e.target.value)}
                className="w-full text-base font-hand border-2 border-pencil border-wobbly px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-marker-blue"
              >
                {Object.entries(venues).map(([vid, v]) => (
                  <option key={vid} value={vid}>
                    {v.name} ({v.capacity} seats)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedVenue && (
            <div className="p-2 bg-paper-yellow/40 border border-pencil border-wobbly text-xs font-hand flex items-center justify-between">
              <span>Seating capacity for {selectedVenue.name}:</span>
              <strong>{selectedVenue.capacity} attendees</strong>
            </div>
          )}

          <div>
            <label className="block text-xs uppercase tracking-wider text-pencil/70 mb-1">
              Short Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will attendees learn or experience?"
              className="w-full text-base font-hand border-2 border-pencil border-wobbly px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-marker-blue"
            />
          </div>

          <div className="pt-3 border-t-2 border-dashed border-pencil/20 flex items-center justify-end gap-2">
            <SketchButton variant="secondary" onClick={onClose} className="!py-1.5 !px-4">
              Cancel
            </SketchButton>
            <SketchButton variant="primary" type="submit" disabled={loading} className="!py-1.5 !px-5">
              {loading ? "Checking Hall Availability..." : "Publish Event 📌"}
            </SketchButton>
          </div>
        </form>
      </div>
    </div>
  );
};
