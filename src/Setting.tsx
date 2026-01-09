import { Container, Button, Form, Alert, Tabs, Tab, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { EncryptedUserInfo, UserInfo, Web } from './interfaces';
import { Dispatch, FormEvent, SetStateAction, useRef, useState, useEffect } from 'react';
import { saveData, getData } from './utils';
import { generateKey, encryptUserInfo, exportKey } from './crypto';

interface CookieStatus {
	enabled: boolean;
	lastSynced?: number;
}

interface SettingProps {
	webs: Web[];
	setWebs: Dispatch<SetStateAction<Web[]>>;
}

export default function Setting({ webs, setWebs }: SettingProps) {
	const usernameRef = useRef<HTMLInputElement>(null);
	const passwordRef = useRef<HTMLInputElement>(null);
	const [cookieStatus, setCookieStatus] = useState<CookieStatus>({
		enabled: false
	});
	const [syncMessage, setSyncMessage] = useState<string>('');
	const [saveMessage, setSaveMessage] = useState<string>('');

	// Load cookie status khi component mount
	useEffect(() => {
		async function loadCookieStatus() {
			const status = await getData<CookieStatus>('COOKIE_STATUS');
			if (status) {
				setCookieStatus(status);
			}
		}
		loadCookieStatus();
	}, []);

	function handleToggleCheck(id: string, field: 'isAutoLogin' | 'isKeepAlive') {
		setWebs((prevWebs: Web[]) => {
			const newWebs = prevWebs.map((web) => {
				if (web.id === id) return { ...web, [field]: !web[field] };
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

		saveData('KEY', jwkKey);
		saveData('USER_INFO', encryptedUserInfo);
		if (usernameRef.current) usernameRef.current.value = '';
		if (passwordRef.current) passwordRef.current.value = '';
		
		setSaveMessage('Đã lưu thông tin đăng nhập thành công!');
		setTimeout(() => setSaveMessage(''), 3000);
	}

	async function handleToggleKeepAlive(enabled: boolean) {
		if (enabled) {
			try {
				const cookies = await chrome.cookies.getAll({ domain: '.uit.edu.vn' });
				if (cookies.length === 0) {
					setSyncMessage('Cần đăng nhập UIT trước khi bật!');
					return;
				}

				const newStatus: CookieStatus = {
					enabled: true,
					lastSynced: Date.now()
				};

				await saveData('COOKIE_STATUS', newStatus);
				setCookieStatus(newStatus);
				chrome.alarms.create('keepAlive', { periodInMinutes: 1 });
				setSyncMessage('');
			} catch (error) {
				setSyncMessage('Lỗi khi bật: ' + error);
			}
		} else {
			const newStatus: CookieStatus = { enabled: false };
			await saveData('COOKIE_STATUS', newStatus);
			setCookieStatus(newStatus);
			chrome.alarms.clear('keepAlive');
			setSyncMessage('');
		}
	}

	const autoLoginTooltip = (
		<Tooltip id="auto-login-tooltip">
			<strong>HDSD và lưu ý:</strong><br/>
			1. Nhập MSSV + mật khẩu rồi lưu lại.<br/>
			2. Chọn trang bạn muốn tự động đăng nhập. Những trang bạn chọn sẽ được tự động điền thông tin đăng nhập.<br/>
			<em>*Thông tin đăng nhập của bạn sẽ được mã hóa và lưu vào storage của extension, và chỉ được dùng cho mục đích tự đăng nhập, không dùng cho mục đích khác và không chia sẻ ra bên ngoài.</em><br/>
			<em>**Dù thông tin đã được mã hóa, vẫn tiềm ẩn một số rủi ro bảo mật. Cân nhắc trước khi sử dụng.</em>
		</Tooltip>
	);

	const keepAliveTooltip = (
		<Tooltip id="keep-alive-tooltip">
			<strong>HDSD và lưu ý:</strong><br/>
			1. Bật 'Duy trì kết nối'.<br/>
			2. Đăng nhập vào web trường.<br/>
			3. Chọn trang bạn muốn giữ đăng nhập.<br/>
			<em>*Extension sẽ gửi request ngầm định kỳ đến các trang web để giúp bạn không bị logout do không hoạt động trong thời gian dài.</em>
		</Tooltip>
	);

	return (
		<Container className="p-3" style={{ width: '350px' }}>
			<h6 className="text-center mb-3 fw-bold text-primary">CÀI ĐẶT</h6>
			
			<Tabs defaultActiveKey="autologin" id="setting-tabs" className="mb-3 nav-fill">
				<Tab eventKey="autologin" title="Tự đăng nhập">
					<div className="bg-light p-2 rounded mb-3 border">
						<p className="mb-2 fw-bold small text-secondary d-flex align-items-center">
							Chọn trang để tự đăng nhập:
							<OverlayTrigger placement="bottom" overlay={autoLoginTooltip}>
								<span className="ms-1 border rounded-circle d-inline-flex align-items-center justify-content-center text-muted" style={{ width: '14px', height: '14px', fontSize: '10px', cursor: 'help' }}>?</span>
							</OverlayTrigger>
						</p>
						<div style={{ maxHeight: '150px', overflowY: 'auto' }}>
							{webs.map((web) => (
								<Form.Check
									key={web.id}
									type="switch"
									id={`auto-${web.id}`}
									label={web.name}
									checked={web.isAutoLogin}
									onChange={() => handleToggleCheck(web.id, 'isAutoLogin')}
									className="mb-1"
									style={{ fontSize: '0.9rem' }}
								/>
							))}
						</div>
					</div>

					<Form onSubmit={handleSubmit} className="border-top pt-2">
						<p className="mb-2 fw-bold small text-secondary">Cập nhật tài khoản:</p>
						<Form.Group controlId="username" className="mb-2">
							<Form.Control required size="sm" placeholder="MSSV" ref={usernameRef} />
						</Form.Group>
						<Form.Group controlId="password">
							<Form.Control required size="sm" type="password" placeholder="Mật khẩu" ref={passwordRef} />
						</Form.Group>
						{saveMessage && (
							<Alert variant="success" className="mt-2 py-1 px-2 small text-center mb-0">
								{saveMessage}
							</Alert>
						)}
						<Button variant="primary" type="submit" size="sm" className="w-100 mt-2">
							Lưu thông tin
						</Button>
					</Form>
				</Tab>

				<Tab eventKey="keepalive" title="Giữ kết nối">
					<div className="bg-white p-2 rounded mb-2 border border-success">
						<div className="d-flex align-items-center mb-1">
							<Form.Check 
								type="switch"
								id="master-keepalive"
								label={<strong className="text-success">Duy trì kết nối</strong>}
								checked={cookieStatus.enabled}
								onChange={(e) => handleToggleKeepAlive(e.target.checked)}
							/>
							<OverlayTrigger placement="bottom" overlay={keepAliveTooltip}>
								<span className="ms-1 border rounded-circle d-inline-flex align-items-center justify-content-center text-muted" style={{ width: '14px', height: '14px', fontSize: '10px', cursor: 'help' }}>?</span>
							</OverlayTrigger>
						</div>
						<p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>
						*Extension sẽ gửi request ngầm định kỳ đến các trang web để giúp bạn không bị logout do không hoạt động trong thời gian dài.
						</p>
					</div>

					{cookieStatus.enabled && (
						<>
							<div className="bg-light p-2 rounded mb-3 border">
								<p className="mb-2 fw-bold small text-secondary">Trang web áp dụng:</p>
								<div style={{ maxHeight: '150px', overflowY: 'auto' }}>
									{webs.map((web) => (
										<Form.Check
											key={web.id}
											type="switch"
											id={`keep-${web.id}`}
											label={web.name}
											checked={web.isKeepAlive}
											onChange={() => handleToggleCheck(web.id, 'isKeepAlive')}
											className="mb-1"
											style={{ fontSize: '0.9rem' }}
										/>
									))}
								</div>
							</div>

							<div className="alert alert-info py-2 px-2 small mb-2">
								<div><strong>Trạng thái:</strong> Đang chạy ngầm (1p/lần)</div>
								<div><strong>Check lần cuối:</strong> {cookieStatus.lastSynced ? new Date(cookieStatus.lastSynced).toLocaleTimeString('vi-VN') : '-'}</div>
							</div>
						</>
					)}

					{syncMessage && (
						<Alert variant="warning" className="py-1 px-2 small text-center mb-2">
							{syncMessage}
						</Alert>
					)}

					{!cookieStatus.enabled && (
						<div className="text-center p-3 text-muted small">
							Gạt switch phía trên để bắt đầu duy trì session.
						</div>
					)}
				</Tab>
			</Tabs>

			<Link to="/" className="d-grid mt-3 text-decoration-none">
				<Button variant="outline-secondary" size="sm">
					Quay lại màn hình chính
				</Button>
			</Link>
		</Container>
	);
}
