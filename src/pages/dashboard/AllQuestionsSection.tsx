import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut, RefreshCw, HelpCircle, Eye, Search, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import propertyQuestionsService from '../../services/PropertyQuestionsService';
import { format } from 'date-fns';

const AllQuestionsSection: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'answered'>('pending');
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedQuestions = await propertyQuestionsService.getSellerQuestions(activeTab);
      setQuestions(fetchedQuestions);
    } catch (err) {
      if (err instanceof Error && err.message === 'User not authenticated') {
        navigate('/login');
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load questions. Please try again later.';
        setError(errorMessage);
        console.error('Error fetching questions:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [activeTab]);

  const filteredQuestions = questions.filter(question =>
    question.question_text?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
        <HelpCircle className="h-6 w-6 text-blue-600" />
      </div>
      <p className="text-gray-600 mb-1">No Questions Found</p>
      <p className="text-sm text-gray-500">
        {searchTerm 
          ? 'No questions match your search criteria.' 
          : activeTab === 'pending'
            ? 'You have no pending questions to answer.'
            : 'You have no answered questions yet.'}
      </p>
      {searchTerm && (
        <button
          onClick={() => setSearchTerm('')}
          className="mt-4 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
        >
          Clear Search
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">All Property Questions</h2>
          <p className="text-gray-500">View and manage questions from all your properties</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="text-gray-600 hover:text-gray-900"
            onClick={() => navigate('/')}
          >
            <Home className="h-6 w-6" />
          </button>
          <button
            className="text-gray-600 hover:text-gray-900"
            onClick={handleLogout}
          >
            <LogOut className="h-6 w-6" />
          </button>
          <button
            className="text-gray-600 hover:text-gray-900 disabled:text-gray-300"
            onClick={fetchQuestions}
          >
            <RefreshCw className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {/* Search and Filters */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('pending')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pending'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pending Questions
              </button>
              <button
                onClick={() => setActiveTab('answered')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'answered'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Answered Questions
              </button>
            </nav>
          </div>

          {/* Questions List */}
          {loading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-4"></div>
                <p className="text-gray-500">Loading questions...</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-4">
              <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
                {error}
              </div>
              <button
                onClick={fetchQuestions}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Retry
              </button>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((question) => (
                <div key={question.id} className="border rounded-lg hover:shadow-sm transition-shadow">
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <HelpCircle className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-500 mb-2">
                          {question.property_address ? (
                            <span className="font-medium text-gray-900">
                              {question.property_address.street}, {question.property_address.city} {question.property_address.postcode}
                            </span>
                          ) : (
                            <span className="italic">Property address not available</span>
                          )}
                        </div>
                        <h3 className="font-medium text-gray-900 mb-1">
                          {question.question_text}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            question.status === 'answered' 
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {question.status === 'answered' ? 'Answered' : 'Pending'}
                          </span>
                          <span className="text-sm text-gray-500">
                            {format(new Date(question.created_at), 'PPP')}
                          </span>
                        </div>
                        {question.answer_text && (
                          <div className="mt-2 text-gray-600 bg-gray-50 p-3 rounded">
                            <p className="font-medium text-sm text-gray-900 mb-1">Your Answer:</p>
                            {question.answer_text}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => navigate(`/dashboard/seller/property/${question.property_id}/questions`)}
                        className="flex-shrink-0 text-emerald-600 hover:text-emerald-700"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllQuestionsSection; 