'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { login } from '@/src/api/auth/login';
import { Button } from '@/src/components/ui/button';
import { Form } from '@/src/components/ui/form';
import { TextField } from '@/src/shared/TextField';

const formSchema = z.object({
	email: z.string().email({ message: 'Email không hợp lệ' }),
	password: z.string().min(6, { message: 'Mật khẩu ít nhất 6 ký tự' }),
});

type Schema = z.infer<typeof formSchema>;

const LoginForm = () => {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<Schema>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	});

	const onSubmit = async (values: Schema) => {
		setIsLoading(true);
		try {
			await login(values);
			router.push('/home');
		} catch (error: any) {
			console.error('Login error:', error.message);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className='space-y-6'
			>
				<div className='mx-auto w-full max-w-sm p-6'>
					<h1 className='text-primary text-center text-[2.2em] font-extrabold'>ログイン</h1>

					<div className='mt-8 space-y-5'>
						<div className='space-y-2'>
							<TextField
								control={form.control}
								name='email'
								label='メールアドレス'
								placeholder='place'
								required
							/>
						</div>

						<div className='space-y-2'>
							<TextField
								control={form.control}
								name='password'
								label='パスワード'
								placeholder='password'
								required
								type='password'
							/>
						</div>
					</div>

					<div className='mt-8 text-center'>
						<Button
							type='submit'
							disabled={isLoading}
							className='h-14 w-full max-w-65 text-sm font-bold tracking-wider shadow-md'
						>
							{isLoading ? 'Loading...' : 'ログイン'}
						</Button>
					</div>

					<p className='mt-6 text-right'>
						<Link
							href='/forgot-password'
							className='text-muted-foreground text-[10.5px] font-bold hover:underline'
						>
							パスワードをお忘れの方はこちら
						</Link>
					</p>
				</div>
			</form>
		</Form>
	);
};

export default LoginForm;
