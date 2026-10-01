import React, { useState } from 'react';
import { X, CalendarPlus, AlertTriangle, CheckCircle, Sparkles, Building2 } from 'lucide-react';
import { SketchButton } from '../common/SketchButton';

export const EventCreateModal = ({
  isOpen,
  onClose,
  venues = {},
  onEventCreated,
  currentUser,
  onOpenLogin
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Workshop');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [start, setStart] = useState('11:45');
  const [end, setEnd] = useState('12:45');
  const [venueId, setVenueId] = useState('V02'); // Ada Lovelace Hall
  const [organizer, setOrganizer] = useState(
    currentUser ? `${currentUser.name} (${(currentUser.department || 'CSE').split(' ')[0]})` : 'Student Coding Guild'
  );
  
  const [conflictError, setConflictError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pencil/60 backdrop-blur-xs select-none">
        <div className="relative w-full max-w-md bg-paper-bg border-[4px] border-pencil border-wobbly-md p-6 shadow-sketchLg text-center font-hand">
          <div className="tape-strip !top-[-14px]" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 border-2 border-pencil border-wobbly bg-paper-muted hover:bg-marker-red hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
          <div className="w-12 h-12 mx-auto rounded-lg bg-paper-yellow border-2 border-pencil flex items-center justify-center mb-3 shadow-xs">
            <Building2 className="w-6 h-6 text-marker-red" />
          </div>
          <h3 className="font-marker text-2xl text-pencil mb-2">
            Student Login Required
          </h3>
          <p className="text-sm text-pencil/80 mb-5 leading-relaxed">
            To propose a campus event at Adi Shankara Institute of Engineering & Technology, please sign in or register with your Student ID card first.
          </p>
          <div className="flex gap-2 justify-center">
            <SketchButton variant="secondary" onClick={onClose} className="!py-1.5 !px-4">
              Cancel
            </SketchButton>
            <SketchButton 
              variant="primary" 
              onClick={() => {
                onClose();
                if (onOpenLogin) onOpenLogin();
              }} 
              className="!py-1.5 !px-5"
            >
              Sign In / Register 🪪
            </SketchButton>
          </div>
        </div>
      </div>
    );
  }

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
          organizer: organizer || (currentUser?.name || "Student Organizer"),
          submitted_by: currentUser?.student_id || "CS2024-MEERA",
          image_url: imageUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80"
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
        }, 2200);
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


        </div>

        {/* Campus Verification Policy Notice */}
        <div className="mb-4 p-3 bg-paper-yellow/70 border-2 border-pencil rounded-lg text-xs font-hand shadow-xs">
          <div className="flex items-center gap-1.5 font-bold text-pencil mb-0.5">
            <Sparkles className="w-3.5 h-3.5 text-marker-red fill-marker-red" />
            <span>Campus Safety & Verification Rule:</span>
          </div>
          <p className="text-pencil/80 leading-tight">
            {currentUser?.role === 'admin'
              ? '👑 Signed in as Campus Dean: Your event will be instantly verified and showcased live on the discover feed.'
              : '🛡️ Submitted by student: This event will be queued for Admin Verification by the Dean of Student Affairs before being showcased to all campus students.'}
          </p>
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

          <div>
            <label className="block text-xs uppercase tracking-wider text-pencil/70 mb-1">
              Event Poster / Image URL (Optional)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... or leave blank for auto-poster"
              className="w-full text-sm font-hand border-2 border-pencil border-wobbly px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-marker-blue"
            />
          </div>

          <div className="pt-3 border-t-2 border-dashed border-pencil/20 flex items-center justify-end gap-2">
            <SketchButton variant="secondary" onClick={onClose} className="!py-1.5 !px-4">
              Cancel
            </SketchButton>
            <SketchButton variant="primary" type="submit" disabled={loading} className="!py-1.5 !px-5">
              {loading
                ? "Checking Hall Availability..."
                : currentUser?.role === 'admin'
                ? "Direct Publish & Approve 👑"
                : "Submit for Admin Approval 🛡️"}
            </SketchButton>
          </div>
        </form>
      </div>
    </div>
  );
};
