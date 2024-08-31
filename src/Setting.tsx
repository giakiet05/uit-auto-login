import { Container, Button, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { EncryptedUserInfo, UserInfo, Web } from './interfaces';
import { Dispatch, FormEvent, SetStateAction, useRef } from 'react';
import { saveData } from './utils';
import { generateKey, encryptUserInfo, exportKey } from './crypto';
interface SettingProps {
	webs: Web[];
	setWebs: Dispatch<SetStateAction<Web[]>>;
}

export default function Setting({ webs, setWebs }: SettingProps) {
	const usernameRef = useRef<HTMLInputElement>(null);
	const passwordRef = useRef<HTMLInputElement>(null);
	function handleToggleCheck(id: string) {
		setWebs((prevWebs: Web[]) => {
			const newWebs = prevWebs.map((web) => {
				if (web.id === id) return { ...web, checked: !web.checked };
				else return web;
			});
			saveData('WEBS', newWebs);
			return newWebs;
		});
	}

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		const username = usernameRef.current?.value;
		const password = passwordRef.current?.value;
		if (!username || !password) return;
		const newInfo: UserInfo = {
			username,
			password
		};

		const key = await generateKey();
		const jwkKey = await exportKey(key);
		const encryptedUserInfo: EncryptedUserInfo = await encryptUserInfo(
			key,
			newInfo
		);
		console.log(encryptedUserInfo);
		saveData('KEY', jwkKey);
		saveData('USER_INFO', encryptedUserInfo);
		usernameRef.current.value = '';
		passwordRef.current.value = '';
	}

	return (
		<Container>
			<h6 className=" mt-2">Chọn trang web tự đăng nhập</h6>

			<Form className="ms-2">
				{webs.map((web) => (
					<Form.Check
						className="my-2"
						key={web.id}
						type="switch"
						checked={web.checked}
						id={web.id}
						label={web.name}
						onChange={() => handleToggleCheck(web.id)}
					/>
				))}
			</Form>

			<Form className="my-3" onSubmit={handleSubmit}>
				<h6>Thiết lập thông tin đăng nhập</h6>
				<Form.Group controlId="username" className="mb-2">
					<Form.Control
						required
						size="sm"
						placeholder="MSSV"
						className=" border-black"
						ref={usernameRef}
					/>
				</Form.Group>
				<Form.Group controlId="password">
					<Form.Control
						required
						size="sm"
						type="password"
						placeholder="Mật khẩu"
						className=" border-black"
						ref={passwordRef}
					/>
				</Form.Group>
				<Button variant="primary" type="submit" className="ms-3 float-end my-2">
					Lưu
				</Button>
			</Form>
			<p style={{ fontSize: 10 }}>
				*Thông tin của bạn sẽ được mã hóa và chỉ được sử dụng để tự động đăng
				nhập
			</p>
			<Link to="/">
				<Button variant="secondary" className="float-end my-2">
					Quay lại
				</Button>
			</Link>
		</Container>
	);
}
