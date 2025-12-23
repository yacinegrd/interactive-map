import { NextRequest, NextResponse } from 'next/server';

// Sample data for testing
const SAMPLE_USERS = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: ['Admin', 'User', 'Moderator'][i % 3] as 'Admin' | 'User' | 'Moderator',
  status: ['Active', 'Inactive'][i % 2] as 'Active' | 'Inactive',
  createdAt: new Date(2024, Math.floor(i / 8), (i % 28) + 1).toISOString().split('T')[0],
  age: 20 + (i % 50),
}));

export type User = typeof SAMPLE_USERS[0];

interface SearchParams {
  page?: string;
  pageSize?: string;
  sortBy?: string;
  sortOrder?: string;
  search?: string;
  status?: string;
  role?: string;
  roles?: string;
  startDate?: string;
  endDate?: string;
  minAge?: string;
  maxAge?: string;
}

function parseSearchParams(searchParams: URLSearchParams): SearchParams {
  const params: SearchParams = {};

  console.log('Received search params:', Array.from(searchParams.entries()));
  
  for (const [key, value] of searchParams.entries()) {
    if (value) {
      (params as any)[key] = value;
    }
  }
  
  return params;
}

function filterUsers(users: User[], params: SearchParams): User[] {
  let filtered = [...users];

  // Text search (name or email)
  if (params.search) {
    const search = params.search.toLowerCase();
    filtered = filtered.filter(user => 
      user.name.toLowerCase().includes(search) || 
      user.email.toLowerCase().includes(search)
    );
  }

  // Status filter
  if (params.status) {
    filtered = filtered.filter(user => user.status === params.status);
  }

  // Single role filter
  if (params.role) {
    filtered = filtered.filter(user => user.role === params.role);
  }

  // Multi-select roles filter
  if (params.roles) {
    const selectedRoles = params.roles.split(',');
    filtered = filtered.filter(user => selectedRoles.includes(user.role));
  }

  // Date range filter
  if (params.startDate || params.endDate) {
    filtered = filtered.filter(user => {
      const userDate = new Date(user.createdAt);
      const start = params.startDate ? new Date(params.startDate) : null;
      const end = params.endDate ? new Date(params.endDate) : null;

      if (start && userDate < start) return false;
      if (end && userDate > end) return false;
      return true;
    });
  }

  // Age range filter
  if (params.minAge || params.maxAge) {
    filtered = filtered.filter(user => {
      const minAge = params.minAge ? parseInt(params.minAge) : 0;
      const maxAge = params.maxAge ? parseInt(params.maxAge) : 999;
      return user.age >= minAge && user.age <= maxAge;
    });
  }

  return filtered;
}

function sortUsers(users: User[], sortBy?: string, sortOrder?: string): User[] {
  if (!sortBy) return users;

  const sorted = [...users].sort((a, b) => {
    const aVal = (a as any)[sortBy];
    const bVal = (b as any)[sortBy];

    // Handle different data types
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return aVal.localeCompare(bVal);
    }
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return aVal - bVal;
    }

    // Date comparison
    if (sortBy === 'createdAt') {
      return new Date(aVal).getTime() - new Date(bVal).getTime();
    }

    return String(aVal).localeCompare(String(bVal));
  });

  return sortOrder === 'desc' ? sorted.reverse() : sorted;
}

export async function GET(request: NextRequest) {
  try {
    // Add artificial delay to simulate real API
    await new Promise(resolve => setTimeout(resolve, 300));

    const { searchParams } = new URL(request.url);
    const params = parseSearchParams(searchParams);
    
    const page = parseInt(params.page || '0');
    const pageSize = parseInt(params.pageSize || '10');

    // Filter users
    let filteredUsers = filterUsers(SAMPLE_USERS, params);
    
    // Sort users
    filteredUsers = sortUsers(filteredUsers, params.sortBy, params.sortOrder);

    // Calculate pagination
    const totalItems = filteredUsers.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = page * pageSize;
    const endIndex = startIndex + pageSize;
    
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    const response = {
      data: paginatedUsers,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages - 1,
        hasPreviousPage: page > 0,
      },
      filters: params,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in users API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: Add POST, PUT, DELETE methods for full CRUD operations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Add artificial delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newUser = {
      id: SAMPLE_USERS.length + 1,
      ...body,
      createdAt: new Date().toISOString().split('T')[0],
    };
    
    // In a real app, you would save to database here
    SAMPLE_USERS.push(newUser);
    
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 400 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    // Add artificial delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const userIndex = SAMPLE_USERS.findIndex(user => user.id === id);
    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    SAMPLE_USERS[userIndex] = { ...SAMPLE_USERS[userIndex], ...updateData };
    
    return NextResponse.json(SAMPLE_USERS[userIndex]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '0');
    
    // Add artificial delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const userIndex = SAMPLE_USERS.findIndex(user => user.id === id);
    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    SAMPLE_USERS.splice(userIndex, 1);
    
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 400 }
    );
  }
}