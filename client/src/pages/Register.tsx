import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/api'; // Your updated API service
import Loader from '../components/Loader'; // Assuming you'll use your Loader component

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null); // State for error messages
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    setIsLoading(true); // Show loader

    try {
      const success = await register(email, password);
      if (success) {
        // You might want to show a success message here before navigating,
        // or just directly navigate. For simplicity, we navigate directly.
        navigate('/login');
      } else {
        // This 'else' block would typically be hit if `register` returns false,
        // but doesn't throw an error. Given api.ts now throws, this might not be reached.
        setError('Registration failed. Please try again.');
      }
    } catch (err: unknown) { // Catch errors thrown by api.ts
      console.error('Registration error in component:', err);
      // Type narrowing for the error message
      let errorMessage = 'An unexpected error occurred during registration. Please try again.';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false); // Hide loader regardless of success or failure
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <form onSubmit={handleSubmit} className='bg-white shadow-md p-6 rounded w-full max-w-md'>
        <h2 className='text-2xl mb-4 text-center font-bold text-gray-800'>Register</h2>

        {/* Display error message */}
        {error && (
          <p className='text-red-600 text-center mb-4 text-sm'>{error}</p>
        )}

        {/* Loading Spinner */}
        {isLoading && <Loader />}

        <input
          type='email'
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder='Email'
          className='w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 mb-4'
          required // Make email input required
        />
        <input
          type='password'
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder='Password'
          className='w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 mb-6'
          required // Make password input required
        />
        <button
          type='submit'
          className='bg-green-600 text-white w-full py-2 rounded hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50'
          disabled={isLoading} // Disable button while loading
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>

        {/* Link to Login Page */}
        <p className='text-center text-gray-600 text-sm mt-4'>
          Already have an account?{' '}
          <button
            type='button'
            onClick={() => navigate('/login')}
            className='text-green-600 hover:underline focus:outline-none'
          >
            Login here
          </button>
        </p>
      </form>
    </div>
  );
}