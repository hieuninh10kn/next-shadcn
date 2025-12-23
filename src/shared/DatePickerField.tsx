// src/components/form-fields/DatePickerField.tsx
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Control } from 'react-hook-form';

import { Button } from '@/src/components/ui/button';
import { Calendar } from '@/src/components/ui/calendar';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/src/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover';
import { cn } from '@/src/lib/utils';

type DatePickerFieldProps = {
	control: Control<any>;
	name: string;
	label: string;
	required?: boolean;
};

export const DatePickerField = ({ control, name, label, required }: DatePickerFieldProps) => (
	<FormField
		control={control}
		name={name}
		render={({ field }) => (
			<FormItem className='flex flex-col'>
				<FormLabel>
					{label} {required && <span className='text-destructive'>*</span>}
				</FormLabel>
				<Popover>
					<PopoverTrigger asChild>
						<FormControl>
							<Button
								variant='outline'
								className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
							>
								{field.value ? format(field.value, 'PPP') : <span>日付を選択</span>}
								<CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
							</Button>
						</FormControl>
					</PopoverTrigger>
					<PopoverContent
						className='w-auto p-0'
						align='start'
					>
						<Calendar
							mode='single'
							selected={field.value}
							onSelect={field.onChange}
							disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
							initialFocus
						/>
					</PopoverContent>
				</Popover>
				<FormMessage />
			</FormItem>
		)}
	/>
);
