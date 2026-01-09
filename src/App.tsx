import 'bootstrap/dist/css/bootstrap.min.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './Home';
import Setting from './Setting';
import { v4 as uuidV4 } from 'uuid';
import { useEffect, useState } from 'react';
import { getData } from './utils';
import { Web } from './interfaces';

export const initWebs: Web[] = [
	{
		id: uuidV4(),
		name: 'Student',
		url: 'https://student.uit.edu.vn',
		isAutoLogin: false,
		isKeepAlive: false
	},

	{
		id: uuidV4(),
		name: 'Courses',
		url: 'https://courses.uit.edu.vn',
		isAutoLogin: false,
		isKeepAlive: false
	},
	{
		id: uuidV4(),
		name: 'DAA',
		url: 'https://daa.uit.edu.vn',
		isAutoLogin: false,
		isKeepAlive: false
	},
	{
		id: uuidV4(),
		name: 'DRL',
		url: 'https://drl.uit.edu.vn',
		isAutoLogin: false,
		isKeepAlive: false
	},
	{
		id: uuidV4(),
		name: 'DKHP',
		url: 'https://dkhp.uit.edu.vn',
		isAutoLogin: false,
		isKeepAlive: false
	},
	{
		id: uuidV4(),
		name: 'Forum',
		url: 'https://forum.uit.edu.vn/login',
		isAutoLogin: false,
		isKeepAlive: false
	},
	{
		id: uuidV4(),
		name: 'CTSV',
		url: 'https://ctsv.uit.edu.vn/user',
		isAutoLogin: false,
		isKeepAlive: false
	}
];

export default function App() {
	const [webs, setWebs] = useState<Web[]>(initWebs);

	//Fetch data stored in chrome.local.storage when the app is mounted
	useEffect(() => {
		async function fetchData() {
			try {
				const storedWebs = await getData<any[]>('WEBS');
				if (storedWebs) {
					// Migration logic: Map old 'checked' to new 'isAutoLogin' if needed
					// and ensure new fields exist
					const migratedWebs = storedWebs.map((w) => ({
						...w,
						isAutoLogin: w.isAutoLogin ?? w.checked ?? false,
						isKeepAlive: w.isKeepAlive ?? false
					}));
					
					// Remove the old 'checked' property if it exists to clean up
					let cleanedWebs = migratedWebs.map(({ checked, ...rest }) => rest);

					// Migration URL: Update Forum URL
					cleanedWebs = cleanedWebs.map((w: Web) => {
						if (w.name === 'Forum' && w.url === 'https://forum.uit.edu.vn') {
							return { ...w, url: 'https://forum.uit.edu.vn/login' };
						}
						return w;
					});
					
					setWebs(cleanedWebs);
				}

				//*console.log('Fetching data successfully', storedWebs);
			} catch (error) {
				console.error('Error fetching data:', error);
			}
		}

		fetchData();
	}, []);

	return (
		<Routes>
			<Route path="/" element={<Home webs={webs} />} />
			<Route
				path="/setting"
				element={<Setting webs={webs} setWebs={setWebs} />}
			/>
			<Route path="*" element={<Navigate to="/" />} />
		</Routes>
	);
}
