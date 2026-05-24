import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from '../components/Dashboard';

// Mock fetch globally
global.fetch = jest.fn();

describe('Dashboard Component', () => {
  beforeEach(() => {
    global.fetch.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders dashboard container with correct testid', () => {
    render(<Dashboard />);
    
    const dashboardContainer = screen.getByTestId('dashboard-container');
    expect(dashboardContainer).toBeInTheDocument();
  });

  test('displays loading state while fetching data', () => {
    global.fetch.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ tasks: [], analytics: {} })
      }), 1000))
    );
    
    render(<Dashboard />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders dashboard content after successful data fetch', async () => {
    const mockTasks = [
      { id: 1, title: 'Task 1', status: 'completed' },
      { id: 2, title: 'Task 2', status: 'pending' }
    ];
    
    const mockAnalytics = {
      totalTasks: 2,
      completedTasks: 1,
      teamMembers: 5
    };
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ tasks: mockTasks, analytics: mockAnalytics })
    });
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
      expect(screen.getByText('Total Tasks: 2')).toBeInTheDocument();
    });
  });

  test('handles API error gracefully', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Error loading dashboard data')).toBeInTheDocument();
    });
  });

  test('handles empty task list correctly', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ tasks: [], analytics: { totalTasks: 0 } })
    });
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('No tasks available')).toBeInTheDocument();
    });
  });

  test('is accessible with proper ARIA attributes', async () => {
    const mockTasks = [{ id: 1, title: 'Test Task', status: 'pending' }];
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ tasks: mockTasks, analytics: {} })
    });
    
    render(<Dashboard />);
    
    await waitFor(() => {
      const dashboardContainer = screen.getByTestId('dashboard-container');
      expect(dashboardContainer).toHaveAttribute('role', 'main');
      expect(dashboardContainer).toHaveAttribute('aria-label', 'Dashboard');
    });
  });
});