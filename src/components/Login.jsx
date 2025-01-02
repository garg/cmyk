import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import LoadingSpinner from './LoadingSpinner';

const Login = () => {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const submitButtonRef = useRef(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validation, setValidation] = useState({
    email: { isValid: true, message: '' },
    password: { isValid: true, message: '' }
  });
  const { login } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [shortcutsVisible, setShortcutsVisible] = useState(false);

  const toggleShortcuts = useCallback((e) => {
    if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') {
      return;
    }
    if (e.type === 'keydown') {
      e.preventDefault();
    }
    setShortcutsVisible(prev => !prev);
  }, []);

  // Auto-focus email input on mount
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  // Focus first invalid field after validation
  useEffect(() => {
    if (!validation.email.isValid) {
      emailRef.current?.focus();
    } else if (!validation.password.isValid) {
      passwordRef.current?.focus();
    }
  }, [validation.email.isValid, validation.password.isValid]);

  const handleKeyDown = (e, field) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (field === 'email') {
        passwordRef.current?.focus();
      } else if (field === 'password') {
        submitButtonRef.current?.click();
      }
    } else if (e.key === 'Escape') {
      // Clear input on escape
      if (field === 'email') {
        setEmail('');
        setValidation(prev => ({
          ...prev,
          email: { isValid: true, message: '' }
        }));
        emailRef.current?.focus();
      } else if (field === 'password') {
        setPassword('');
        setValidation(prev => ({
          ...prev,
          password: { isValid: true, message: '' }
        }));
        passwordRef.current?.focus();
      }
    }
  };

  // Handle tab order
  const handleTabKey = (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === emailRef.current) {
        e.preventDefault();
        submitButtonRef.current?.focus();
      } else if (!e.shiftKey && document.activeElement === submitButtonRef.current) {
        e.preventDefault();
        emailRef.current?.focus();
      }
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    setValidation(prev => ({
      ...prev,
      email: {
        isValid,
        message: isValid ? '' : 'Please enter a valid email address'
      }
    }));
    return isValid;
  };

  const validatePassword = (password) => {
    const isValid = password.length >= 6;
    setValidation(prev => ({
      ...prev,
      password: {
        isValid,
        message: isValid ? '' : 'Password must be at least 6 characters long'
      }
    }));
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      showToast('Please fix the validation errors', 'error');
      // Focus will be handled by the validation effect
      return;
    }

    setLoading(true);

    try {
      await login({ email, password });
      showToast('Logged in successfully!', 'success');
      navigate('/stage');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to log in', 'error');
      // Reset validation states on error
      setValidation({
        email: { isValid: true, message: '' },
        password: { isValid: true, message: '' }
      });
      // Focus email input on error
      emailRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form 
        onSubmit={handleSubmit} 
        aria-label="Login form"
        noValidate
        onKeyDown={handleTabKey}
      >
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            ref={emailRef}
            onKeyDown={(e) => handleKeyDown(e, 'email')}
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (validation.email.message) {
                validateEmail(e.target.value);
              }
            }}
            onBlur={() => validateEmail(email)}
            className={validation.email.message ? 'error' : email ? 'success' : ''}
            required
            disabled={loading}
            aria-label="Email address"
            aria-invalid={!validation.email.isValid}
            aria-describedby={validation.email.message ? "email-error" : undefined}
            autoComplete="email"
          />
          {validation.email.message && (
            <div 
              id="email-error" 
              className="input-error" 
              role="alert"
              aria-live="polite"
            >
              {validation.email.message}
            </div>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            ref={passwordRef}
            onKeyDown={(e) => handleKeyDown(e, 'password')}
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (validation.password.message) {
                validatePassword(e.target.value);
              }
            }}
            onBlur={() => validatePassword(password)}
            className={validation.password.message ? 'error' : password ? 'success' : ''}
            required
            disabled={loading}
            aria-label="Password"
            aria-invalid={!validation.password.isValid}
            aria-describedby={validation.password.message ? "password-error" : undefined}
            autoComplete="current-password"
          />
          {validation.password.message && (
            <div 
              id="password-error" 
              className="input-error" 
              role="alert"
              aria-live="polite"
            >
              {validation.password.message}
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          aria-label={loading ? 'Logging in...' : 'Login'}
          aria-busy={loading}
          ref={submitButtonRef}
        >
          {loading ? (
            <>
              <LoadingSpinner size={16} color="#fff" />
              <span>Logging in...</span>
            </>
          ) : (
            'Login'
          )}
        </button>
      </form>
      <p className="login-help-text" aria-live="polite">
        Don't have an account? Contact your administrator.
      </p>
      <button 
        className="shortcuts-toggle"
        onClick={toggleShortcuts}
        onKeyDown={toggleShortcuts}
        aria-expanded={shortcutsVisible}
        aria-controls="shortcuts-content"
        tabIndex={0}
      >
        {shortcutsVisible ? 'Hide Keyboard Shortcuts ▲' : 'Show Keyboard Shortcuts ▼'}
      </button>
      <div 
        id="shortcuts-content"
        className={`keyboard-shortcuts ${shortcutsVisible ? 'expanded' : 'collapsed'}`}
        aria-label="Keyboard shortcuts"
      >
        <div className="keyboard-shortcuts-content">
          <h3>Keyboard Shortcuts</h3>
          <ul className="shortcuts-list">
            <li>
              <span>Move to next field</span>
              <span>
                <kbd className="keyboard-key">Tab</kbd>
              </span>
            </li>
            <li>
              <span>Move to previous field</span>
              <span>
                <kbd className="keyboard-key">Shift</kbd>
                <span>+</span>
                <kbd className="keyboard-key">Tab</kbd>
              </span>
            </li>
            <li>
              <span>Clear current field</span>
              <span>
                <kbd className="keyboard-key">Esc</kbd>
              </span>
            </li>
            <li>
              <span>Submit form</span>
              <span>
                <kbd className="keyboard-key">Enter</kbd>
              </span>
            </li>
            <li>
              <span>Move to next field from email</span>
              <span>
                <kbd className="keyboard-key">Enter</kbd>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;
