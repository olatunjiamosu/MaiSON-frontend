import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import ViewingsSection from '../pages/dashboard/buyer-sections/ViewingsSection';

describe('ViewingsSection', () => {
  const renderViewings = () => {
    return render(
      <BrowserRouter>
        <ViewingsSection />
      </BrowserRouter>
    );
  };

  it('renders upcoming and completed tabs', () => {
    renderViewings();
    expect(screen.getByRole('button', { name: 'Upcoming' })).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('switches between tabs', () => {
    renderViewings();
    const completedTab = screen.getByText('Completed');
    fireEvent.click(completedTab);
    expect(screen.getByText('Rate the Viewing')).toBeInTheDocument();
  });

  it('allows adding notes to completed viewings', () => {
    renderViewings();
    const completedTab = screen.getByText('Completed');
    fireEvent.click(completedTab);
    const editButton = screen.getByText('Edit Notes');
    fireEvent.click(editButton);
    expect(screen.getByPlaceholderText('Add your notes about the viewing...')).toBeInTheDocument();
  });
}); 