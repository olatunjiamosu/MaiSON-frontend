import React, { useState } from 'react';
import propertyQuestionsService from '../../services/PropertyQuestionsService';

interface AskPropertyQuestionProps {
  propertyId: string;
  onQuestionSubmitted?: () => void;
}

export const AskPropertyQuestion: React.FC<AskPropertyQuestionProps> = ({
  propertyId,
  onQuestionSubmitted,
}) => {
  const [questionText, setQuestionText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!questionText.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      
      await propertyQuestionsService.submitQuestion({
        property_id: propertyId,
        question_text: questionText.trim(),
      });

      setQuestionText('');
      onQuestionSubmitted?.();
    } catch (err) {
      console.error('Error submitting question:', err);
      setError('Failed to submit your question. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        Ask the Seller a Question
      </h3>
      
      <div>
        <textarea
          rows={3}
          placeholder="Type your question about this property..."
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          disabled={submitting}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
            error ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {error && (
          <div className="mt-1 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>
      
      <button
        type="submit"
        disabled={!questionText.trim() || submitting}
        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Submitting...
          </div>
        ) : (
          'Submit Question'
        )}
      </button>
    </form>
  );
}; 