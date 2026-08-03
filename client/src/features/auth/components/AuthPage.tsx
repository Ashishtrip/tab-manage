import { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import ThemeToggle from '../../../components/ThemeToggle';
import { ArrowRight, Sparkles } from 'lucide-react';
import styles from '../styles/auth.module.css';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-page" style={pageStyle}>
      <div className="auth-header" style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
          <Sparkles size={20} color="var(--accent)" /> TabFlow
        </div>
        <ThemeToggle />
      </div>

      <div className="auth-container" style={containerStyle}>
        <div className="auth-card" style={cardStyle}>
          <div className={styles.header} style={{ marginBottom: '24px' }}>
            <h1 className={styles.title} style={titleStyle}>
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h1>
            <p className={styles.subtitle} style={subtitleStyle}>
              {isLogin
                ? 'Enter your details to access your workspace'
                : 'Sign up to start organizing your mind'}
            </p>
          </div>

          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            {isLogin ? <LoginForm /> : <SignupForm />}
          </div>

          <div className={styles.toggleContainer} style={toggleContainerStyle}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              className={styles.toggleButton}
              onClick={() => setIsLogin(!isLogin)}
              style={toggleButtonStyle}
            >
              {isLogin ? 'Sign up' : 'Log in'} <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column' as const,
  backgroundColor: 'var(--app-bg)',
  color: 'var(--text-primary)',
  transition: 'background-color 0.3s ease',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '24px 32px',
  width: '100%',
};

const containerStyle = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
};

const cardStyle = {
  backgroundColor: 'var(--panel-bg)',
  padding: '40px',
  width: '100%',
  maxWidth: '420px',
  borderRadius: '12px',
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
  border: '1px solid var(--border-color)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
};

const titleStyle = {
  fontSize: '24px',
  fontWeight: 600,
  marginBottom: '8px',
  letterSpacing: '-0.02em',
};

const subtitleStyle = {
  fontSize: '14px',
  color: 'var(--text-muted)',
};

const toggleContainerStyle = {
  marginTop: '24px',
  paddingTop: '24px',
  borderTop: '1px solid var(--border-color)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '8px',
  fontSize: '13px',
  color: 'var(--text-muted)',
};

const toggleButtonStyle = {
  background: 'none',
  border: 'none',
  color: 'var(--accent)',
  fontWeight: 500,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: 0,
};
