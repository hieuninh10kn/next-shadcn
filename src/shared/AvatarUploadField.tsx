import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/src/components/ui/form';
import { Input } from '@/src/components/ui/input';
import Image from 'next/image';
import { useState } from 'react';
import { Control } from 'react-hook-form';

type AvatarUploadFieldProps = {
	control: Control<any>;
	name: string;
	label: string;
};

export const AvatarUploadField = ({ control, name, label }: AvatarUploadFieldProps) => {
	const [preview, setPreview] = useState<string | null>(null);

	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem>
					<FormLabel>{label}</FormLabel>
					<FormControl>
						<div className='space-y-4'>
							<Input
								type='file'
								accept='image/*'
								onChange={(e) => {
									const file = e.target.files?.[0];
									if (file) {
										field.onChange(file);
										setPreview(URL.createObjectURL(file));
									}
								}}
							/>
							{preview && (
								<div className='relative h-32 w-32 overflow-hidden rounded-full border'>
									<Image
										src={preview}
										alt='Preview avatar'
										fill
										className='object-cover'
									/>
								</div>
							)}
						</div>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};
