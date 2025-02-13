import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import SavedPropertiesSection from '../pages/dashboard/buyer-sections/SavedPropertiesSection';

// Mock the map component
jest.mock('../components/map/PropertyMap', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="mock-map">Map</div>,
  };
});

describe('SavedPropertiesSection', () => {
  const renderSaved = () => {
    return render(
      <BrowserRouter>
        <SavedPropertiesSection />
      </BrowserRouter>
    );
  };

  it('renders category filters', () => {
    renderSaved();
    expect(screen.getByText('All Saved Properties')).toBeInTheDocument();
    expect(screen.getByText('Must View')).toBeInTheDocument();
    expect(screen.getByText('Maybe')).toBeInTheDocument();
    expect(screen.getByText('Dream Home')).toBeInTheDocument();
  });

  it('allows category switching', () => {
    renderSaved();
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'must-view' } });
    expect(select).toHaveValue('must-view');
  });

  it('has working search functionality', () => {
    renderSaved();
    const searchInput = screen.getByPlaceholderText(
      'Search saved properties...'
    );
    fireEvent.change(searchInput, { target: { value: 'London' } });
    // Verify the search input value changed
    expect(searchInput).toHaveValue('London');
  });

  it('allows toggling between grid and list views', () => {
    renderSaved();
    const buttons = screen.getAllByRole('button');
    const listViewButton = buttons.find(button =>
      button.querySelector('.lucide-list')
    );
    if (!listViewButton) throw new Error('List view button not found');
    fireEvent.click(listViewButton);
    expect(listViewButton).toHaveClass('bg-emerald-50');
  });

  it('allows adding notes to properties', () => {
    renderSaved();
    const buttons = screen.getAllByRole('button');
    const editNotesButton = buttons.find(button =>
      button.querySelector('.lucide-pencil-line')
    );
    if (!editNotesButton) throw new Error('Edit notes button not found');
    fireEvent.click(editNotesButton);
    // Check for modal content directly
    expect(screen.getByText('Update Category')).toBeInTheDocument();
  });
});
