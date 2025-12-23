# DataTable Component Documentation

The DataTable component is a powerful, feature-rich table component built with React Table (TanStack Table) and styled with shadcn/ui components. It provides advanced functionality including sorting, filtering, pagination, row selection, and bulk actions.

## Features

- ✅ **Sortable Columns** - Click column headers to sort data
- ✅ **Advanced Filtering** - Text, select, multi-select, date range, and number filters
- ✅ **Pagination** - Navigate through large datasets efficiently
- ✅ **Row Selection** - Select individual or all rows with checkboxes
- ✅ **Column Visibility** - Show/hide columns dynamically
- ✅ **Bulk Actions** - Perform actions on selected rows
- ✅ **Responsive Design** - Works on all screen sizes
- ✅ **Empty State** - Beautiful no-results display
- ✅ **TypeScript Support** - Fully typed interfaces

## Installation

Ensure you have the following dependencies installed:

```bash
npm install @tanstack/react-table lucide-react date-fns react-day-picker
```

The component also requires these shadcn/ui components:
- Button
- Input
- Table
- Card
- Select
- DropdownMenu
- Checkbox
- Popover
- Calendar

## Basic Usage

### Import the Component

```tsx
import DataTable from '@/components/DataTable';
import type { ColumnDef } from '@tanstack/react-table';
```

### Define Your Data Type

```tsx
type User = {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'User' | 'Moderator';
  status: 'Active' | 'Inactive';
  createdAt: string;
};
```

### Define Columns

```tsx
const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <span className={`px-2 py-1 rounded-full text-xs ${
          status === 'Active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {status}
        </span>
      );
    },
  }
];
```

### Render the DataTable

```tsx
export function UsersTable() {
  const data: User[] = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "Admin",
      status: "Active",
      createdAt: "2024-01-15"
    },
    // ... more data
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
    />
  );
}
```

## Props Interface

```tsx
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];     // Required: Column definitions
  data: TData[];                            // Required: Array of data
  filters?: FilterConfig[];                 // Optional: Filter configurations
  enableRowSelection?: boolean;             // Optional: Enable row selection (default: false)
  enableColumnVisibility?: boolean;        // Optional: Enable column visibility toggle (default: true)
  enablePagination?: boolean;              // Optional: Enable pagination (default: true)
  actionButtons?: ActionButton<TData>[];    // Optional: Bulk action buttons
}
```

## Advanced Features

### 1. Sortable Columns

Create sortable columns by adding sort functionality to headers:

```tsx
{
  accessorKey: "email",
  header: ({ column }) => (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      Email
      {column.getIsSorted() === "asc" ? (
        <ArrowUp className="ml-2 h-4 w-4" />
      ) : column.getIsSorted() === "desc" ? (
        <ArrowDown className="ml-2 h-4 w-4" />
      ) : null}
    </Button>
  ),
}
```

### 2. Filters Configuration

#### Text Filter
```tsx
const filters: FilterConfig[] = [
  {
    columnId: "name",
    type: "text",
    placeholder: "Search by name...",
  }
];
```

#### Select Filter
```tsx
{
  columnId: "status",
  type: "select",
  label: "Status",
  options: [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
  ],
}
```

#### Multi-Select Filter
```tsx
{
  columnId: "role",
  type: "multiSelect",
  label: "Role",
  options: [
    { value: "Admin", label: "Admin" },
    { value: "User", label: "User" },
    { value: "Moderator", label: "Moderator" },
  ],
}
```

#### Date Range Filter
```tsx
{
  columnId: "createdAt",
  type: "dateRange",
  label: "Created Date",
}
```

#### Number Filter
```tsx
{
  columnId: "age",
  type: "number",
  placeholder: "Filter by age...",
}
```

### 3. Action Buttons

Define bulk action buttons that work with selected rows:

```tsx
import { Trash2, Download, Mail } from 'lucide-react';

const actionButtons: ActionButton<User>[] = [
  {
    label: "Delete",
    variant: "destructive",
    icon: <Trash2 className="h-4 w-4" />,
    onClick: (selectedRows) => {
      console.log("Deleting users:", selectedRows);
      // Implement delete logic
    },
    disabled: (selectedRows) => selectedRows.length === 0,
  },
  {
    label: "Export",
    variant: "outline",
    icon: <Download className="h-4 w-4" />,
    onClick: (selectedRows) => {
      const csvData = convertToCSV(selectedRows);
      downloadCSV(csvData, 'users.csv');
    },
  },
  {
    label: "Send Email",
    variant: "default",
    icon: <Mail className="h-4 w-4" />,
    onClick: (selectedRows) => {
      const emails = selectedRows.map(user => user.email);
      openEmailClient(emails);
    },
  },
];
```

### 4. Custom Cell Renderers

Create custom cell renderers for complex data display:

```tsx
// Status Badge
{
  accessorKey: "status",
  header: "Status",
  cell: ({ row }) => {
    const status = row.getValue("status") as string;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        status === 'Active' 
          ? 'bg-green-100 text-green-800 border border-green-200' 
          : 'bg-red-100 text-red-800 border border-red-200'
      }`}>
        {status}
      </span>
    );
  },
}

// Formatted Date
{
  accessorKey: "createdAt",
  header: "Created At",
  cell: ({ row }) => {
    const date = new Date(row.getValue("createdAt"));
    return <div>{format(date, "MMM dd, yyyy")}</div>;
  },
}

// Avatar with Name
{
  accessorKey: "name",
  header: "User",
  cell: ({ row }) => {
    const user = row.original;
    return (
      <div className="flex items-center space-x-3">
        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-sm font-medium text-gray-600">
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <div className="font-medium">{user.name}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      </div>
    );
  },
}
```

### 5. Action Column with Dropdown Menu

Add an actions column with a dropdown menu:

```tsx
{
  id: "actions",
  header: "Actions",
  cell: ({ row }) => {
    const user = row.original;
    
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => editUser(user.id)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => deleteUser(user.id)}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
}
```

## Complete Example

```tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import DataTable from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Trash2, 
  Download, 
  Mail, 
  MoreHorizontal, 
  Edit, 
  ArrowDown 
} from "lucide-react";
import { format } from "date-fns";
import type { ActionButton, FilterConfig } from "@/components/DataTable";

type User = {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "User" | "Moderator";
  status: "Active" | "Inactive";
  createdAt: string;
};

const users: User[] = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "Admin",
    status: "Active",
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    name: "Bob Smith",
    email: "bob@example.com",
    role: "User",
    status: "Inactive",
    createdAt: "2024-02-20",
  },
  // ... more users
];

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Email
        {column.getIsSorted() === "asc" ? (
          <ArrowDown className="ml-2 h-4 w-4 rotate-180" />
        ) : column.getIsSorted() === "desc" ? (
          <ArrowDown className="ml-2 h-4 w-4" />
        ) : null}
      </Button>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          status === 'Active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <div>{format(date, "MMM dd, yyyy")}</div>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const user = row.original;
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => console.log('Edit', user)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => console.log('Delete', user)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function UsersTable() {
  const actionButtons: ActionButton<User>[] = [
    {
      label: "Delete Selected",
      variant: "destructive",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (selectedRows) => {
        console.log("Delete users:", selectedRows);
        // Implement bulk delete
      },
      disabled: (selectedRows) => selectedRows.length === 0,
    },
    {
      label: "Export",
      variant: "outline",
      icon: <Download className="h-4 w-4" />,
      onClick: (selectedRows) => {
        console.log("Export users:", selectedRows);
        // Implement export functionality
      },
    },
    {
      label: "Send Email",
      variant: "default",
      icon: <Mail className="h-4 w-4" />,
      onClick: (selectedRows) => {
        const emails = selectedRows.map(user => user.email);
        console.log("Send email to:", emails);
        // Implement email functionality
      },
    },
  ];

  const filters: FilterConfig[] = [
    {
      columnId: "name",
      type: "text",
      placeholder: "Search by name...",
    },
    {
      columnId: "status",
      type: "select",
      label: "Status",
      options: [
        { value: "Active", label: "Active" },
        { value: "Inactive", label: "Inactive" },
      ],
    },
    {
      columnId: "role",
      type: "multiSelect",
      label: "Role",
      options: [
        { value: "Admin", label: "Admin" },
        { value: "User", label: "User" },
        { value: "Moderator", label: "Moderator" },
      ],
    },
    {
      columnId: "createdAt",
      type: "dateRange",
      label: "Created Date",
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <DataTable
        columns={columns}
        data={users}
        filters={filters}
        actionButtons={actionButtons}
        enableRowSelection={true}
        enableColumnVisibility={true}
        enablePagination={true}
      />
    </div>
  );
}
```

## Type Definitions

```tsx
// Filter configuration for different filter types
interface FilterConfig {
  columnId: string;                           // Column identifier
  type: "text" | "select" | "multiSelect" | "dateRange" | "number";
  placeholder?: string;                       // Placeholder text
  options?: { label: string; value: string }[]; // Options for select/multiSelect
  label?: string;                            // Display label
}

// Action button configuration
interface ActionButton<TData> {
  label: string;                             // Button text
  onClick: (selectedRows: TData[]) => void;  // Click handler
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  icon?: React.ReactNode;                    // Optional icon
  disabled?: (selectedRows: TData[]) => boolean; // Conditional disable
}
```

## Styling and Customization

The DataTable component uses Tailwind CSS classes and can be customized by:

1. **Modifying the component styles** - Edit the CSS classes in the component
2. **Custom cell renderers** - Create custom cell components for specific columns
3. **Theme customization** - Adjust the shadcn/ui theme configuration
4. **CSS variables** - Modify CSS custom properties for colors and spacing

## Performance Tips

1. **Memoize column definitions** - Use `useMemo` for column definitions to prevent re-renders
2. **Optimize data structure** - Keep data flat and avoid deep nesting
3. **Virtualization** - For very large datasets (1000+ rows), consider implementing virtualization
4. **Debounced filtering** - Add debouncing for text filters on large datasets

## Accessibility

The component includes:
- Proper ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- Semantic HTML structure

## Server-Side Operations

The DataTable component supports server-side pagination, filtering, and sorting for handling large datasets efficiently.

### Server-Side Configuration

```tsx
interface ServerSideConfig {
  enabled: boolean;                                    // Enable server-side mode
  pageCount: number;                                  // Total number of pages from server
  loading?: boolean;                                  // Loading state
  onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
  manualPagination?: boolean;                         // Disable client-side pagination (default: true when enabled)
  manualSorting?: boolean;                           // Disable client-side sorting (default: true when enabled) 
  manualFiltering?: boolean;                         // Disable client-side filtering (default: true when enabled)
}
```

### Server-Side Example

#### 1. Create an API Route

Create an API route that handles server-side operations at `src/app/api/users/route.ts`:

```tsx
import { NextRequest, NextResponse } from 'next/server';

// Sample data
const SAMPLE_USERS = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: ['Admin', 'User', 'Moderator'][i % 3],
  status: ['Active', 'Inactive'][i % 2],
  createdAt: new Date(2024, Math.floor(i / 8), (i % 28) + 1).toISOString().split('T')[0],
}));

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const page = parseInt(searchParams.get('page') || '0');
  const pageSize = parseInt(searchParams.get('pageSize') || '10');
  const sortBy = searchParams.get('sortBy');
  const sortOrder = searchParams.get('sortOrder');
  const search = searchParams.get('search');
  const status = searchParams.get('status');
  const roles = searchParams.get('roles');

  // Filter data
  let filtered = SAMPLE_USERS;
  
  if (search) {
    filtered = filtered.filter(user => 
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  if (status) {
    filtered = filtered.filter(user => user.status === status);
  }
  
  if (roles) {
    const selectedRoles = roles.split(',');
    filtered = filtered.filter(user => selectedRoles.includes(user.role));
  }

  // Sort data
  if (sortBy) {
    filtered.sort((a, b) => {
      const aVal = (a as any)[sortBy];
      const bVal = (b as any)[sortBy];
      const result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortOrder === 'desc' ? -result : result;
    });
  }

  // Paginate data
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = page * pageSize;
  const paginatedUsers = filtered.slice(startIndex, startIndex + pageSize);

  return NextResponse.json({
    data: paginatedUsers,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages - 1,
      hasPreviousPage: page > 0,
    }
  });
}
```

#### 2. Create the Server-Side Component

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { ColumnDef, SortingState, ColumnFiltersState } from "@tanstack/react-table";
import DataTable from "@/components/DataTable";
import type { FilterConfig } from "@/components/DataTable";

type User = {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "User" | "Moderator";
  status: "Active" | "Inactive";
  createdAt: string;
};

export default function ServerSideTable() {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch data function
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.pageIndex.toString(),
        pageSize: pagination.pageSize.toString(),
      });

      // Add sorting
      if (sorting.length > 0) {
        const sort = sorting[0];
        params.append('sortBy', sort.id);
        params.append('sortOrder', sort.desc ? 'desc' : 'asc');
      }

      // Add filters
      columnFilters.forEach((filter) => {
        if (filter.value) {
          if (Array.isArray(filter.value)) {
            params.append(`${filter.id}s`, filter.value.join(','));
          } else {
            params.append(filter.id, filter.value as string);
          }
        }
      });

      const response = await fetch(`/api/users?${params.toString()}`);
      const result = await response.json();
      
      setData(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination, sorting, columnFilters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "email", 
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Role",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
  ];

  const filters: FilterConfig[] = [
    {
      columnId: "name",
      type: "text",
      placeholder: "Search users...",
    },
    {
      columnId: "status",
      type: "select",
      label: "Status",
      options: [
        { value: "Active", label: "Active" },
        { value: "Inactive", label: "Inactive" },
      ],
    },
    {
      columnId: "role",
      type: "multiSelect",
      label: "Role",
      options: [
        { value: "Admin", label: "Admin" },
        { value: "User", label: "User" },
        { value: "Moderator", label: "Moderator" },
      ],
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Server-Side Table</h1>
      <DataTable
        columns={columns}
        data={data}
        filters={filters}
        enableRowSelection={true}
        enableColumnVisibility={true}
        enablePagination={true}
        serverSide={{
          enabled: true,
          loading,
          pageCount: totalPages,
          onPaginationChange: setPagination,
          onSortingChange: setSorting,
          onColumnFiltersChange: setColumnFilters,
        }}
      />
    </div>
  );
}
```

### Server-Side Features

1. **Loading States** - Shows skeleton loaders while data is being fetched
2. **Debounced Filtering** - Filters are applied on the server with automatic debouncing
3. **Server-Side Sorting** - Click column headers to sort data on the server
4. **Server-Side Pagination** - Navigate through large datasets efficiently
5. **Parameter Management** - URL parameters are automatically managed for deep linking

### Best Practices for Server-Side Operations

1. **Add Loading States** - Always show loading indicators during API calls
2. **Error Handling** - Implement proper error handling for failed requests
3. **Debouncing** - Debounce filter inputs to avoid excessive API calls
4. **URL State Management** - Consider syncing table state with URL parameters
5. **Caching** - Implement appropriate caching strategies for better performance
6. **Real-time Updates** - Use WebSockets or polling for real-time data updates

### Advanced Server-Side Configuration

```tsx
// Custom debounce for filters
const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// In your component
const debouncedFilters = useDebounce(columnFilters, 300);

useEffect(() => {
  fetchData();
}, [pagination, sorting, debouncedFilters]); // Use debounced filters
```

### API Response Format

Your API should return data in this format:

```tsx
interface ApiResponse<T> {
  data: T[];                    // Array of items for current page
  pagination: {
    page: number;              // Current page index (0-based)
    pageSize: number;          // Items per page
    totalItems: number;        // Total number of items
    totalPages: number;        // Total number of pages
    hasNextPage: boolean;      // Whether there's a next page
    hasPreviousPage: boolean;  // Whether there's a previous page
  };
  filters?: any;              // Applied filters (optional)
  sorting?: any;              // Applied sorting (optional)
}
```

## Browser Support

The DataTable component supports all modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

This DataTable component provides a robust foundation for displaying and managing tabular data in your React applications. With both client-side and server-side capabilities, it can handle datasets of any size efficiently. Customize it according to your specific needs and design requirements.