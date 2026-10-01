import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { LandingPage } from './pages/LandingPage';
import { EventsPage } from './pages/EventsPage';
import { EventDetailPage } from './pages/EventDetailPage';

import { QrPassModal } from './components/student/QrPassModal';
import { FreeGapFinder } from './components/feed/FreeGapFinder';
import { EventCreateModal } from './components/organizer/EventCreateModal';
import { AdminDashboard } from './components/organizer/AdminDashboard';
import { LoginModal } from './components/auth/LoginModal';

import { useSpeech } from './hooks/useSpeech';

const API_BASE = 'http://localhost:8000/api';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-paper-bg p-8 flex items-center justify-center font-sans">
          <div className="max-w-md bg-white border-2 border-pencil rounded-xl p-6 shadow-sketch relative">
            <div className="thumbtack !top-[-10px]" />
            <h2 className="font-marker text-2xl text-marker-red mb-2">Notebook Page Crinkled!</h2>
            <p className="text-sm text-pencil/80 mb-4">
              Something went slightly wobbly rendering this page:
            </p>
            <pre className="text-xs bg-paper-bg p-3 border border-pencil rounded mb-4 overflow-auto text-pencil/70">
              {this.state.error?.message || 'Unknown render error'}
            </pre>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.href = '/';
              }}
              className="px-4 py-2 bg-paper-yellow hover:bg-pencil hover:text-white border-2 border-pencil rounded-lg font-bold text-sm shadow-[2px_2px_0px_#2d2d2d] transition-all cursor-pointer"
            >
              Back to Home Desk
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  // Authentication & Session
  // Authentication & Session - Default strictly to Logged Out (Visitor/Guest Mode)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('vybe_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Clear any old default demo admin session so site starts clean
        if (parsed?.student_id === 'admin' && !parsed?.explicit_login) {
          localStorage.removeItem('vybe_user');
          return null;
        }
        if (parsed && parsed.student_id) return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);

  // Personas - No default admin persona
  const [personas, setPersonas] = useState({});
  const [activePersonaKey, setActivePersonaKey] = useState(() => {
    try {
      const saved = localStorage.getItem('vybe_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed?.persona_key || null;
      }
    } catch {}
    return null;
  });

  // Campus Data
  const [campusNodes, setCampusNodes] = useState({});
  const [campusEdges, setCampusEdges] = useState([]);
  const [venues, setVenues] = useState({});

  // Events Feed
  const [events, setEvents] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [rsvpdEventIds, setRsvpdEventIds] = useState([]);

  // Wayfinding State
  const [fromNode, setFromNode] = useState('N08');
  const [toNode, setToNode] = useState('N09');
  const [stepFree, setStepFree] = useState(false);
  const [rainMode, setRainMode] = useState(false);
  const [activeRoute, setActiveRoute] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  // Modals & Panels
  const [activeClash, setActiveClash] = useState(null);
  const [selectedEventForPass, setSelectedEventForPass] = useState(null);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [isFreeGapOpen, setIsFreeGapOpen] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // TTS Voice Hook
  const { 
    isSupported: isSpeechSupported, 
    isSpeaking, 
    currentStepIndex, 
    speakSteps, 
    stop: stopSpeech 
  } = useSpeech();

  // Load Initial Campus & Personas & Pending Count
  useEffect(() => {
    fetchCampusData();
    fetchPersonas();
    fetchPendingCount();
  }, []);

  const fetchPendingCount = async () => {
    try {
      const resp = await fetch(`${API_BASE}/admin/pending-events`);
      if (resp.ok) {
        const data = await resp.json();
        setPendingApprovalsCount(Array.isArray(data) ? data.length : 0);
      }
    } catch (err) {
      console.error("Pending count error:", err);
    }
  };

  const handleLoginSuccess = (userData) => {
    const sessionData = { ...userData, explicit_login: true };
    setCurrentUser(sessionData);
    localStorage.setItem('vybe_user', JSON.stringify(sessionData));
    if (sessionData.persona_key && sessionData.persona_key !== activePersonaKey) {
      setActivePersonaKey(sessionData.persona_key);
    }
    fetchPendingCount();
    fetchEvents(sessionData.persona_key || activePersonaKey);
  };

  const handleLogout = () => {
    localStorage.removeItem('vybe_user');
    setCurrentUser(null);
    setActivePersonaKey(null);
    fetchEvents(null);
  };

  // Fetch Ranked Events when Persona changes
  useEffect(() => {
    fetchEvents(activePersonaKey);
  }, [activePersonaKey]);

  // Sync navigation origin to active persona or default to Main Gate
  useEffect(() => {
    if (activePersonaKey && personas[activePersonaKey]) {
      const p = personas[activePersonaKey];
      setFromNode(p.current_location_node || 'N01');
      setStepFree(Boolean(p.needs_step_free));
    } else {
      setFromNode('N01'); // Main Entrance
      setStepFree(false);
    }
  }, [activePersonaKey, personas]);

  // Auto-calculate route
  useEffect(() => {
    if (fromNode && toNode) {
      calculateRoute(fromNode, toNode, stepFree, rainMode);
    }
  }, [fromNode, toNode, stepFree, rainMode]);

  const fetchCampusData = async () => {
    try {
      const resp = await fetch(`${API_BASE}/campus`);
      const data = await resp.json();
      setCampusNodes(data.nodes);
      setCampusEdges(data.edges);
      setVenues(data.venues);
    } catch (err) {
      console.error("Campus fetch failed:", err);
    }
  };

  const fetchPersonas = async () => {
    try {
      const resp = await fetch(`${API_BASE}/personas`);
      const data = await resp.json();
      setPersonas(data);
    } catch (err) {
      console.error("Personas fetch failed:", err);
    }
  };

  const fetchEvents = async (studentKey) => {
    try {
      const url = studentKey ? `${API_BASE}/events?student=${encodeURIComponent(studentKey)}` : `${API_BASE}/events`;
      const resp = await fetch(url);
      const data = await resp.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Events fetch failed:", err);
    }
  };

  const calculateRoute = async (from, to, step_free, rain_penalty) => {
    try {
      const query = new URLSearchParams({
        from,
        to,
        stepfree: String(step_free),
        covered: String(rain_penalty)
      });
      const resp = await fetch(`${API_BASE}/route?${query.toString()}`);
      if (!resp.ok) {
        setActiveRoute(null);
        return;
      }
      const data = await resp.json();
      setActiveRoute(data);
    } catch (err) {
      console.error("Route calculation error:", err);
      setActiveRoute(null);
    }
  };

  // RSVP Handler (PRD FR-3 & FR-4 Clash Check)
  const handleRsvp = async (event) => {
    if (!currentUser) {
      setIsLoginOpen(true);
      return;
    }

    try {
      const resp = await fetch(`${API_BASE}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: currentUser?.student_id || currentUser?.persona_key || activePersonaKey || "STUDENT",
          event_id: event.id
        })
      });
      const data = await resp.json();

      if (data.clash_check && data.clash_check.is_clash) {
        setActiveClash(data.clash_check);
      } else {
        setActiveClash(null);
        if (!rsvpdEventIds.includes(event.id)) {
          setRsvpdEventIds(prev => [...prev, event.id]);
        }
        fetchEvents(activePersonaKey);
        setSelectedEventForPass(event);
        setIsPassModalOpen(true);
      }
    } catch (err) {
      console.error("RSVP error:", err);
    }
  };

  const handleOpenPass = (event) => {
    setSelectedEventForPass(event);
    setIsPassModalOpen(true);
  };

  const handleResetDemo = async () => {
    try {
      await fetch(`${API_BASE}/reset-demo`, { method: 'POST' });
      fetchEvents(activePersonaKey);
      fetchPendingCount();
      setRsvpdEventIds([]);
      setActiveClash(null);
      if (personas[activePersonaKey]) {
        setFromNode(personas[activePersonaKey].current_location_node);
        setToNode('N09');
        setStepFree(personas[activePersonaKey].needs_step_free);
        setRainMode(false);
      }
    } catch (err) {
      console.error("Demo reset error:", err);
    }
  };

  const categories = ['All', 'Workshop', 'Hackathon', 'Competition', 'Design', 'Cultural'];

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
        {/* 1. Hero Landing Page */}
        <Route 
          path="/" 
          element={
            <LandingPage
              personas={personas}
              activePersonaKey={activePersonaKey}
              onSelectPersona={(k) => setActivePersonaKey(k)}
              onResetDemo={handleResetDemo}
              currentUser={currentUser}
              onOpenLogin={() => setIsLoginOpen(true)}
              onLogout={handleLogout}
              pendingApprovalsCount={pendingApprovalsCount}
              onOpenAdmin={() => setIsAdminOpen(true)}
              campusNodes={campusNodes}
              campusEdges={campusEdges}
            />
          } 
        />

        {/* 2. Events Showcase List Page */}
        <Route 
          path="/events" 
          element={
            <EventsPage
              personas={personas}
              activePersonaKey={activePersonaKey}
              setActivePersonaKey={setActivePersonaKey}
              events={events}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              categories={categories}
              rsvpdEventIds={rsvpdEventIds}
              onRsvp={handleRsvp}
              onOpenPass={handleOpenPass}
              onResetDemo={handleResetDemo}
              activeClash={activeClash}
              setActiveClash={setActiveClash}
              onOpenFreeGap={() => setIsFreeGapOpen(true)}
              onOpenCreateEvent={() => setIsCreateEventOpen(true)}
              onOpenAdmin={() => setIsAdminOpen(true)}
              currentUser={currentUser}
              onOpenLogin={() => setIsLoginOpen(true)}
              onLogout={handleLogout}
              pendingApprovalsCount={pendingApprovalsCount}
              campusNodes={campusNodes}
              campusEdges={campusEdges}
              fromNode={fromNode}
              setFromNode={setFromNode}
              toNode={toNode}
              setToNode={setToNode}
              stepFree={stepFree}
              setStepFree={setStepFree}
              rainMode={rainMode}
              setRainMode={setRainMode}
              activeRoute={activeRoute}
              calculateRoute={calculateRoute}
              selectedNode={selectedNode}
              setSelectedNode={setSelectedNode}
              isSpeechSupported={isSpeechSupported}
              isSpeaking={isSpeaking}
              currentStepIndex={currentStepIndex}
              speakSteps={speakSteps}
              stopSpeech={stopSpeech}
            />
          } 
        />

        {/* 3. Event Detail Page */}
        <Route 
          path="/events/:eventId" 
          element={
            <EventDetailPage
              events={events}
              personas={personas}
              activePersonaKey={activePersonaKey}
              rsvpdEventIds={rsvpdEventIds}
              onRsvp={handleRsvp}
              onOpenPass={handleOpenPass}
              campusNodes={campusNodes}
              campusEdges={campusEdges}
              venues={venues}
              onOpenFreeGap={() => setIsFreeGapOpen(true)}
              currentUser={currentUser}
              onOpenLogin={() => setIsLoginOpen(true)}
            />
          } 
        />

        {/* Fallback to Hero Landing */}
        <Route 
          path="*" 
          element={
            <LandingPage
              personas={personas}
              activePersonaKey={activePersonaKey}
              onSelectPersona={(k) => setActivePersonaKey(k)}
              onResetDemo={handleResetDemo}
              currentUser={currentUser}
              onOpenLogin={() => setIsLoginOpen(true)}
              onLogout={handleLogout}
              pendingApprovalsCount={pendingApprovalsCount}
              onOpenAdmin={() => setIsAdminOpen(true)}
              campusNodes={campusNodes}
              campusEdges={campusEdges}
            />
          } 
        />
      </Routes>
      </ErrorBoundary>

      {/* Global Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        currentUser={currentUser}
      />

      <QrPassModal
        event={selectedEventForPass}
        student={currentUser || personas[activePersonaKey] || { name: "Student", student_id: "STUDENT", department: "ASIET" }}
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        onCheckInSuccess={() => fetchEvents(activePersonaKey)}
      />

      <FreeGapFinder
        isOpen={isFreeGapOpen}
        onClose={() => setIsFreeGapOpen(false)}
        activePersonaKey={currentUser?.student_id || activePersonaKey}
        onRsvp={handleRsvp}
        onNavigate={(nodeId) => {
          setToNode(nodeId);
          calculateRoute(fromNode, nodeId, stepFree, rainMode);
        }}
      />

      <EventCreateModal
        isOpen={isCreateEventOpen}
        onClose={() => setIsCreateEventOpen(false)}
        venues={venues}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginOpen(true)}
        onEventCreated={() => {
          fetchEvents(activePersonaKey);
          fetchPendingCount();
        }}
      />

      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onEventApproved={() => {
          fetchEvents(activePersonaKey);
          fetchPendingCount();
        }}
      />
    </BrowserRouter>
  );
}
