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
		checked: false
	},

	{
		id: uuidV4(),
		name: 'Courses',
		url: 'https://courses.uit.edu.vn',
		checked: false
	},
	{
		id: uuidV4(),
		name: 'DAA',
		url: 'https://daa.uit.edu.vn',
		checked: false
	},
	{
		id: uuidV4(),
		name: 'DRL',
		url: 'https://drl.uit.edu.vn',
		checked: false
	},
	{
		id: uuidV4(),
		name: 'DKHP',
		url: 'https://dkhp.uit.edu.vn',
		checked: false
	},
	{
		id: uuidV4(),
		name: 'Forum',
		url: 'https://forum.uit.edu.vn',
		checked: false
	}
];

export default function App() {
	const [webs, setWebs] = useState<Web[]>(initWebs);

	//Fetch data stored in chrome.local.storage when the app is mounted
	useEffect(() => {
		async function fetchData() {
			try {
				const storedWebs = await getData<Web[]>('WEBS');
				if (storedWebs) setWebs(storedWebs);

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
