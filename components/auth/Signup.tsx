import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { SparklesIcon } from '../icons/Icons';
import * as authService from '../../services/authService';

interface SignupProps {
  onSwitchToLogin: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
    }
    setError(null);
    setIsLoading(true);
    
    const { error } = await authService.signup(name, email, password);

    setIsLoading(false); // Always stop loading after the request is done

    if (error) {
        setError(error.message);
    } else {
        setSuccessMessage("Account created successfully! Please check your email for a verification link to complete the signup.");
    }
  };

  if (successMessage) {
    return (
      <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
              <SparklesIcon className="w-12 h-12 text-crayon-blue mx-auto" />
              <h2 className="mt-6 text-3xl font-extrabold text-dark-gray dark:text-white">
                  Success! Check Your Email
              </h2>
          </div>
          <Card>
              <Card.Content className="text-center space-y-4">
                <p className="text-gray-600 dark:text-gray-300">{successMessage}</p>
                <Button onClick={onSwitchToLogin} className="w-full" size="lg">
                    Back to Login
                </Button>
              </Card.Content>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
            <SparklesIcon className="w-12 h-12 text-crayon-blue mx-auto" />
            <h2 className="mt-6 text-3xl font-extrabold text-dark-gray dark:text-white">
                Create your account
            </h2>
        </div>
        <Card>
            <form onSubmit={handleSubmit}>
                <Card.Content className="space-y-4">
                    <div>
                        <label htmlFor="name" className="sr-only">Full name</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3 border border-light-gray rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-crayon-blue focus:outline-none"
                            placeholder="Full name"
                            disabled={isLoading}
                        />
                    </div>
                     <div>
                        <label htmlFor="email-signup" className="sr-only">Email address</label>
                        <input
                            id="email-signup"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 border border-light-gray rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-crayon-blue focus:outline-none"
                            placeholder="Email address"
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label htmlFor="password-signup" className="sr-only">Password</label>
                        <input
                            id="password-signup"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 border border-light-gray rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-crayon-blue focus:outline-none"
                            placeholder="Password (min. 6 characters)"
                            disabled={isLoading}
                        />
                    </div>

                     {error && <p className="text-sm text-crayon-red">{error}</p>}

                    <div>
                        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                            {isLoading ? 'Creating account...' : 'Create Account'}
                        </Button>
                    </div>
                </Card.Content>
            </form>
        </Card>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <button onClick={onSwitchToLogin} className="font-medium text-crayon-blue hover:underline">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;