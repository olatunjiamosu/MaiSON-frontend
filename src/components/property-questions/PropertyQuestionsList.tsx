import React, { useEffect, useState } from 'react';
import { PropertyQuestion } from '../../services/PropertyQuestionsService';
import propertyQuestionsService from '../../services/PropertyQuestionsService';
import { format } from 'date-fns';

interface PropertyQuestionsListProps {
  onAnswerSubmitted?: () => void;
}

export const PropertyQuestionsList: React.FC<PropertyQuestionsListProps> = ({ onAnswerSubmitted }) => {
  const [questions, setQuestions] = useState<PropertyQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'answered'>('pending');
  const [answerText, setAnswerText] = useState<{ [key: number]: string }>({});
  const [submitting, setSubmitting] = useState<{ [key: number]: boolean }>({});
  const [answerErrors, setAnswerErrors] = useState<{ [key: number]: string }>({});

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedQuestions = await propertyQuestionsService.getSellerQuestions(activeTab);
      setQuestions(fetchedQuestions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load questions. Please try again later.';
      setError(errorMessage);
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [activeTab]);

  const handleAnswerSubmit = async (questionId: number) => {
    if (!answerText[questionId]?.trim()) return;

    try {
      setSubmitting({ ...submitting, [questionId]: true });
      setAnswerErrors({ ...answerErrors, [questionId]: '' });

      await propertyQuestionsService.answerQuestion(questionId, answerText[questionId].trim());
      
      // Clear the answer text and refresh the questions
      setAnswerText({ ...answerText, [questionId]: '' });
      await fetchQuestions();
      onAnswerSubmitted?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit answer. Please try again.';
      setAnswerErrors({ ...answerErrors, [questionId]: errorMessage });
      console.error('Error submitting answer:', err);
    } finally {
      setSubmitting({ ...submitting, [questionId]: false });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  return (
    <div>
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

      {questions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {activeTab === 'pending'
            ? 'No pending questions to answer.'
            : 'No answered questions yet.'}
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <div key={question.id} className="bg-white rounded-lg border shadow-sm">
              <div className="p-6">
                <div className="text-sm text-gray-500 mb-2">
                  {question.property_address ? (
                    <span className="font-medium text-gray-900">
                      {question.property_address.street}, {question.property_address.city} {question.property_address.postcode}
                    </span>
                  ) : (
                    <span className="italic">Property address not available</span>
                  )}
                </div>
                <div className="text-gray-900 mb-2">
                  {question.question_text}
                </div>
                <div className="text-sm text-gray-500 mb-4">
                  Asked on {format(new Date(question.created_at), 'PPP')}
                </div>

                {question.status === 'answered' ? (
                  <>
                    <div className="mt-4 text-emerald-700 bg-emerald-50 p-4 rounded-lg">
                      <div className="font-medium mb-2">Answer:</div>
                      <div>{question.answer_text}</div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      Answered on {format(new Date(question.answered_at!), 'PPP')}
                    </div>
                  </>
                ) : (
                  <div className="mt-4">
                    <textarea
                      rows={3}
                      placeholder="Type your answer here..."
                      value={answerText[question.id] || ''}
                      onChange={(e) => setAnswerText({
                        ...answerText,
                        [question.id]: e.target.value
                      })}
                      disabled={submitting[question.id]}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                        answerErrors[question.id] ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {answerErrors[question.id] && (
                      <div className="mt-1 text-sm text-red-600">
                        {answerErrors[question.id]}
                      </div>
                    )}
                    <button
                      onClick={() => handleAnswerSubmit(question.id)}
                      disabled={!answerText[question.id]?.trim() || submitting[question.id]}
                      className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting[question.id] ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </div>
                      ) : (
                        'Submit Answer'
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 