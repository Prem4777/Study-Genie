import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { SparklesIcon } from '../icons/Icons';
import * as authService from '../../services/authService';

interface LoginProps {
  onSwitchToSignup: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    const { error } = await authService.login(email, password);

    if (error) {
      setError(error.message);
      setIsLoading(false);
    }
    // On success, the onAuthStateChange listener in App.tsx will handle navigation.
  };

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
            <SparklesIcon className="w-12 h-12 text-crayon-blue mx-auto" />
            <h2 className="mt-6 text-3xl font-extrabold text-dark-gray dark:text-white">
                Sign in to your account
            </h2>
        </div>
        <Card>
            <form onSubmit={handleSubmit}>
                <Card.Content className="space-y-4">
                    <div>
                        <label htmlFor="email" className="sr-only">Email address</label>
                        <input
                            id="email"
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
                        <label htmlFor="password"className="sr-only">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 border border-light-gray rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-crayon-blue focus:outline-none"
                            placeholder="Password"
                            disabled={isLoading}
                        />
                    </div>

                     {error && <p className="text-sm text-crayon-red">{error}</p>}

                    <div>
                        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </Button>
                    </div>
                </Card.Content>
            </form>
        </Card>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <button onClick={onSwitchToSignup} className="font-medium text-crayon-blue hover:underline">
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;