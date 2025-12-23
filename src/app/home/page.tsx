import Logout from '@/src/modules/home/logout';
import UsersPage from '@/src/modules/home/TableHome';

const Home = () => {
	return (
		<>
			<UsersPage />
			<div>Home</div>
			<Logout />
		</>
	);
};

export default Home;
