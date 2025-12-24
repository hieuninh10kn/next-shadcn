'use client';

import { Checkbox } from '@/src/components/ui/checkbox';
import { ScrollArea } from '@/src/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { cn } from '@/src/lib/utils';
import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	OnChangeFn,
	RowSelectionState,
	SortingState,
	useReactTable,
} from '@tanstack/react-table';
import { ChevronDown, ChevronUp, GripVertical, Loader2 } from 'lucide-react';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

export type DataTableProps<TData extends { id: any }, TValue> = {
	columns: ColumnDef<TData, TValue>[];
	data?: TData[];
	isLoading?: boolean;
	isLoadingMore?: boolean;
	maxHeight?: string | number;
	rowSelection?: RowSelectionState;
	setRowSelection?: OnChangeFn<RowSelectionState>;
	onRowReorder?: (oldIndex: number, newIndex: number) => void;
	onColumnReorder?: (oldIndex: number, newIndex: number) => void;
	// MỚI: bật/tắt drag drop column
	enableColumnReorder?: boolean;
	total?: number;
	pinnedColumns?: number;
	className?: string;
	getActions?: (row: TData) => React.ReactNode;
	getGroupActions?: (ids: TData['id'][], allSelected: boolean) => React.ReactNode;
	onScrollBottom?: () => void;
};

const ItemTypes = {
	ROW: 'row',
	COLUMN: 'column',
};

// ===================== DRAGGABLE ROW =====================
const DraggableRow: FC<{
	row: any;
	index: number;
	moveRow: (dragIndex: number, hoverIndex: number) => void;
}> = ({ row, index, moveRow }) => {
	const rowRef = useRef<HTMLTableRowElement>(null);
	const dragHandleRef = useRef<HTMLDivElement>(null);

	const [{ isDragging }, drag, preview] = useDrag({
		type: ItemTypes.ROW,
		item: { index },
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
	});

	const [, drop] = useDrop({
		accept: ItemTypes.ROW,
		hover: (item: { index: number }) => {
			if (!rowRef.current) return;
			if (item.index !== index) {
				moveRow(item.index, index);
				item.index = index;
			}
		},
	});

	drop(rowRef);
	drag(dragHandleRef);
	preview(rowRef);

	return (
		<TableRow
			ref={rowRef}
			data-state={row.getIsSelected() && 'selected'}
			className={cn(
				'group hover:bg-muted/50 data-[state=selected]:bg-accent',
				isDragging && 'opacity-50',
				index % 2 === 0 ? 'bg-yellow-200' : 'bg-amber-900',
			)}
		>
			<TableCell className='sticky left-0 z-20 w-10 px-2'>
				<div
					ref={dragHandleRef}
					className='flex h-full cursor-grab items-center justify-center active:cursor-grabbing'
				>
					<GripVertical className='text-muted-foreground h-4 w-4' />
				</div>
			</TableCell>

			{row.getVisibleCells().map((cell: any) => (
				<TableCell
					key={cell.id}
					className={cn('px-4 py-3', cell.column.getIsPinned() && 'sticky z-10')}
					style={{
						width: cell.column.getSize(),
						position: cell.column.getIsPinned() ? 'sticky' : 'relative',
						left: cell.column.getIsPinned() ? cell.column.getStart('left') : undefined,
					}}
				>
					{flexRender(cell.column.columnDef.cell, cell.getContext())}
				</TableCell>
			))}
		</TableRow>
	);
};

// ===================== DRAGGABLE COLUMN HEADER =====================
const DraggableColumnHeader: React.FC<{
	header: any;
	index: number;
	moveColumn: (dragIndex: number, hoverIndex: number) => void;
}> = ({ header, index, moveColumn }) => {
	const ref = useRef<HTMLTableCellElement>(null);

	const [{ isDragging }, drag] = useDrag({
		type: ItemTypes.COLUMN,
		item: { index },
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
	});

	const [{ isOver }, drop] = useDrop({
		accept: ItemTypes.COLUMN,
		hover: (item: { index: number }) => {
			if (item.index !== index) {
				moveColumn(item.index, index);
				item.index = index;
			}
		},
		collect: (monitor) => ({
			isOver: monitor.isOver(),
		}),
	});

	drag(drop(ref));

	return (
		<TableHead
			ref={ref}
			className={cn(
				'group bg-muted/30 relative cursor-move px-4 py-3 font-medium select-none',
				isDragging && 'opacity-50',
				isOver && 'bg-accent/50',
			)}
			style={{
				width: header.getSize(),
				minWidth: 50,
				position: header.column.getIsPinned() ? 'sticky' : 'relative',
				left: header.column.getIsPinned() ? header.column.getStart('left') : undefined,
				zIndex: header.column.getIsPinned() ? 30 : 20,
			}}
		>
			<div className='flex items-center justify-between'>
				{flexRender(header.column.columnDef.header, header.getContext())}
				<div className='flex items-center gap-2'>
					{header.column.getCanSort() && (
						<button
							onClick={header.column.getToggleSortingHandler()}
							className='opacity-0 transition-opacity group-hover:opacity-100'
						>
							{header.column.getIsSorted() === 'asc' ? (
								<ChevronUp className='h-4 w-4' />
							) : header.column.getIsSorted() === 'desc' ? (
								<ChevronDown className='h-4 w-4' />
							) : (
								<div className='h-4 w-4' /> // placeholder để giữ khoảng cách
							)}
						</button>
					)}
				</div>
			</div>

			{header.column.getCanResize() && (
				<div
					onMouseDown={header.getResizeHandler()}
					onTouchStart={header.getResizeHandler()}
					className='hover:bg-primary absolute top-0 right-0 h-full w-1 cursor-col-resize opacity-0 transition-opacity group-hover:opacity-100'
				/>
			)}
		</TableHead>
	);
};

// ===================== MAIN COMPONENT =====================
export function DataTable<TData extends { id: any }, TValue>({
	columns,
	data = [],
	isLoading = false,
	isLoadingMore = false,
	maxHeight = '600px',
	rowSelection = {},
	setRowSelection,
	onRowReorder,
	onColumnReorder,
	enableColumnReorder = false, // mặc định tắt
	total,
	pinnedColumns = 0,
	className,
	getActions,
	getGroupActions,
	onScrollBottom,
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = useState<SortingState>([]);

	const table = useReactTable({
		data,
		columns,
		getRowId: (row) => row.id.toString(),
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: setSorting,
		onRowSelectionChange: setRowSelection,
		columnResizeMode: 'onChange',
		state: {
			sorting,
			rowSelection,
		},
		defaultColumn: {
			size: 150,
			minSize: 50,
		},
	});

	// Pin columns
	useEffect(() => {
		const pinnedIds = columns
			.slice(0, pinnedColumns)
			.map((col) => col.id || (col as any).accessorKey)
			.filter(Boolean);
		table.setColumnPinning({ left: pinnedIds });
	}, [pinnedColumns, columns, table]);

	const moveRow = useCallback(
		(dragIndex: number, hoverIndex: number) => {
			onRowReorder?.(dragIndex, hoverIndex);
		},
		[onRowReorder],
	);

	const moveColumn = useCallback(
		(dragIndex: number, hoverIndex: number) => {
			onColumnReorder?.(dragIndex, hoverIndex);
		},
		[onColumnReorder],
	);

	const scrollRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const el = scrollRef.current;
		if (!el || !onScrollBottom) return;
		const handler = () => {
			if (el.scrollHeight - el.scrollTop - el.clientHeight < 100 && !isLoadingMore) {
				onScrollBottom();
			}
		};
		el.addEventListener('scroll', handler);
		return () => el.removeEventListener('scroll', handler);
	}, [onScrollBottom, isLoadingMore]);

	const selectedIds = table.getSelectedRowModel().flatRows.map((r) => r.original.id);
	const hasRowReorder = !!onRowReorder;
	const hasColumnReorder = enableColumnReorder && !!onColumnReorder;

	return (
		<DndProvider backend={HTML5Backend}>
			<div className={cn('relative w-full', className)}>
				{isLoading && (
					<div className='bg-background/80 absolute inset-0 z-50 flex items-center justify-center'>
						<div className='flex flex-col items-center gap-3'>
							<Loader2 className='text-primary h-8 w-8 animate-spin' />
							<span className='text-muted-foreground'>Loading...</span>
						</div>
					</div>
				)}

				<ScrollArea
					ref={scrollRef}
					className='rounded-md border'
					style={{ maxHeight }}
				>
					<Table>
						<TableHeader className='bg-background/95 sticky top-0 z-10'>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow
									key={headerGroup.id}
									className='border-b'
								>
									{hasRowReorder && <TableHead className='w-10 px-2' />}

									{headerGroup.headers.map((header, idx) =>
										hasColumnReorder ? (
											<DraggableColumnHeader
												key={header.id}
												header={header}
												index={idx}
												moveColumn={moveColumn}
											/>
										) : (
											<TableHead
												key={header.id}
												className={cn(
													'bg-muted/30 group relative border-r border-r-[#bcdb00] px-4 py-3 font-medium',
													header.column.getIsPinned() && 'sticky z-30 bg-white',
												)}
												style={{
													width: header.getSize(),
													position: header.column.getIsPinned() ? 'sticky' : 'relative',
													left: header.column.getIsPinned() ? header.column.getStart('left') : undefined,
												}}
											>
												<div className='flex items-center justify-between'>
													{flexRender(header.column.columnDef.header, header.getContext())}
													{header.column.getCanSort() && (
														<button
															onClick={header.column.getToggleSortingHandler()}
															className='opacity-0 transition-opacity group-hover:opacity-100'
														>
															{header.column.getIsSorted() === 'asc' ? (
																<ChevronUp className='h-4 w-4' />
															) : header.column.getIsSorted() === 'desc' ? (
																<ChevronDown className='h-4 w-4' />
															) : (
																<div className='h-4 w-4' />
															)}
														</button>
													)}
												</div>

												{header.column.getCanResize() && (
													<div
														onMouseDown={header.getResizeHandler()}
														onTouchStart={header.getResizeHandler()}
														className='hover:bg-primary absolute top-0 right-0 h-full w-1 cursor-col-resize opacity-0 transition-opacity group-hover:opacity-100'
													/>
												)}
											</TableHead>
										),
									)}
								</TableRow>
							))}
						</TableHeader>

						<TableBody>
							{hasRowReorder
								? table.getRowModel().rows.map((row, index) => (
										<DraggableRow
											key={row.id}
											row={row}
											index={index}
											moveRow={moveRow}
										/>
									))
								: table.getRowModel().rows.map((row, index) => {
										return (
											<TableRow
												key={row.id}
												data-state={row.getIsSelected() && 'selected'}
												className='hover:bg-muted/50 data-[state=selected]:bg-accent'
											>
												{getActions && (
													<TableCell className='bg-background sticky left-0 z-10 w-10'>
														{getActions(row.original)}
													</TableCell>
												)}
												{row.getVisibleCells().map((cell: any) => (
													<TableCell
														key={cell.id}
														className={cn('px-4 py-3', cell.column.getIsPinned() && 'bg-background/95 sticky z-10')}
														style={{
															width: cell.column.getSize(),
															position: cell.column.getIsPinned() ? 'sticky' : 'relative',
															left: cell.column.getIsPinned() ? cell.column.getStart('left') : undefined,
														}}
													>
														{flexRender(cell.column.columnDef.cell, cell.getContext())}
													</TableCell>
												))}
											</TableRow>
										);
									})}

							{isLoadingMore && (
								<TableRow>
									<TableCell
										colSpan={columns.length + (hasRowReorder ? 1 : 0)}
										className='h-16 text-center'
									>
										<div className='flex items-center justify-center gap-2'>
											<Loader2 className='h-4 w-4 animate-spin' />
											<span className='text-muted-foreground text-sm'>Loading more...</span>
										</div>
									</TableCell>
								</TableRow>
							)}

							{data.length === 0 && !isLoading && (
								<TableRow>
									<TableCell
										colSpan={columns.length + (hasRowReorder ? 1 : 0)}
										className='text-muted-foreground h-32 text-center'
									>
										Không có dữ liệu
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</ScrollArea>

				{selectedIds.length > 0 && getGroupActions && (
					<div className='bg-muted/50 mt-4 rounded-lg border p-4'>
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-3'>
								<Checkbox
									ref={(el) => {
										if (el) {
											(el as HTMLInputElement).indeterminate =
												table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected();
										}
									}}
									checked={table.getIsAllPageRowsSelected()}
									onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
								/>
								<span className='text-sm font-medium'>{selectedIds.length} mục đã chọn</span>
							</div>
							<div className='flex gap-2'>{getGroupActions(selectedIds, table.getIsAllRowsSelected())}</div>
						</div>
					</div>
				)}
			</div>
		</DndProvider>
	);
}

export default DataTable;
