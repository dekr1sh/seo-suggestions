import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// REMOVED: import Header from '../components/Header'; // No longer needed here
import Loader from '../components/Loader';
import { getAnalysis, getRecommendations } from '../services/api';
import type { Analysis, AISuggestions } from '../types/analysis';
// REMOVED: import type { HeaderProps } from '../components/Header'; // No longer needed here

// REMOVED: No need for HeaderProps in this component's signature anymore
export default function AnalysisResult() { // No props needed here
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const fetchAiSuggestions = useCallback(async (analysisId: number) => {
    setAiLoading(true);
    setAiError(null);
    try {
        const result: { message: string; analysisId: number; suggestions: AISuggestions } =
            await getRecommendations(analysisId) as { message: string; analysisId: number; suggestions: AISuggestions };
        
        setAnalysis(prevAnalysis => {
            if (prevAnalysis) {
                return {
                    ...prevAnalysis,
                    aiSuggestions: result.suggestions
                };
            }
            return null;
        });
    } catch (err: unknown) {
        console.error('Error fetching AI suggestions:', err);
        let errorMessage = 'Failed to get AI suggestions.';
        if (err instanceof Error) { errorMessage = err.message; }
        setAiError(errorMessage);
    } finally {
        setAiLoading(false);
    }
  }, [getRecommendations]);

  useEffect(() => {
    async function fetchAnalysisData() {
      if (!id) {
        setError('Analysis ID is missing from the URL. Redirecting to dashboard.');
        setLoading(false);
        navigate('/dashboard');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const analysisId = parseInt(id, 10);
        if (isNaN(analysisId)) {
          setError('Invalid Analysis ID format in URL. Redirecting to dashboard.');
          setLoading(false);
          navigate('/dashboard');
          return;
        }

        const data: Analysis = await getAnalysis(analysisId) as Analysis;
        setAnalysis(data);

        if (data && (!data.aiSuggestions || Object.keys(data.aiSuggestions).length === 0)) {
            fetchAiSuggestions(data.id);
        }

      } catch (err: unknown) {
        console.error('Error fetching analysis details:', err);
        let errorMessage = 'Failed to load analysis details.';
        if (err instanceof Error) { errorMessage = err.message; }
        setError(errorMessage);
        // Optional: Redirect to dashboard on critical fetch error
        // navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    }
    fetchAnalysisData();
  }, [id, fetchAiSuggestions, navigate]);


  return (
    <div>
      {/* REMOVED: <Header isLoggedIn={isLoggedIn} onLogout={onLogout} /> */} {/* Header is now rendered ONLY in App.tsx */}
      <div className='p-4 max-w-2xl mx-auto bg-white shadow-md rounded-lg mt-10'>
        <h2 className='text-2xl font-bold mb-4 text-gray-800 text-center'>Analysis Result</h2>

        {loading ? (
          <Loader />
        ) : error ? (
          <p className='text-red-600 text-center'>{error}</p>
        ) : !analysis ? (
          <p className='text-gray-600 text-center'>Analysis not found or could not be loaded.</p>
        ) : (
          <div>
            <p className='mb-2'><strong>URL:</strong> <a href={analysis.url} target='_blank' rel='noopener noreferrer' className='text-blue-600 hover:underline'>{analysis.url}</a></p>
            <p className='mb-2'><strong>Analyzed On:</strong> {new Date(analysis.createdAt).toLocaleDateString()}</p>

            <div className='mt-6 border-t pt-4'>
              <h3 className='font-semibold text-xl mb-2 text-gray-700'>Extracted SEO Tags:</h3>
              {analysis.extractedTags ? (
                <pre className='bg-gray-100 p-3 rounded text-sm overflow-auto max-h-60'>
                  {JSON.stringify(analysis.extractedTags, null, 2)}
                </pre>
              ) : (
                <p className='text-gray-600'>No extracted tags available.</p>
              )}
            </div>

            <div className='mt-6 border-t pt-4'>
              <h3 className='font-semibold text-xl mb-2 text-gray-700'>AI Suggestions:</h3>
              {aiLoading ? (
                <Loader />
              ) : aiError ? (
                <p className='text-red-600 text-center'>{aiError}</p>
              ) : analysis.aiSuggestions && Object.keys(analysis.aiSuggestions).length > 0 ? (
                <pre className='bg-gray-100 p-3 rounded text-sm overflow-auto max-h-60'>
                  {JSON.stringify(analysis.aiSuggestions, null, 2)}
                </pre>
              ) : (
                <p className='text-gray-600'>AI suggestions not yet generated.</p>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}