import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api.ts';

// Define props interface for Login
interface LoginProps {
  setIsLoggedIn: (value: boolean) => void; // Function to update parent's login state
}

// Update component signature to accept props
export default function Login({ setIsLoggedIn }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const token = await login(email, password);
      if (token) {
        localStorage.setItem('token', token);
        setIsLoggedIn(true); // <-- NEW: Update parent's login state
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      let errorMessage = 'An unexpected error occurred during login. Please try again.';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      console.error('Login error in component:', err);
      setError(errorMessage);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <form onSubmit={handleSubmit} className='bg-white shadow-md p-6 rounded w-full max-w-md'>
        <h2 className='text-2xl mb-4 text-center font-bold text-gray-800'>Login</h2>
        {error && (
          <p className='text-red-600 text-center mb-4 text-sm'>{error}</p>
        )}
        <input type='email' value={email} onChange={e => setEmail(e.target.value)} placeholder='Email' className='w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4' required />
        <input type='password' value={password} onChange={e => setPassword(e.target.value)} placeholder='Password' className='w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6' required />
        <button type='submit' className='bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'>Login</button>
        <p className='text-center text-gray-600 text-sm mt-4'>
          Don't have an account?{' '}
          <button type='button' onClick={() => navigate('/register')} className='text-blue-600 hover:underline focus:outline-none'>
            Register here
          </button>
        </p>
      </form>
    </div>
  );
}