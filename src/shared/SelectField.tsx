// src/components/form-fields/SelectField.tsx
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/src/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Control } from 'react-hook-form';

type Option = { value: string; label: string };

type SelectFieldProps = {
	control: Control<any>;
	name: string;
	label: string;
	options: Option[];
	placeholder?: string;
	required?: boolean;
};

export const SelectField = ({
	control,
	name,
	label,
	options,
	placeholder = '選択してください',
	required,
}: SelectFieldProps) => (
	<FormField
		control={control}
		name={name}
		render={({ field }) => (
			<FormItem>
				<FormLabel>
					{label} {required && <span className='text-destructive'>*</span>}
				</FormLabel>
				<Select
					onValueChange={field.onChange}
					defaultValue={field.value}
				>
					<FormControl>
						<SelectTrigger>
							<SelectValue placeholder={placeholder} />
						</SelectTrigger>
					</FormControl>
					<SelectContent>
						{options.map((opt) => (
							<SelectItem
								key={opt.value}
								value={opt.value}
							>
								{opt.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<FormMessage />
			</FormItem>
		)}
	/>
);
