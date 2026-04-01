import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithRouter } from '../test/testUtils';
import SearchFilter from '../components/SearchFilter';
vi.mock('../services/api'); 

const onSearch = vi.fn();
const onFilterStatus = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

describe('SearchFilter', () => {
  it('renders the search input and status dropdown', () => {
    renderWithRouter(<SearchFilter onSearch={onSearch} onFilterStatus={onFilterStatus} />);

    expect(screen.getByPlaceholderText(/search tasks/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('calls onSearch with the typed value', () => {
    renderWithRouter(<SearchFilter onSearch={onSearch} onFilterStatus={onFilterStatus} />);

    fireEvent.change(screen.getByPlaceholderText(/search tasks/i), {
      target: { value: 'login' },
    });

    expect(onSearch).toHaveBeenCalledWith('login');
  });

  it('calls onFilterStatus when a status option is selected', () => {
    renderWithRouter(<SearchFilter onSearch={onSearch} onFilterStatus={onFilterStatus} />);

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'In Progress' },
    });

    expect(onFilterStatus).toHaveBeenCalledWith('In Progress');
  });

  it('has "All statuses" as the default option', () => {
    renderWithRouter(<SearchFilter onSearch={onSearch} onFilterStatus={onFilterStatus} />);

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('all');
  });

  it('contains options for all three statuses', () => {
    renderWithRouter(<SearchFilter onSearch={onSearch} onFilterStatus={onFilterStatus} />);

    expect(screen.getByRole('option', { name: /to do/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /in progress/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /done/i })).toBeInTheDocument();
  });
});
