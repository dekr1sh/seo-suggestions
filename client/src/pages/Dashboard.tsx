import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// REMOVED: import Header from '../components/Header'; // Ensure this line is gone
import Loader from '../components/Loader';
import { analyzeUrl, getHistory, deleteAnalysis } from '../services/api';
import type { Analysis, AnalysisHistoryItem } from '../types/analysis';

// --- REMOVED: DashboardProps interface is no longer needed ---
// As Dashboard no longer renders Header directly, it doesn't need to accept
// isLoggedIn or onLogout as props for that purpose.
// If Dashboard *itself* needed these for its own internal logic (e.g.,
// conditionally showing parts of the dashboard based on login status),
// you would keep DashboardProps and these props. But based on your code, it doesn't.

// Updated the Dashboard component signature
// It no longer accepts isLoggedIn or onLogout props.
export default function Dashboard() { // <--- Removed props here
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [deleteLoadingId, setDeleteLoadingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchUserHistory = async () => {
    setHistoryLoading(true);
    setError(null);
    try {
      const userHistory: AnalysisHistoryItem[] = await getHistory() as AnalysisHistoryItem[];
      setHistory(userHistory);
    } catch (err: unknown) {
      console.error('Error fetching history:', err);
      let errorMessage = 'Failed to load history.';
      if (err instanceof Error) { errorMessage = err.message; }
      setError(errorMessage);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchUserHistory();
  }, []);

  const handleAnalyze = async () => {
    setError(null);
    if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      setError('Please enter a valid URL starting with http:// or https://');
      return;
    }

    setLoading(true);
    try {
      const analysis: Analysis = await analyzeUrl(url) as Analysis;
      if (analysis?.id) {
        await fetchUserHistory();
        navigate(`/result/${analysis.id}`);
      } else {
        setError('Analysis failed: No ID returned.');
      }
    } catch (err: unknown) {
      console.error('Analysis failed in Dashboard:', err);
      let errorMessage = 'An unexpected error occurred during analysis. Please try again.';
      if (err instanceof Error) { errorMessage = err.message; }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleteLoadingId(id);
    setDeleteError(null);

    try {
      if (!window.confirm('Are you sure you want to delete this analysis?')) {
        return;
      }

      const deletedItem = await deleteAnalysis(id);
      if (deletedItem?.id) {
        setHistory(prevHistory => prevHistory.filter(item => item.id !== id));
      } else {
        setDeleteError('Deletion failed: No ID confirmed from server.');
      }
    } catch (err: unknown) {
      console.error('Error deleting analysis:', err);
      let errorMessage = 'Failed to delete analysis.';
      if (err instanceof Error) { errorMessage = err.message; }
      setDeleteError(errorMessage);
    } finally {
      setDeleteLoadingId(null);
    }
  };

  return (
    <div>
      {/* Header is now correctly rendered ONLY in App.tsx */}

      {/* URL Analysis Section */}
      <div className='p-4 max-w-xl mx-auto mt-10 bg-white shadow-md rounded-lg'>
        <h2 className='text-2xl font-semibold mb-4 text-gray-800 text-center'>Enter a URL for SEO Analysis</h2>
        {error && <p className='text-red-600 text-center mb-4'>{error}</p>}
        <input
          type='text'
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder='https://example.com'
          className='w-full border p-3 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
          required
        />
        <button
          onClick={handleAnalyze}
          className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors duration-200 w-full'
          disabled={loading}
        >
          {loading ? 'Analyzing...' : 'Analyze SEO'}
        </button>
        {loading && <Loader />}
      </div>

      {/* User History Section */}
      <div className='p-4 max-w-xl mx-auto mt-10 bg-white shadow-md rounded-lg'>
        <h3 className='text-xl font-semibold mb-4 text-gray-800 text-center'>Your Analysis History</h3>
        {deleteError && <p className='text-red-600 text-center mb-4'>{deleteError}</p>}
        {historyLoading ? (
          <Loader />
        ) : history.length === 0 ? (
          <p className='text-gray-600 text-center'>No analysis history yet. Analyze a URL above!</p>
        ) : (
          <ul className='space-y-2'>
            {history.map((item: AnalysisHistoryItem) => (
              <li key={item.id} className='flex justify-between items-center bg-gray-50 p-3 rounded border border-gray-200'>
                <span
                  className='text-blue-600 hover:underline cursor-pointer flex-grow mr-2'
                  onClick={() => navigate(`/result/${item.id}`)}
                >
                  {item.url} - {item.extractedTags?.title || 'No Title'}
                </span>
                <span className='text-sm text-gray-500 mr-2'>
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  className='bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600 transition-colors duration-200'
                  disabled={deleteLoadingId === item.id}
                >
                  {deleteLoadingId === item.id ? 'Deleting...' : 'Delete'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}