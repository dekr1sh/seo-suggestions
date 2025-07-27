import { useNavigate } from 'react-router-dom';

// Define the props interface for Header
export interface HeaderProps {
  isLoggedIn: boolean; // Add a prop to indicate if the user is logged in
  onLogout: () => void; // Add a prop for a logout handler passed from parent
}

// Update the function signature to accept props
export default function Header({ isLoggedIn, onLogout }: HeaderProps) {
  const navigate = useNavigate();

  // The handleLogout logic is now simplified as the actual logout action
  // (clearing token, redirecting) is passed from the parent via onLogout.
  // This makes the Header more reusable and decoupled from localStorage directly.
  const handleLocalLogout = () => {
    // Call the logout handler provided by the parent
    onLogout();
    // Navigate to login page. This part could also be handled by onLogout,
    // but keeping it here if onLogout only clears token.
    navigate('/login'); 
  };

  return (
    <header className='bg-gray-800 text-white p-4 flex justify-between items-center'> {/* Added items-center for vertical alignment */}
      <h1 className='text-xl font-semibold'>SEO Suggestion</h1>
      
      {/* Conditionally render the Logout button based on isLoggedIn prop */}
      {isLoggedIn && (
        <button onClick={handleLocalLogout} className='bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition-colors duration-200'> {/* Added hover effect */}
          Logout
        </button>
      )}
      {/* You could add a "Login" or "Register" button here if !isLoggedIn */}
    </header>
  );
}