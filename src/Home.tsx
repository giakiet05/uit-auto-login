import { Container, ListGroup, Button, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import logo from './assets/images/uit-logo.png';
import { Web } from './interfaces';
interface HomeProps {
	webs: Web[];
}

export default function Home({ webs }: HomeProps) {
	function handleClick(url: string) {
		chrome.tabs.create({ url });
	}

	return (
		<Container>
			<h1 className="my-3 text-center">
				<Image src={logo} fluid style={{ width: 50 }} className="me-2" />
				UIT AUTO LOGIN
			</h1>
			<ListGroup variant="flush">
				{webs.map((web) => (
					<ListGroup.Item
						action
						key={web.id}
						onClick={() => handleClick(web.url)}
					>
						<h6 className="m-0">{web.name}</h6>
						<span style={{ fontSize: 12, fontStyle: 'italic' }}>{web.url}</span>
					</ListGroup.Item>
				))}
			</ListGroup>
			<Link to="/setting">
				<Button variant="primary" className="float-end my-2">
					Cài đặt
				</Button>
			</Link>
		</Container>
	);
}
