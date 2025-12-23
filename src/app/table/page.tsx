"use client";
import { ColumnDef } from "@tanstack/react-table";
import DataTable from "../../components/DataTable";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

import { Trash2, Download, Mail, MoreHorizontal, Edit, ArrowDown } from "lucide-react";
import type { ActionButton, FilterConfig } from "../../components/DataTable";

type Payment = {
  id: number;
  email: string;
  name: string;
  role: "Admin" | "User" | "Moderator";
  status: "Active" | "Inactive";
  createdAt: string;
};

const users: Payment[] = [
  {
    id: 1,
    email: "alice@gmail.com ",
    name: "Alice",
    role: "Admin",
    status: "Active",
    createdAt: "2025-12-15",
  },
  {
    id: 2,
    email: "bob@gmail.com ",
    name: "Bob",
    role: "User",
    status: "Inactive",
    createdAt: "2025-02-20",
  },
  {
    id: 3,
    email: "charlie@gmail.com ",
    name: "Charlie",
    role: "User",
    status: "Active",
    createdAt: "2025-12-10",
  },
  {
    id: 4,
    email: "diana@gmail.com",
    name: "Diana",
    role: "Moderator",
    status: "Active",
    createdAt: "2025-12-25",
  },
  {
    id: 5,
    email: "edward@gmail.com",
    name: "Edward",
    role: "User",
    status: "Active",
    createdAt: "2025-04-05",
  },
  {
    id: 6,
    email: "fiona@gmail.com",
    name: "Fiona",
    role: "Admin",
    status: "Inactive",
    createdAt: "2025-02-14",
  },
  {
    id: 7,
    email: "george@gmail.com",
    name: "George",
    role: "User",
    status: "Active",
    createdAt: "2025-12-22",
  },
  {
    id: 8,
    email: "helen@gmail.com",
    name: "Helen",
    role: "Moderator",
    status: "Active",
    createdAt: "2025-12-30",
  },
  {
    id: 9,
    email: "ian@gmail.com",
    name: "Ian",
    role: "User",
    status: "Inactive",
    createdAt: "2025-04-12",
  },
  {
    id: 10,
    email: "julia@gmail.com",
    name: "Julia",
    role: "Admin",
    status: "Active",
    createdAt: "2025-02-28",
  },
  {
    id: 11,
    email: "kevin@gmail.com",
    name: "Kevin",
    role: "User",
    status: "Active",
    createdAt: "2025-12-18",
  },
  {
    id: 12,
    email: "lisa@gmail.com",
    name: "Lisa",
    role: "Moderator",
    status: "Inactive",
    createdAt: "2025-12-08",
  },
  {
    id: 13,
    email: "michael@gmail.com",
    name: "Michael",
    role: "User",
    status: "Active",
    createdAt: "2025-04-01",
  },
];

const columns: ColumnDef<Payment>[] = [
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
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <div>{format(date, "dd/MM/yyyy")}</div>;
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

export default function UsersTable() {
  const actionButtons: ActionButton<Payment>[] = [
    {
      label: "Delete",
      variant: "destructive",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (selectedRows) => {
        console.log("Delete selected users:", selectedRows);
        // Add your delete logic here
      },
      disabled: (selectedRows) => selectedRows.length === 0,
    },
    {
      label: "Export",
      variant: "outline",
      icon: <Download className="h-4 w-4" />,
      onClick: (selectedRows) => {
        console.log("Export selected users:", selectedRows);
        // Add your export logic here
      },
    },
    {
      label: "Send Email",
      variant: "default",
      icon: <Mail className="h-4 w-4" />,
      onClick: (selectedRows) => {
        const emails = selectedRows.map((user) => user.email);
        console.log("Send email to:", emails);
        // Add your email logic here
      },
    },
  ];

  const filters: FilterConfig[] = [
    {
      columnId: "name",
      type: "text",
      placeholder: "Filter by name...",
    },
    {
      columnId: "status",
      type: "select",
      label: "Status",
      options: [
        { value: "Inactive", label: "Inactive" },
        { value: "Active", label: "Active" },
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
    <div className="max-w-5xl mx-auto p-4">
    <DataTable
      columns={columns}
      data={users}
      filters={filters}
      actionButtons={actionButtons}
      enableRowSelection
      enableColumnVisibility
      enablePagination
    />
    </div>

  );
}
