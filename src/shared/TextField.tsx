// src/components/form-fields/TextField.tsx
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/src/components/ui/form';
import { Input } from '@/src/components/ui/input';
import { Control } from 'react-hook-form';

type TextFieldProps = {
	control: Control<any>;
	name: string;
	label: string;
	placeholder?: string;
	type?: 'text' | 'email' | 'password' | 'tel' | 'number';
	required?: boolean;
};

export const TextField = ({ control, name, label, placeholder, type = 'text', required }: TextFieldProps) => (
	<FormField
		control={control}
		name={name}
		render={({ field }) => (
			<FormItem>
				<FormLabel>
					{label} {required && <span className='text-destructive'>*</span>}
				</FormLabel>
				<FormControl>
					<Input
						type={type}
						placeholder={placeholder}
						{...field}
					/>
				</FormControl>
				<FormMessage />
			</FormItem>
		)}
	/>
);
