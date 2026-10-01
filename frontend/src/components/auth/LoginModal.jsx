import React, { useState } from 'react';
import { X, Lock, UserCheck, Shield, KeyRound, Sparkles, AlertCircle, ArrowRight, UserPlus, CheckCircle2 } from 'lucide-react';
import { SketchButton } from '../common/SketchButton';

export const LoginModal = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentUser
}) => {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  
  // Login fields
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  
  // Register fields
  const [regName, setRegName] = useState('');
  const [regId, setRegId] = useState('');
  const [regDepartment, setRegDepartment] = useState('Computer Science & Engineering');
  const [regRole, setRegRole] = useState('student'); // 'student' | 'admin'
  const [regNeedsStepFree, setRegNeedsStepFree] = useState(false);
  const [regPassword, setRegPassword] = useState('');

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const resp = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          password: password
        })
      });

      const data = await resp.json();
      if (!resp.ok || !data.success) {
        setError(data.detail || "Invalid Student ID or password. Try registering below.");
      } else {
        setSuccess(`Welcome back, ${data.name}!`);
        setTimeout(() => {
          onLoginSuccess(data);
          onClose();
        }, 700);
      }
    } catch (err) {
      console.error("Login request failed:", err);
      setError("Unable to connect to login server. Please ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const resp = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: regId,
          name: regName,
          department: regDepartment,
          role: regRole,
          needs_step_free: regNeedsStepFree,
          password: regPassword
        })
      });

      const data = await resp.json();
      if (!resp.ok || !data.success) {
        setError(data.detail || "Registration failed. Check details and try again.");
      } else {
        setSuccess(`Registration successful! Signed in as ${data.name} (${data.student_id}).`);
        setTimeout(() => {
          onLoginSuccess(data);
          onClose();
        }, 1000);
      }
    } catch (err) {
      console.error("Registration request failed:", err);
      setError("Unable to connect to server. Please ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (id, pass) => {
    setTab('login');
    setStudentId(id);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pencil/60 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-lg bg-paper-bg border-[4px] border-pencil border-wobbly-md p-6 shadow-sketchLg">
        
        {/* Authentic Tape Strip Decoration */}
        <div className="tape-strip !top-[-14px]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 border-2 border-pencil border-wobbly bg-paper-muted hover:bg-marker-red hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* College ID Header Badge */}
        <div className="flex items-center gap-3 border-b-2 border-dashed border-pencil/30 pb-3 mb-3">
          <div className="w-12 h-12 rounded-lg bg-paper-yellow border-2 border-pencil flex items-center justify-center shadow-xs">
            {tab === 'login' ? (
              <UserCheck className="w-7 h-7 text-marker-blue stroke-[2.5]" />
            ) : (
              <UserPlus className="w-7 h-7 text-marker-red stroke-[2.5]" />
            )}
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-marker-red">
              <span className="w-2 h-2 rounded-full bg-marker-red animate-ping" />
              Adi Shankara (ASIET) Kalady Authentication
            </div>
            <h3 className="font-marker text-2xl sm:text-3xl text-pencil leading-tight">
              {tab === 'login' ? 'Student ID Card Sign In' : 'Register New Student Account'}
            </h3>
            <p className="font-hand text-xs text-pencil/70">
              {tab === 'login' 
                ? 'Sign in to propose events, reserve seats, or inspect walking routes.' 
                : 'Create your unique student or admin pass to post events & explore.'}
            </p>
          </div>
        </div>

        {/* Tab Switcher: Sign In vs Register */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            type="button"
            onClick={() => { setTab('login'); setError(null); }}
            className={`py-2 px-3 font-hand font-bold text-sm border-2 border-pencil rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              tab === 'login' 
                ? 'bg-pencil text-white shadow-[2px_2px_0px_#2d2d2d]' 
                : 'bg-white hover:bg-paper-yellow text-pencil'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => { setTab('register'); setError(null); }}
            className={`py-2 px-3 font-hand font-bold text-sm border-2 border-pencil rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              tab === 'register' 
                ? 'bg-paper-yellow text-pencil shadow-[2px_2px_0px_#2d2d2d]' 
                : 'bg-white hover:bg-paper-yellow text-pencil'
            }`}
          >
            <UserPlus className="w-4 h-4 text-marker-red" />
            <span>Register New Account ✍️</span>
          </button>
        </div>

        {/* Current Logged In Status if any */}
        {currentUser && (
          <div className="mb-3 p-2.5 bg-paper-yellow/50 border border-pencil rounded-lg text-xs font-hand flex items-center justify-between">
            <div>
              <span className="text-pencil/70 block">Currently signed in as:</span>
              <strong className="text-pencil">{currentUser.name} ({currentUser.student_id})</strong>
              <span className="ml-1.5 px-1.5 py-0.2 bg-pencil text-white text-[10px] rounded uppercase font-bold">
                {currentUser.role}
              </span>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-3 p-2.5 bg-[#ffebee] border-2 border-marker-red border-wobbly flex items-start gap-2 text-xs font-hand text-marker-red">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="font-bold leading-tight">{error}</p>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-3 p-2.5 bg-[#e8f5e9] border-2 border-[#2e7d32] border-wobbly flex items-center gap-2 text-xs font-hand text-[#2e7d32] font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <p>{success}</p>
          </div>
        )}

        {/* 1. SIGN IN FORM */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3 font-hand">
            <div>
              <label className="block font-bold text-xs uppercase tracking-wider text-pencil mb-1 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-marker-blue" />
                <span>Student / Staff ID:</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. admin or your registered ID"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border-2 border-pencil border-wobbly font-hand text-base tracking-wider focus:outline-none focus:bg-paper-yellow/30 uppercase"
              />
            </div>

            <div>
              <label className="block font-bold text-xs uppercase tracking-wider text-pencil mb-1 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-marker-red" />
                <span>Password:</span>
              </label>
              <input
                type="password"
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border-2 border-pencil border-wobbly font-hand text-base focus:outline-none focus:bg-paper-yellow/30"
              />
            </div>

            <div className="pt-2">
              <SketchButton
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full !py-2 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Validating Credentials...</span>
                ) : (
                  <>
                    <span>Sign In To Campus Ledger</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </SketchButton>
            </div>

            <div className="text-center pt-1 text-xs">
              <span className="text-pencil/70">New student without an ID? </span>
              <button
                type="button"
                onClick={() => { setTab('register'); setError(null); }}
                className="font-bold underline text-marker-blue hover:text-marker-red cursor-pointer"
              >
                Click here to Register
              </button>
            </div>
          </form>
        )}

        {/* 2. REGISTRATION FORM */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-2.5 font-hand">
            <div>
              <label className="block font-bold text-xs uppercase tracking-wider text-pencil mb-0.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Arun Nair"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border-2 border-pencil border-wobbly font-hand text-base focus:outline-none focus:bg-paper-yellow/30"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-xs uppercase tracking-wider text-pencil mb-0.5">
                  Student / Roll ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ASIET-2024-001"
                  value={regId}
                  onChange={(e) => setRegId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border-2 border-pencil border-wobbly font-hand text-sm uppercase tracking-wider focus:outline-none focus:bg-paper-yellow/30"
                />
              </div>

              <div>
                <label className="block font-bold text-xs uppercase tracking-wider text-pencil mb-0.5">
                  Department
                </label>
                <select
                  value={regDepartment}
                  onChange={(e) => setRegDepartment(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border-2 border-pencil border-wobbly font-hand text-sm focus:outline-none focus:bg-paper-yellow/30"
                >
                  <option value="Computer Science & Engineering">CSE (Computer Science)</option>
                  <option value="Artificial Intelligence & Data Science">AI & Data Science</option>
                  <option value="Electronics & Communication">ECE (Electronics)</option>
                  <option value="Mechanical & Automation">Mechanical & Robotics</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-xs uppercase tracking-wider text-pencil mb-0.5">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Choose password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border-2 border-pencil border-wobbly font-hand text-base focus:outline-none focus:bg-paper-yellow/30"
                />
              </div>

              <div>
                <label className="block font-bold text-xs uppercase tracking-wider text-pencil mb-0.5">
                  Account Role
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border-2 border-pencil border-wobbly font-hand text-sm focus:outline-none focus:bg-paper-yellow/30"
                >
                  <option value="student">Student (Submit & RSVP)</option>
                  <option value="admin">Admin / Dean (Approve Events)</option>
                </select>
              </div>
            </div>

            {/* Mobility Accessibility Checkbox */}
            <div className="p-2 bg-paper-yellow/30 border border-pencil rounded flex items-center gap-2">
              <input
                type="checkbox"
                id="reg-stepfree"
                checked={regNeedsStepFree}
                onChange={(e) => setRegNeedsStepFree(e.target.checked)}
                className="w-4 h-4 cursor-pointer"
              />
              <label htmlFor="reg-stepfree" className="text-xs font-hand text-pencil cursor-pointer">
                ♿ I prefer step-free wheelchair ramps & elevator trails
              </label>
            </div>

            <div className="pt-1">
              <SketchButton
                type="submit"
                variant="postit"
                disabled={loading}
                className="w-full !py-2 flex items-center justify-center gap-2 text-base font-bold"
              >
                {loading ? (
                  <span>Registering Campus Pass...</span>
                ) : (
                  <>
                    <span>Create Account & Sign In 🚀</span>
                  </>
                )}
              </SketchButton>
            </div>

            <div className="text-center pt-0.5 text-xs">
              <span className="text-pencil/70">Already have an ID? </span>
              <button
                type="button"
                onClick={() => { setTab('login'); setError(null); }}
                className="font-bold underline text-marker-blue hover:text-marker-red cursor-pointer"
              >
                Sign in here
              </button>
            </div>
          </form>
        )}

        {/* Admin Quick Credentials Helper */}
        <div className="mt-4 pt-3 border-t-2 border-dashed border-pencil/30 flex items-center justify-between text-xs font-hand">
          <span className="text-pencil/70">Admin Access: <strong>admin</strong> / <strong>admin123</strong></span>
          <button
            type="button"
            onClick={() => handleQuickFill('admin', 'admin123')}
            className="px-2.5 py-1 bg-[#ffebee] hover:bg-marker-red hover:text-white border border-marker-red rounded font-bold text-marker-red transition-all cursor-pointer shadow-xs"
          >
            🛡️ Fill Admin Login
          </button>
        </div>

      </div>
    </div>
  );
};
