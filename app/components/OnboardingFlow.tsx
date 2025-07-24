'use client';

import { useState, useEffect, useCallback } from 'react';

// Define the auth flow steps
type AuthStep = 'splash' | 'welcome' | 'firstname' | 'email' | 'password' | 'share' | 'final';

interface AuthState {
  isSignUp: boolean;
  firstName: string;
  email: string;
  password: string;
  accessToken: string | null;
  user: any | null;
}

interface OnboardingFlowProps {
  onComplete: () => void;
}

// API Configuration
const API_BASE_URL = 'https://0f920feba904.ngrok-free.app';

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<AuthStep>('splash');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [authState, setAuthState] = useState<AuthState>({
    isSignUp: true,
    firstName: '',
    email: '',
    password: '',
    accessToken: null,
    user: null
  });

  // Check if user is already logged in
  useEffect(() => {
    const savedAuth = localStorage.getItem('airis_auth');
    if (savedAuth) {
      try {
        const parsedAuth = JSON.parse(savedAuth);
        if (parsedAuth.accessToken && parsedAuth.user) {
          setAuthState(parsedAuth);
          // Skip to final step if already authenticated
          setCurrentStep('final');
        }
      } catch (e) {
        console.error('Invalid auth data in localStorage:', e);
        localStorage.removeItem('airis_auth');
      }
    }
  }, []);

  // Auto advance splash screen
  useEffect(() => {
    if (currentStep === 'splash') {
      const timer = setTimeout(() => {
        setCurrentStep('welcome');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  // Auto advance final screen
  useEffect(() => {
    if (currentStep === 'final') {
      const timer = setTimeout(() => {
        onComplete();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, onComplete]);

  const saveAuthToStorage = useCallback((authData: Partial<AuthState>) => {
    const updatedAuth = { ...authState, ...authData };
    setAuthState(updatedAuth);
    localStorage.setItem('airis_auth', JSON.stringify(updatedAuth));
  }, [authState]);

  const signUp = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/sign_up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: authState.email,
          password: authState.password,
          firstName: authState.firstName,
          lastName: 'any', // Static value as requested
          role: 'user'
        }),
      });

      const data = await response.json();
      
      if (response.ok && Array.isArray(data) && data[0]?.success) {
        saveAuthToStorage({
          accessToken: data[0].data.access_token,
          user: data[0].data.user
        });
        // Go directly to final step
        setCurrentStep('final');
      } else if (response.ok && data.success) {
        saveAuthToStorage({
          accessToken: data.data.access_token,
          user: data.data.user
        });
        // Go directly to final step
        setCurrentStep('final');
      } else {
        // Handle different error response formats
        let errorMessage = 'Sign up failed';
        if (Array.isArray(data) && data[0]?.message) {
          errorMessage = data[0].message;
        } else if (data.message) {
          errorMessage = data.message;
        }
        setError(errorMessage);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Sign up error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/sign_in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: authState.email,
          password: authState.password,
        }),
      });

      const data = await response.json();
      
      if (response.ok && Array.isArray(data) && data[0]?.success) {
        const authData = {
          accessToken: data[0].data.access_token,
          user: data[0].data.user,
        };
        saveAuthToStorage(authData);
        // Go directly to final step
        setCurrentStep('final');
      } else {
        // Handle different error response formats
        let errorMessage = 'Sign in failed';
        if (Array.isArray(data) && data[0]?.message) {
          errorMessage = data[0].message;
        } else if (data.message) {
          errorMessage = data.message;
        }
        setError(errorMessage);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Sign in error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('airis_auth');
    setAuthState({
      isSignUp: true,
      firstName: '',
      email: '',
      password: '',
      accessToken: null,
      user: null
    });
    setCurrentStep('welcome');
    setError(null);
  }, []);

  const handleNext = useCallback(() => {
    if (isTransitioning || isLoading) return;
    
    setIsTransitioning(true);
    setError(null);
    
    // Handle step transitions
    const nextStep = (() => {
      switch (currentStep) {
        case 'splash':
          return 'welcome';
        case 'welcome':
          return 'firstname';
        case 'firstname':
          // Skip to email for sign in
          if (!authState.isSignUp) {
            return 'email';
          }
          return authState.firstName.trim() ? 'email' : currentStep;
        case 'email':
          return authState.email.trim() ? 'password' : currentStep;
        case 'password':
          // Skip share screen and go directly to final
          return 'final';
        case 'share':
          return 'final';
        default:
          return currentStep;
      }
    })();

    if (nextStep === currentStep) {
      setIsTransitioning(false);
      return;
    }

    // Handle auth on password step completion
    if (currentStep === 'password' && nextStep === 'final') {
      if (authState.isSignUp) {
        signUp();
      } else {
        signIn();
      }
      return;
    }

    setTimeout(() => {
      setCurrentStep(nextStep);
      setIsTransitioning(false);
    }, 300);
  }, [currentStep, authState, isTransitioning, isLoading, signUp, signIn]);

  const handlePrevious = useCallback(() => {
    if (isTransitioning || isLoading) return;
    
    setError(null);
    
    if (currentStep === 'firstname') {
      setCurrentStep('welcome');
    } else if (currentStep === 'email') {
      setCurrentStep('firstname');
    } else if (currentStep === 'password') {
      setCurrentStep('email');
    } else if (currentStep === 'share') {
      setCurrentStep('password');
    }
  }, [currentStep, isTransitioning, isLoading]);

  // Handle Enter key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && !isLoading) {
        event.preventDefault();
        handleNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleNext, isLoading]);

  const updateAuthState = (updates: Partial<AuthState>) => {
    setAuthState(prev => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'splash':
      case 'welcome':
        return true;
      case 'firstname':
        // Allow proceeding for sign in without name
        return !authState.isSignUp || authState.firstName.trim().length > 0;
      case 'email':
        return authState.email.trim().length > 0;
      case 'password':
        return authState.password.trim().length > 0;
      case 'share':
      case 'final':
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="w-full h-full relative">
      {/* Main white area */}
      <div 
        className="w-full relative bg-white/50 shadow-[0px_-6px_20px_0px_rgba(0,0,0,0.1)] backdrop-blur-[200px] rounded-lg overflow-hidden transition-all duration-500 ease-in-out"
        style={{
          height: ['firstname', 'email', 'password', 'share'].includes(currentStep) ? 'calc(100% - 50px)' : '100%'
        }}
      >
        {/* Main content area */}
        <div 
          className={`w-full h-full flex flex-col items-center justify-center transition-all duration-300 ease-in-out ${
            isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
        >
          <StepContent 
            currentStep={currentStep}
            authState={authState}
            updateAuthState={updateAuthState}
            isLoading={isLoading}
            error={error}
            setError={setError}
            setCurrentStep={setCurrentStep}
          />
        </div>
      </div>

      {/* Bottom buttons for auth steps */}
      {['firstname', 'email', 'password', 'share'].includes(currentStep) && (
        <AuthBottomButtons 
          onNext={handleNext}
          onPrevious={handlePrevious}
          canProceed={canProceed()}
          isLoading={isLoading}
          currentStep={currentStep}
          authState={authState}
          updateAuthState={updateAuthState}
          showPrevious={currentStep !== 'firstname'}
        />
      )}


    </div>
  );
}

// Step content component
interface StepContentProps {
  currentStep: AuthStep;
  authState: AuthState;
  updateAuthState: (updates: Partial<AuthState>) => void;
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  setCurrentStep: (step: AuthStep) => void;
}

function StepContent({ currentStep, authState, updateAuthState, isLoading, error, setError, setCurrentStep }: StepContentProps) {
  const handleToggleAuth = useCallback(() => {
    updateAuthState({ 
      isSignUp: !authState.isSignUp,
      firstName: '' // Clear name when switching to sign in
    });
    setError(null);
    // Go to appropriate step when toggling
    if (authState.isSignUp) {
      setCurrentStep('email');
    } else {
      setCurrentStep('firstname');
    }
  }, [authState.isSignUp, updateAuthState, setCurrentStep, setError]);

  switch (currentStep) {
    case 'splash':
      return <SplashContent />;
    case 'welcome':
      return <WelcomeContent />;
    case 'firstname':
      return (
        <FirstNameContent
          firstName={authState.firstName}
          onChange={(value) => updateAuthState({ firstName: value })}
          error={error}
          isSignUp={authState.isSignUp}
          onToggleAuth={handleToggleAuth}
        />
      );
    case 'email':
      return (
        <EmailContent
          email={authState.email}
          onChange={(value) => updateAuthState({ email: value })}
          error={error}
          isSignUp={authState.isSignUp}
          onToggleAuth={handleToggleAuth}
        />
      );
    case 'password':
      return (
        <PasswordContent
          password={authState.password}
          onChange={(value) => updateAuthState({ password: value })}
          error={error}
          isLoading={isLoading}
          isSignUp={authState.isSignUp}
          onToggleAuth={handleToggleAuth}
        />
      );
    case 'share':
      return <ShareContent authState={authState} />;
    case 'final':
      return <FinalContent />;
    default:
      return null;
  }
}

// Content components
function SplashContent() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <img 
        src="/airis-figure-1.png" 
        alt="Airis Angel" 
        className="w-auto h-[40%] -mt-16"
      />
    </div>
  );
}

function WelcomeContent() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="inline-flex flex-col justify-start items-center -space-y-3 -mt-16">
        <div className="self-stretch text-center justify-start text-black/10 text-base font-medium font-['Neue_Montreal']">Welcome to</div>
        <div 
          className="self-stretch text-center justify-start font-normal font-['Neue_Montreal']"
          style={{
            fontSize: 'clamp(60px, 12vh, 400px)',
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.01) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          Airis⁺
        </div>
      </div>
    </div>
  );
}



function FirstNameContent({ firstName, onChange, error, isSignUp, onToggleAuth }: { 
  firstName: string; 
  onChange: (value: string) => void; 
  error: string | null;
  isSignUp: boolean;
  onToggleAuth: () => void;
}) {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      {isSignUp && (
        <div className="flex-1 flex items-center justify-center">
          <input
            type="text"
            placeholder="User Name"
            value={firstName}
            onChange={(e) => onChange(e.target.value)}
            className="w-full text-center text-black/50 placeholder-black/10 capitalize text-3xl font-light bg-transparent border-none outline-none"
            style={{ fontSize: '32px' }}
            autoFocus
          />
        </div>
      )}
      
      {error && (
        <div className="text-red-500/70 text-sm font-light pb-4">
          {error}
        </div>
      )}

      {/* Bottom toggle button */}
      <div className="pb-[14px]">
        <button 
          onClick={onToggleAuth}
          className="text-xs text-black/30 text-center hover:text-black/40 transition-colors cursor-pointer"
        >
          {isSignUp ? 'I already have an account' : 'Create an account'}
        </button>
      </div>
    </div>
  );
}

function EmailContent({ 
  email, 
  onChange, 
  error, 
  isSignUp, 
  onToggleAuth 
}: { 
  email: string; 
  onChange: (value: string) => void; 
  error: string | null;
  isSignUp: boolean;
  onToggleAuth: () => void;
}) {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <div className="flex-1 flex items-center justify-center">
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-center text-black/50 placeholder-black/10 text-3xl font-light bg-transparent border-none outline-none"
          style={{ fontSize: '32px' }}
          autoFocus
        />
      </div>
      
      {error && (
        <div className="text-red-500/70 text-sm font-light pb-4">
          {error}
        </div>
      )}

      {/* Show toggle button only in sign in mode */}
      {!isSignUp && (
        <div className="pb-[14px]">
          <button 
            onClick={onToggleAuth}
            className="text-xs text-black/30 text-center hover:text-black/40 transition-colors cursor-pointer"
          >
            Back to sign up
          </button>
        </div>
      )}
    </div>
  );
}

function PasswordContent({ 
  password, 
  onChange, 
  error, 
  isLoading,
  isSignUp,
  onToggleAuth
}: { 
  password: string; 
  onChange: (value: string) => void; 
  error: string | null;
  isLoading: boolean;
  isSignUp: boolean;
  onToggleAuth: () => void;
}) {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <div className="flex-1 flex items-center justify-center">
        <input
          type="password"
          placeholder="Your password"
          value={password}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-center text-black/50 placeholder-black/10 text-3xl font-light bg-transparent border-none outline-none"
          style={{ fontSize: '32px' }}
          autoFocus
          disabled={isLoading}
        />
      </div>
      
      {error && (
        <div className="text-red-500/70 text-sm font-light pb-4">
          {error}
        </div>
      )}

      {/* Show toggle button only in sign in mode */}
      {!isSignUp && (
        <div className="pb-[14px]">
          <button 
            onClick={onToggleAuth}
            className="text-xs text-black/30 text-center hover:text-black/40 transition-colors cursor-pointer"
          >
            Back to sign up
          </button>
        </div>
      )}
      
      {isLoading && (
        <div className="flex items-center gap-2 pb-4">
          <div className="w-4 h-4 border-2 border-black/10 border-t-black/30 rounded-full animate-spin" />
          <span className="text-black/40 text-sm">Authenticating...</span>
        </div>
      )}
    </div>
  );
}

function ShareContent({ authState }: { authState: AuthState }) {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-light text-black/70 mb-4">
            Welcome, {authState.user?.firstName || authState.firstName}!
          </h1>
          <p className="text-base text-black/50 font-light mb-6">
            Your Airis is ready to help you
          </p>
          <div className="bg-black/5 rounded-lg p-4 text-sm text-black/40">
            Share your experience with friends and family
          </div>
        </div>
      </div>
    </div>
  );
}

function FinalContent() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-black/10 border-t-black/30 rounded-full animate-spin" />
        <span className="text-black/40 text-sm font-light">Preparing your Airis...</span>
      </div>
    </div>
  );
}

// Bottom buttons component
interface AuthBottomButtonsProps {
  onNext: () => void;
  onPrevious: () => void;
  canProceed: boolean;
  isLoading: boolean;
  currentStep: AuthStep;
  authState: AuthState;
  updateAuthState: (updates: Partial<AuthState>) => void;
  showPrevious: boolean;
}

function AuthBottomButtons({ 
  onNext, 
  onPrevious, 
  canProceed, 
  isLoading, 
  currentStep, 
  authState, 
  updateAuthState,
  showPrevious 
}: AuthBottomButtonsProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[40px] flex items-center justify-center px-2.5 gap-5">
      {/* Left corner icon */}
      <div className="w-8 h-8 hover:bg-black/[3.5%] rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105">
        {showPrevious ? (
          <button onClick={onPrevious} disabled={isLoading}>
            <span className="text-black/30 text-sm">←</span>
          </button>
        ) : (
          <span className="text-black/10 text-sm">←</span>
        )}
      </div>

      {/* Center area */}
      <div className="flex-1 flex items-center justify-center">
        {['firstname', 'email', 'password', 'share'].includes(currentStep) && canProceed && (
          <div 
            onClick={onNext}
            className="w-10 h-10 p-[2px] bg-black/5 rounded-[20px] inline-flex justify-center items-center gap-2.5 cursor-pointer transition-all duration-200 hover:scale-105"
          >
            <div className="w-8 h-8 px-2.5 py-2.5 bg-white/40 rounded-2xl shadow-[inset_0px_-8px_16px_0px_rgba(255,255,255,0.90)] flex justify-center items-center gap-2.5">
              <div className="text-center justify-start text-black/40 text-xs font-normal font-['Neue_Montreal']">
                {isLoading ? '...' : currentStep === 'share' ? 'Done' : 'Ok'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right corner icon */}
      <div className="w-8 h-8 hover:bg-black/[3.5%] rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105">
        <span className="text-black/30 text-sm">→</span>
      </div>
    </div>
  );
} 