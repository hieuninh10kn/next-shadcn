'use client';

import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Checkbox } from '@/src/components/ui/checkbox';
import DataTable from '@/src/shared/Table';
import { ColumnDef } from '@tanstack/react-table';
import { useEffect, useState } from 'react';

// Kiểu dữ liệu
type Person = {
	id: string;
	name: string;
	email: string;
	role: 'Admin' | 'User' | 'Guest';
	status: 'active' | 'inactive';
	joinDate: string;
};

export default function UsersPage() {
	// State dữ liệu
	const [data, setData] = useState<Person[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

	// Tạo dữ liệu giả
	const generateData = (start: number, count: number): Person[] => {
		return Array.from({ length: count }, (_, i) => ({
			id: `user-${start + i}`,
			name: `Người dùng ${start + i}`,
			email: `user${start + i}@example.com`,
			role: ['Admin', 'User', 'Guest'][Math.floor(Math.random() * 3)] as Person['role'],
			status: Math.random() > 0.3 ? 'active' : 'inactive',
			joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
		}));
	};

	// Load dữ liệu ban đầu
	useEffect(() => {
		setTimeout(() => {
			setData(generateData(1, 20));
			setLoading(false);
		}, 1000);
	}, []);

	// Infinite scroll - load thêm
	const handleLoadMore = () => {
		if (loadingMore) return;
		setLoadingMore(true);

		setTimeout(() => {
			setData((prev) => [...prev, ...generateData(prev.length + 1, 15)]);
			setLoadingMore(false);
		}, 800);
	};

	// Kéo thả sắp xếp lại hàng
	const handleRowReorder = (oldIndex: number, newIndex: number) => {
		setData((prev) => {
			const newData = [...prev];
			const [moved] = newData.splice(oldIndex, 1);
			newData.splice(newIndex, 0, moved);
			return newData;
		});
	};

	// Kéo thả sắp xếp lại cột (tùy chọn)
	const handleColumnReorder = (oldIndex: number, newIndex: number) => {
		setColumns((prev) => {
			const newCols = [...prev];
			const [moved] = newCols.splice(oldIndex, 1);
			newCols.splice(newIndex, 0, moved);
			return newCols;
		});
	};

	// Định nghĩa cột
	const [columns, setColumns] = useState<ColumnDef<Person>[]>([
		{
			id: 'select',
			header: ({ table }) => (
				<Checkbox
					checked={table.getIsAllPageRowsSelected()}
					ref={(el) => {
						if (el instanceof HTMLInputElement) el.indeterminate = table.getIsSomePageRowsSelected();
					}}
					onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				/>
			),
			cell: ({ row }) => (
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(value) => row.toggleSelected(!!value)}
				/>
			),
			enableSorting: false,
			enableResizing: false,
			size: 50,
		},
		{
			accessorKey: 'name',
			header: 'Họ tên',
			cell: ({ row }) => <div className='font-semibold'>{row.getValue('name')}</div>,
			enableResizing: true,
			enableSorting: true,
			minSize: 320,
		},
		{
			accessorKey: 'email',
			header: 'Email',
			cell: ({ row }) => <div className='text-muted-foreground'>{row.getValue('email')}</div>,
		},
		{
			accessorKey: 'role',
			header: 'Vai trò',
			cell: ({ row }) => {
				const role = row.getValue('role') as string;
				return <Badge variant={role === 'Admin' ? 'default' : role === 'User' ? 'secondary' : 'outline'}>{role}</Badge>;
			},
		},
		{
			accessorKey: 'status',
			header: 'Trạng thái',
			cell: ({ row }) => (
				<Badge variant={row.getValue('status') === 'active' ? 'default' : 'destructive'}>
					{row.getValue('status') === 'active' ? 'Hoạt động' : 'Ngừng'}
				</Badge>
			),
		},
		{
			accessorKey: 'joinDate',
			header: 'Ngày tham gia',
			cell: ({ row }) => row.getValue('joinDate'),
		},
	]);

	// Lấy ID các hàng đã chọn
	const selectedRowIds = Object.keys(rowSelection).filter((key) => rowSelection[key]);

	return (
		<div className='container mx-auto max-w-6xl py-10'>
			<h1 className='mb-8 text-3xl font-bold'>Quản lý người dùng</h1>

			<DataTable
				columns={columns}
				data={data} // đã có default [] trong component nên an toàn
				isLoading={loading}
				isLoadingMore={loadingMore}
				maxHeight='70vh'
				rowSelection={rowSelection}
				setRowSelection={setRowSelection}
				onRowReorder={handleRowReorder} // Bật kéo thả sắp xếp hàng
				onColumnReorder={handleColumnReorder} // Bật kéo thả sắp xếp cột
				enableColumnReorder={false}
				pinnedColumns={2} // Cố định 2 cột đầu (checkbox + tên)
				onScrollBottom={handleLoadMore} // Infinite scroll
				getGroupActions={(ids, allSelected) => (
					<>
						<Button
							variant='destructive'
							size='sm'
						>
							Xóa {ids.length} người dùng
						</Button>
						<Button size='sm'>Gửi email</Button>
						<Button
							variant='outline'
							size='sm'
						>
							{allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả trang'}
						</Button>
					</>
				)}
			/>

			{/* Hiển thị số lượng đã chọn (tùy chọn) */}
			{selectedRowIds.length > 0 && (
				<div className='bg-background fixed bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-4 rounded-lg border px-6 py-3 shadow-lg'>
					<span className='font-medium'>{selectedRowIds.length} người dùng đã chọn</span>
					<Button
						variant='ghost'
						size='sm'
						onClick={() => setRowSelection({})}
					>
						Bỏ chọn tất cả
					</Button>
				</div>
			)}
		</div>
	);
}
