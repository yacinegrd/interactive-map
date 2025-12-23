"use client";

import { useState, useEffect, useCallback } from "react";
import { ColumnDef, SortingState, ColumnFiltersState } from "@tanstack/react-table";
import DataTable from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Trash2, Download, Mail, MoreHorizontal, Edit, ArrowDown } from "lucide-react";
import { format } from "date-fns";
import type { ActionButton, FilterConfig } from "@/components/DataTable";

// Import the User type from our API route
type User = {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "User" | "Moderator";
  status: "Active" | "Inactive";
  createdAt: string;
  age: number;
};

interface ApiResponse {
  data: User[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  filters: any;
}

export default function ServerSideUsersTable() {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch data function
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.pageIndex.toString(),
        pageSize: pagination.pageSize.toString(),
      });

      // Add sorting parameters
      if (sorting.length > 0) {
        const sort = sorting[0];
        params.append('sortBy', sort.id);
        params.append('sortOrder', sort.desc ? 'desc' : 'asc');
      }

      // Add filter parameters
      columnFilters.forEach((filter) => {
        if (filter.value) {
          // Handle different filter types
          if (Array.isArray(filter.value)) {
            // Multi-select filter (e.g., roles)
            params.append(`${filter.id}s`, filter.value.join(','));
          } else if (typeof filter.value === 'object' && filter.value !== null) {
            // Date range filter
            const dateRange = filter.value as { from?: Date; to?: Date };
            if (dateRange.from) {
              params.append('startDate', dateRange.from.toISOString().split('T')[0]);
            }
            if (dateRange.to) {
              params.append('endDate', dateRange.to.toISOString().split('T')[0]);
            }
          } else {
            // Simple text or select filter
            if (filter.id === 'name' || filter.id === 'email') {
              params.append('search', filter.value as string);
            } else {
              params.append(filter.id, filter.value as string);
            }
          }
        }
      });

      const response = await fetch(`/api/users?${params.toString()}`);
      const result: ApiResponse = await response.json();
      
      setData(result.data);
      setTotalPages(result.pagination.totalPages);
      setTotalItems(result.pagination.totalItems);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination, sorting, columnFilters]);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Column definitions
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">{row.getValue("name")}</div>
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
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        const colors = {
          Admin: "bg-red-100 text-red-800 border-red-200",
          Moderator: "bg-blue-100 text-blue-800 border-blue-200",
          User: "bg-gray-100 text-gray-800 border-gray-200",
        };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[role as keyof typeof colors]}`}>
            {role}
          </span>
        );
      },
    },
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
    },
    {
      accessorKey: "age",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Age
          {column.getIsSorted() === "asc" ? (
            <ArrowDown className="ml-2 h-4 w-4 rotate-180" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : null}
        </Button>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created At
          {column.getIsSorted() === "asc" ? (
            <ArrowDown className="ml-2 h-4 w-4 rotate-180" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : null}
        </Button>
      ),
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
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted rounded-md transition-colors">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                Actions for {user.name}
              </DropdownMenuLabel>
              <DropdownMenuItem className="cursor-pointer flex items-center gap-2 px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                <Edit className="h-4 w-4" />
                <span>Edit User</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer flex items-center gap-2 px-2 py-2 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive">
                <Trash2 className="h-4 w-4" />
                <span>Delete User</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Action buttons for bulk operations
  const actionButtons: ActionButton<User>[] = [
    {
      label: "Delete Selected",
      variant: "destructive",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: async (selectedRows) => {
        console.log("Delete selected users:", selectedRows);
        // Implement bulk delete API call
        // After successful delete, refresh data
        await fetchData();
      },
      disabled: (selectedRows) => selectedRows.length === 0,
    },
    {
      label: "Export",
      variant: "outline",
      icon: <Download className="h-4 w-4" />,
      onClick: (selectedRows) => {
        console.log("Export selected users:", selectedRows);
        // Implement export functionality
        const csvContent = selectedRows.map(user => 
          `${user.name},${user.email},${user.role},${user.status},${user.createdAt}`
        ).join('\n');
        
        const blob = new Blob([`Name,Email,Role,Status,Created At\n${csvContent}`], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'users.csv';
        a.click();
        window.URL.revokeObjectURL(url);
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
        const emailBody = `Selected users: ${emails.join(', ')}`;
        window.open(`mailto:${emails.join(';')}?subject=Bulk Email&body=${encodeURIComponent(emailBody)}`);
      },
    },
  ];

  // Filter configuration
  const filters: FilterConfig[] = [
    {
      columnId: "name",
      type: "text",
      placeholder: "Search by name or email...",
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
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Server-Side Users Table</h1>
          <p className="text-muted-foreground">
            Manage users with server-side pagination, filtering, and sorting
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => fetchData()}
            disabled={loading}
            variant="outline"
          >
            Refresh Data
          </Button>
        </div>
      </div>

      <div className="border rounded-lg bg-card p-4">
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-muted-foreground">Total Items:</span>
            <div className="text-2xl font-bold">{totalItems}</div>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Current Page:</span>
            <div className="text-2xl font-bold">{pagination.pageIndex + 1}</div>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Total Pages:</span>
            <div className="text-2xl font-bold">{totalPages}</div>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Items Per Page:</span>
            <div className="text-2xl font-bold">{pagination.pageSize}</div>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        filters={filters}
        actionButtons={actionButtons}
        enableRowSelection={true}
        enableColumnVisibility={true}
        enablePagination={true}
        serverSide={{
          enabled: true,
          loading,
          pageCount: totalPages,
          manualPagination: true,
          manualSorting: true,
          manualFiltering: true,
          onPaginationChange: setPagination,
          onSortingChange: setSorting,
          onColumnFiltersChange: setColumnFilters,
        }}
      />
    </div>
  );
}