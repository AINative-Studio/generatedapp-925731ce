import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminPanel from '../components/AdminPanel';

// Mock fetch globally
global.fetch = jest.fn();

describe('AdminPanel', () => {
  beforeEach(() => {
    global.fetch.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders admin panel container with correct testid', () => {
    render(<AdminPanel />);
    
    const container = screen.getByTestId('admin_panel-container');
    expect(container).toBeInTheDocument();
  });

  test('displays loading state while fetching data', async () => {
    global.fetch.mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ users: [], tasks: [] })
        }), 100)
      )
    );

    render(<AdminPanel />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  test('shows error message when API call fails', async () => {
    global.fetch.mockRejectedValue(new Error('Network error'));

    render(<AdminPanel />);
    
    await waitFor(() => {
      expect(screen.getByText('Error loading admin data')).toBeInTheDocument();
    });
  });

  test('renders admin controls and statistics correctly', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        users: [
          { id: 1, name: 'John Doe', email: 'john@example.com' },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
        ],
        tasks: [
          { id: 1, title: 'Task 1', status: 'completed' },
          { id: 2, title: 'Task 2', status: 'pending' }
        ]
      })
    });

    render(<AdminPanel />);
    
    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('Tasks')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
    });
  });

  test('handles user interaction for adding new user', async () => {
    const user = userEvent.setup();
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ users: [], tasks: [] })
    });

    render(<AdminPanel />);
    
    await waitFor(() => {
      expect(screen.getByText('Add New User')).toBeInTheDocument();
    });

    const addUserButton = screen.getByText('Add New User');
    await user.click(addUserButton);
    
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.ainative.studio/api/v1/admin/users',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'X-API-Key': expect.any(String)
        })
      })
    );
  });

  test('is accessible with proper ARIA attributes', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ users: [], tasks: [] })
    });

    render(<AdminPanel />);
    
    await waitFor(() => {
      const container = screen.getByTestId('admin_panel-container');
      expect(container).toHaveAttribute('role', 'main');
      expect(container).toHaveAttribute('aria-label', 'Admin Panel');
    });
  });
});