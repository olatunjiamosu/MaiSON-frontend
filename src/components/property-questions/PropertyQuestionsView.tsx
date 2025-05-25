import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, CircularProgress, Button } from '@mui/material';
import { format } from 'date-fns';
import propertyQuestionsService, { PropertyQuestion } from '../../services/PropertyQuestionsService';
import { AskPropertyQuestion } from './AskPropertyQuestion';

interface PropertyQuestionsViewProps {
  propertyId: string;
  showAskQuestion?: boolean;
}

export const PropertyQuestionsView: React.FC<PropertyQuestionsViewProps> = ({
  propertyId,
  showAskQuestion = true,
}) => {
  const [questions, setQuestions] = useState<PropertyQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const fetchedQuestions = await propertyQuestionsService.getPropertyQuestions(propertyId);
      setQuestions(fetchedQuestions);
      setError(null);
    } catch (err) {
      console.error('Error fetching property questions:', err);
      setError('Failed to load questions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [propertyId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">{error}</Typography>
        <Button variant="contained" onClick={fetchQuestions} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Property Questions & Answers
      </Typography>

      {showAskQuestion && (
        <Box mb={4}>
          <AskPropertyQuestion
            propertyId={propertyId}
            onQuestionSubmitted={fetchQuestions}
          />
        </Box>
      )}

      {questions.length === 0 ? (
        <Typography variant="body1" textAlign="center" py={4}>
          No questions have been asked about this property yet.
        </Typography>
      ) : (
        questions.map((question) => (
          <Card key={question.id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="body1" gutterBottom>
                Q: {question.question_text}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Asked on {format(new Date(question.created_at), 'PPP')}
              </Typography>

              {question.status === 'answered' ? (
                <>
                  <Typography variant="body1" color="primary" sx={{ mt: 2 }}>
                    A: {question.answer_text}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Answered on {format(new Date(question.answered_at!), 'PPP')}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
                  Waiting for seller's response...
                </Typography>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
}; 