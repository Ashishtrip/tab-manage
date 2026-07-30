import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import styles from '../styles/auth.module.css';

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupForm() {
  const signup = useAuthStore((state: any) => state.signup);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsSubmitting(true);
    setGlobalError(null);
    try {
      await signup(data);
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Signup failed. Please try again.';
      setGlobalError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {globalError && (
        <div className={styles.globalError}>
          <AlertCircle size={16} />
          <span>{globalError}</span>
        </div>
      )}

      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
          placeholder="you@example.com"
          {...register('email')}
        />
        {errors.email && (
          <span className={styles.errorMessage}>
            <AlertCircle size={14} />
            {errors.email.message}
          </span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
          placeholder="••••••••"
          {...register('password')}
        />
        {errors.password && (
          <span className={styles.errorMessage}>
            <AlertCircle size={14} />
            {errors.password.message}
          </span>
        )}
      </div>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 size={16} className={styles.spinner} />
            Creating account...
          </>
        ) : (
          'Sign Up'
        )}
      </button>
    </form>
  );
}
