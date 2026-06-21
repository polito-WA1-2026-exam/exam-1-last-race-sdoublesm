import { useState, useEffect } from "react";
import { doLogin, doLogout } from "../api/auth";
import { useNavigate } from "react-router";
import { Form, Button, Container } from "react-bootstrap";
import { LoadingView } from "./LoadingView.jsx";

function LoginForm(props) {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [errormsg, setErrormsg] = useState("");

	const doSubmit = async (ev) => {
		ev.preventDefault();
		setErrormsg("");

		try {
			const user = await doLogin(username, password);
			props.doLogin(user);
		} catch (ex) {
			setErrormsg(ex.message);
			setTimeout(() => setErrormsg(""), 3000);
		}
	};

	return (
		<Container className="mt-5" style={{ maxWidth: "500px" }}>
			<h2 className="mb-4">LOGIN</h2>
			<Form
				onSubmit={doSubmit}
				className="p-4 border rounded-4 shadow-lg bg-white"
			>
				<Form.Group className="mb-3" controlId="formBasicEmail">
					<Form.Label>Username</Form.Label>
					<Form.Control
						placeholder="Enter username"
						value={username}
						autoComplete="username"
						onChange={(ev) => setUsername(ev.target.value)}
					/>
				</Form.Group>

				<Form.Group className="mb-4" controlId="formBasicPassword">
					<Form.Label>Password</Form.Label>
					<Form.Control
						type="password"
						placeholder="Password"
						value={password}
						autoComplete="current-password"
						onChange={(ev) => setPassword(ev.target.value)}
					/>
				</Form.Group>

				<Button
					type="submit"
					className="w-100 mb-3 bg-primary text-light fw-bold"
				>
					LOGIN
				</Button>

				{errormsg && (
					<div className="text-danger text-center fw-bold">{errormsg}</div>
				)}
			</Form>
		</Container>
	);
}

function Logout(props) {
	const navigate = useNavigate();

	useEffect(() => {
		doLogout()
			.then(() => {
				props.doLogin({
					studentId: undefined,
					username: undefined,
					name: undefined,
					planType: null,
				});
				navigate("/");
			})
			.catch((err) => console.error(err));
	}, [navigate, props]);

	return <LoadingView message="Logging out..." />;
}

export { LoginForm, Logout };
