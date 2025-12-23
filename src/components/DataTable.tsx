"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  VisibilityState,
} from "@tanstack/react-table";
import { Button } from "./ui/button";
import { useMemo, useState } from "react";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ChevronDown, Search, Filter, Eye, CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";

export interface ActionButton<TData> {
  label: string;
  onClick: (selectedRows: TData[]) => void;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  icon?: React.ReactNode;
  disabled?: (selectedRows: TData[]) => boolean;
}

export interface FilterConfig {
  columnId: string;
  type: "text" | "select" | "multiSelect" | "dateRange" | "number";
  placeholder?: string;
  options?: { label: string; value: string }[];
  label?: string;
}

export interface ServerSideConfig {
  enabled: boolean;
  pageCount: number;
  loading?: boolean;
  onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
  manualPagination?: boolean;
  manualSorting?: boolean;
  manualFiltering?: boolean;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filters?: FilterConfig[];
  enableRowSelection?: boolean;
  enableColumnVisibility?: boolean;
  enablePagination?: boolean;
  actionButtons?: ActionButton<TData>[];
  serverSide?: ServerSideConfig;
}

export default function DataTable<TData, TValue>({
  columns,
  data,
  filters = [],
  enableRowSelection = false,
  enableColumnVisibility = true,
  enablePagination = true,
  actionButtons = [],
  serverSide,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSoring] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Server-side configuration
  const isServerSide = serverSide?.enabled || false;
  const manualPagination = serverSide?.manualPagination ?? isServerSide;
  const manualSorting = serverSide?.manualSorting ?? isServerSide;
  const manualFiltering = serverSide?.manualFiltering ?? isServerSide;

  // Add exact match filter function
  const exactMatchFilter = (row: any, columnId: string, value: string) => {
    return row.getValue(columnId) === value;
  };

  // Add multiselect filter function
  const multiSelectFilter = (row: any, columnId: string, value: string[]) => {
    if (!value || value.length === 0) return true;
    const cellValue = row.getValue(columnId);
    return value.includes(cellValue);
  };

  // Add date range filter function
  const dateRangeFilter = (
    row: any,
    columnId: string,
    value: { from?: Date; to?: Date }
  ) => {
    if (!value || (!value.from && !value.to)) return true;

    const cellValue = row.getValue(columnId);
    if (!cellValue) return false;

    const cellDate = new Date(cellValue);
    if (isNaN(cellDate.getTime())) return false;

    if (value.from && cellDate < value.from) return false;
    if (value.to && cellDate > value.to) return false;

    return true;
  };

  const processedColumns = useMemo(() => {
    const selectFilterColumnIds = new Set(
      filters
        .filter((filter) => filter.type === "select")
        .map((filter) => filter.columnId)
    );

    const multiSelectFilterColumnIds = new Set(
      filters
        .filter((filter) => filter.type === "multiSelect")
        .map((filter) => filter.columnId)
    );

    const dateRangeFilterColumnIds = new Set(
      filters
        .filter((filter) => filter.type === "dateRange")
        .map((filter) => filter.columnId)
    );

    return columns.map((column) => {
      const columnWithIds = column as ColumnDef<TData, TValue> & {
        id?: string;
        accessorKey?: string | number;
      };

      const normalizedId =
        columnWithIds.id ??
        (columnWithIds.accessorKey !== undefined
          ? String(columnWithIds.accessorKey)
          : undefined);

      if (normalizedId && selectFilterColumnIds.has(normalizedId)) {
        return {
          ...column,
          filterFn: exactMatchFilter,
        };
      }

      if (normalizedId && multiSelectFilterColumnIds.has(normalizedId)) {
        return {
          ...column,
          filterFn: multiSelectFilter,
        };
      }

      if (normalizedId && dateRangeFilterColumnIds.has(normalizedId)) {
        return {
          ...column,
          filterFn: dateRangeFilter,
        };
      }

      return column;
    });
  }, [columns, filters]);

  const table = useReactTable({
    data,
    columns: processedColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: enablePagination && !manualPagination
      ? getPaginationRowModel()
      : undefined,
    getFilteredRowModel: !manualFiltering ? getFilteredRowModel() : undefined,
    getSortedRowModel: !manualSorting ? getSortedRowModel() : undefined,
    onRowSelectionChange: enableRowSelection ? setRowSelection : undefined,
    onSortingChange: (updater) => {
      setSoring(updater);
      if (serverSide?.onSortingChange) {
        const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
        serverSide.onSortingChange(newSorting);
      }
    },
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: (updater) => {
      setColumnFilters(updater);
      if (serverSide?.onColumnFiltersChange) {
        const newFilters = typeof updater === 'function' ? updater(columnFilters) : updater;
        serverSide.onColumnFiltersChange(newFilters);
      }
    },
    onPaginationChange: (updater) => {
      setPagination(updater);
      if (serverSide?.onPaginationChange) {
        const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
        serverSide.onPaginationChange(newPagination);
      }
    },
    filterFns: {
      exactMatch: exactMatchFilter,
      multiSelect: multiSelectFilter,
      dateRange: dateRangeFilter,
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
      ...(enableRowSelection && { rowSelection }),
    },
    // Server-side configuration
    manualPagination,
    manualSorting, 
    manualFiltering,
    pageCount: serverSide?.pageCount ?? -1,
  });

  const renderFilter = (filter: FilterConfig) => {
    const column = table.getColumn(filter.columnId);
    if (!column) return null;

    switch (filter.type) {
      case "text":
        return (
          <div key={filter.columnId} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={
                filter.placeholder ||
                `Filter ${filter.label || filter.columnId}...`
              }
              value={(column.getFilterValue() as string) ?? ""}
              onChange={(event) => column.setFilterValue(event.target.value)}
              className="pl-9 h-9 bg-background border-input focus:border-ring focus:ring-1 focus:ring-ring"
              disabled={serverSide?.loading}
            />
            {serverSide?.loading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        );

      case "select":
        return (
          <Select
            key={filter.columnId}
            value={(column.getFilterValue() as string) ?? "all"}
            onValueChange={(value) =>
              column.setFilterValue(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="h-9 bg-background border-input focus:border-ring focus:ring-1 focus:ring-ring">
              <SelectValue
                placeholder={
                  filter.placeholder ||
                  `Select ${filter.label || filter.columnId}`
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="font-medium">
                All {filter.label}
              </SelectItem>
              {filter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "number":
        return (
          <Input
            key={filter.columnId}
            type="number"
            placeholder={
              filter.placeholder ||
              `Filter ${filter.label || filter.columnId}...`
            }
            value={(column.getFilterValue() as string) ?? ""}
            onChange={(event) => column.setFilterValue(event.target.value)}
            className="h-9 bg-background border-input focus:border-ring focus:ring-1 focus:ring-ring"
          />
        );

      case "multiSelect":
        const currentFilterValue = (column.getFilterValue() as string[]) || [];
        return (
          <DropdownMenu key={filter.columnId}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-9 justify-between bg-background border-input hover:bg-accent"
              >
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <span className="truncate">
                    {filter.label || filter.columnId}
                  </span>
                </div>
                <div className="flex items-center">
                  {currentFilterValue.length > 0 && (
                    <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs font-medium">
                      {currentFilterValue.length}
                    </span>
                  )}
                  <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel className="font-semibold">
                {filter.label || filter.columnId}
              </DropdownMenuLabel>
              <div className="max-h-64 overflow-y-auto">
                {filter.options?.map((option) => (
                  <DropdownMenuCheckboxItem
                    key={option.value}
                    checked={currentFilterValue.includes(option.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        const newValue = [...currentFilterValue, option.value];
                        column.setFilterValue(newValue);
                      } else {
                        const newValue = currentFilterValue.filter(
                          (v) => v !== option.value
                        );
                        column.setFilterValue(
                          newValue.length > 0 ? newValue : undefined
                        );
                      }
                    }}
                    className="cursor-pointer"
                  >
                    {option.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        );

      case "dateRange":
        const dateRangeValue: DateRange =
          (column.getFilterValue() as { from: Date; to?: Date }) || {};
        return (
          <div key={filter.columnId} className="flex gap-2 items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[200px] justify-start text-left font-normal h-9 bg-background border-input hover:bg-accent",
                    !dateRangeValue.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRangeValue.from ? (
                    dateRangeValue.to ? (
                      <>
                        {format(dateRangeValue.from, "MMM dd")} -{" "}
                        {format(dateRangeValue.to, "MMM dd, yyyy")}
                      </>
                    ) : (
                      format(dateRangeValue.from, "MMM dd, yyyy")
                    )
                  ) : (
                    <span>{filter.label || "Pick a date"}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  autoFocus
                  mode="range"
                  defaultMonth={dateRangeValue?.from}
                  selected={dateRangeValue}
                  onSelect={(date) => {
                    column.setFilterValue(date);
                  }}
                />
              </PopoverContent>
            </Popover>

            {(dateRangeValue.from || dateRangeValue.to) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => column.setFilterValue(undefined)}
                className="h-8 px-2 text-muted-foreground hover:text-foreground"
              >
                Clear
              </Button>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const renderActionButtons = () => {
    if (actionButtons.length === 0 && !enableColumnVisibility) return null;

    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedData = selectedRows.map((row) => row.original);

    return (
      <div className="flex items-center justify-between gap-4">
        {selectedRows.length > 0 && (
          <div className="flex items-center gap-3 py-2 px-4 bg-primary/10 border border-primary/20 rounded-lg">
            <span className="text-sm font-medium text-primary">
              {selectedRows.length} item{selectedRows.length > 1 ? "s" : ""}{" "}
              selected
            </span>
            <div className="flex gap-2">
              {actionButtons.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || "outline"}
                  size="sm"
                  onClick={() => action.onClick(selectedData)}
                  disabled={action.disabled?.(selectedData)}
                  className="h-8"
                >
                  {action.icon && <span className="mr-1">{action.icon}</span>}
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {enableColumnVisibility && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 bg-background border-input hover:bg-accent"
              >
                <Eye className="mr-2 h-4 w-4" />
                Columns
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="font-semibold">
                Toggle Columns
              </DropdownMenuLabel>
              <div className="max-h-64 overflow-y-auto">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize cursor-pointer"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col items-baseline justify-between space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            {filters.map(renderFilter)}
          </div>
          {renderActionButtons()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg bg-background shadow-sm">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-b bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  {enableRowSelection && (
                    <TableHead className="w-12 pl-4">
                      <Checkbox
                        checked={table.getIsAllPageRowsSelected()}
                        onCheckedChange={(value) =>
                          table.toggleAllPageRowsSelected(!!value)
                        }
                        aria-label="Select all"
                        className="border-2"
                      />
                    </TableHead>
                  )}
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="font-semibold text-foreground"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {serverSide?.loading ? (
                // Loading state
                Array.from({ length: pagination.pageSize }, (_, i) => (
                  <TableRow key={`loading-${i}`}>
                    {enableRowSelection && (
                      <TableCell className="pl-4">
                        <div className="w-4 h-4 bg-muted animate-pulse rounded" />
                      </TableCell>
                    )}
                    {columns.map((_, index) => (
                      <TableCell key={`loading-cell-${index}`} className="py-3">
                        <div className="h-4 bg-muted animate-pulse rounded w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="hover:bg-muted/25 transition-colors border-b last:border-0"
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {enableRowSelection && (
                      <TableCell className="pl-4">
                        <Checkbox
                          checked={row.getIsSelected()}
                          onCheckedChange={(value) =>
                            row.toggleSelected(!!value)
                          }
                          aria-label="Select row"
                          className="border-2"
                          disabled={serverSide?.loading}
                        />
                      </TableCell>
                    )}
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (enableRowSelection ? 1 : 0)}
                    className="h-32 text-center"
                  >
                    <div className="flex flex-col items-center justify-center space-y-3 text-muted-foreground">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <Search className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">No results found</p>
                        <p className="text-xs">
                          Try adjusting your search or filter criteria.
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        {enablePagination && (
          <div className="flex items-center justify-between px-1">
            <div className="text-sm text-muted-foreground">
              Showing{" "}
              {table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize +
                1}{" "}
              to{" "}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) *
                  table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}{" "}
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  className="h-8 w-8 p-0"
                >
                  «
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="h-8 px-3"
                >
                  Previous
                </Button>

                <div className="flex items-center gap-1 px-2">
                  <span className="text-sm text-muted-foreground">Page</span>
                  <span className="text-sm font-medium">
                    {table.getState().pagination.pageIndex + 1} of{" "}
                    {table.getPageCount()}
                  </span>
                </div>

                <Button
                  variant="default"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="h-8 px-3 "
                >
                  Next
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  className="h-8 w-8 p-0"
                >
                  »
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
