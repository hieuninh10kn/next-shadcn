'use client';

import fetcher from '@/src/api/fetcher';
import { Button } from '@/src/components/ui/button';
import { deleteCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';

const Logout = () => {
	const router = useRouter();
	const handleLogout = async () => {
		try {
			await fetcher('/logout', { method: 'POST' }, true, true);
		} catch (error) {
			console.warn('API logout failed, proceeding with client logout');
		} finally {
			deleteCookie('access_token', { path: '/' });
			router.push('/login');
			router.refresh();
		}
	};
	return <Button onClick={handleLogout}>Logout</Button>;
};

export default Logout;
