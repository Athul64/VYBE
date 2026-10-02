import React, { useState, useRef } from 'react';
import { X, CalendarPlus, AlertTriangle, CheckCircle, Sparkles, Building2, Upload, Image as ImageIcon, Trash2, Link } from 'lucide-react';
import { SketchButton } from '../common/SketchButton';
import { API_BASE } from '../../config';

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
  const [imagePreview, setImagePreview] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSizeStr, setFileSizeStr] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [useUrlFallback, setUseUrlFallback] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Please select a valid image file (.png, .jpg, .jpeg, .webp).");
      return;
    }

    setFileName(file.name);
    setFileSizeStr(`${(file.size / 1024).toFixed(0)} KB`);

    // Instant local preview
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Data = uploadEvent.target?.result;
      setImagePreview(base64Data);
      setImageUrl(base64Data);
    };
    reader.readAsDataURL(file);

    // Upload to backend /api/upload
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const resp = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.url) {
          setImageUrl(data.url);
        }
      }
    } catch (err) {
      console.warn("Backend file upload fallback to base64 preview:", err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview('');
    setImageUrl('');
    setFileName('');
    setFileSizeStr('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setConflictError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const resp = await fetch(`${API_BASE}/events`, {
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
          submitted_by: currentUser?.student_id || "STUDENT",
          image_url: imageUrl || imagePreview || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80"
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
              {currentUser?.role === 'admin' ? "Publish Campus Event (Admin)" : "Propose Student Event"}
            </h3>
          </div>
          <p className="font-hand text-sm text-pencil/70">
            {currentUser?.role === 'admin'
              ? "Directly publishes to the campus event showcase with administrative clearance."
              : "Submits to Dean of Student Affairs for room verification before public showcase."}
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

          {/* System Image Upload Section */}
          <div className="p-3 bg-paper-yellow/30 border-2 border-pencil border-wobbly">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs uppercase tracking-wider font-bold text-pencil flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-marker-blue" />
                <span>Event Poster Image (From System / Computer)</span>
              </label>
              <button
                type="button"
                onClick={() => setUseUrlFallback(!useUrlFallback)}
                className="text-[11px] underline text-pencil/70 hover:text-marker-blue cursor-pointer"
              >
                {useUrlFallback ? "Switch to Local File Upload" : "Or paste image link"}
              </button>
            </div>

            {/* Hidden native file input for system file picker */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!useUrlFallback ? (
              imagePreview ? (
                /* Polaroid preview with tape */
                <div className="relative p-2.5 bg-white border-2 border-pencil border-wobbly flex items-center gap-3">
                  <div className="relative w-20 h-20 shrink-0 bg-paper-muted border border-pencil overflow-hidden flex items-center justify-center shadow-xs">
                    <img 
                      src={imagePreview} 
                      alt="Uploaded Poster" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 text-xs">
                    <div className="flex items-center gap-1 text-[#2e7d32] font-bold mb-0.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{uploadingImage ? "Uploading to system..." : "Poster Attached from System"}</span>
                    </div>
                    <p className="truncate font-mono text-pencil font-medium">{fileName || "Selected Image File"}</p>
                    {fileSizeStr && <span className="text-pencil/60 font-mono text-[10px] block">{fileSizeStr}</span>}
                    <div className="flex items-center gap-2 mt-1.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2 py-0.5 bg-paper-yellow hover:bg-pencil hover:text-white border border-pencil text-[11px] font-bold cursor-pointer transition-colors"
                      >
                        Change Image
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="px-2 py-0.5 bg-[#ffebee] hover:bg-marker-red hover:text-white border border-marker-red text-marker-red text-[11px] font-bold cursor-pointer flex items-center gap-0.5 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Dropzone / Click to upload from system */
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 border-2 border-dashed border-pencil bg-white hover:bg-paper-yellow/40 transition-colors cursor-pointer text-center rounded-sm"
                >
                  <div className="w-9 h-9 mx-auto rounded-full bg-paper-yellow border border-pencil flex items-center justify-center mb-1 shadow-xs">
                    <Upload className="w-4 h-4 text-pencil" />
                  </div>
                  <strong className="font-marker text-sm text-pencil block">
                    Upload Poster from your System / Device
                  </strong>
                  <span className="font-hand text-xs text-pencil/70 block mt-0.5">
                    Click to browse your computer files (.PNG, .JPG, .JPEG, .WEBP)
                  </span>
                </div>
              )
            ) : (
              /* URL fallback */
              <div className="space-y-1">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImagePreview(e.target.value);
                  }}
                  placeholder="https://images.unsplash.com/... or paste image web address"
                  className="w-full text-xs font-hand border-2 border-pencil border-wobbly px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-marker-blue"
                />
                <span className="text-[10px] text-pencil/60 italic block">
                  Tip: Switch to file upload above to pick images directly from your computer.
                </span>
              </div>
            )}
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
