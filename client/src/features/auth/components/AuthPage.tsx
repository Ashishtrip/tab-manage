import { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import styles from '../styles/auth.module.css';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className={styles.header}>
          <h1 className={styles.title}>{isLogin ? 'Welcome back' : 'Create an account'}</h1>
          <p className={styles.subtitle}>
            {isLogin
              ? 'Enter your details to access your account'
              : 'Sign up to start managing your tabs'}
          </p>
        </div>

        {isLogin ? <LoginForm /> : <SignupForm />}

        <div className={styles.toggleContainer}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            className={styles.toggleButton}
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </div>
    </div>
  );
}
