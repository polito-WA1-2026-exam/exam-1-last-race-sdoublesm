import "./App.css";
import { useState, useEffect, useContext } from "react";
import { Button, Container, Row, Col } from "react-bootstrap";
import { Outlet, Route, Routes, useNavigate } from "react-router-dom";
import Footer from "./components/Footer.jsx";
import Header from "./components/Header.jsx";
import { LoginForm, Logout } from "./components/LoginView.jsx";
import { PlanningView } from "./components/PlanningView.jsx";
import { ExecutionView } from "./components/ExecutionView.jsx";
import { LoadingView } from "./components/LoadingView.jsx";
import UserContext from "./contexts/UserContext.js";
import { checkSession } from "./api/auth.js";
import { RankingView } from "./components/RankingView.jsx";
import { SetupView } from "./components/SetupView.jsx";

function App() {
	const navigate = useNavigate();

	const [user, setUser] = useState({
		id: undefined,
		username: undefined,
		name: undefined,
	});
	const [authLoading, setAuthLoading] = useState(true);
	const [gameResult, setGameResult] = useState(null);

	useEffect(() => {
		checkSession()
			.then((result) => {
				if (result) {
					console.log("current_user: ", result);
					setUser(result);
				}
			})
			.finally(() => {
				setAuthLoading(false);
			});
	}, []);

	const doLogin = (newUser) => {
		setUser(newUser);
		navigate("/");
	};

	if (authLoading) {
		return <LoadingView message="Checking session..." animation="border" />;
	}

	return (
		<UserContext.Provider value={user}>
			<Container fluid className="p-0">
				<Routes>
					<Route path="/" element={<MainLayout doLogin={doLogin} />}>
						<Route index element={<HomeView />} />

						<Route path="play" element={<SetupView />} />
						<Route
							path="/play/:gameId/result"
							element={<ExecutionView gameResult={gameResult} />}
						/>
						<Route
							path="/play/:gameId"
							element={<PlanningView setGameResult={setGameResult} />}
						/>

						<Route path="ranking" element={<RankingView />} />
						<Route path="login" element={<LoginForm doLogin={doLogin} />} />
						<Route path="logout" element={<Logout doLogin={doLogin} />} />
						<Route
							path="error"
							element={<h1 className="mt-5 text-danger text-center">[!]</h1>}
						/>
					</Route>
				</Routes>
			</Container>
		</UserContext.Provider>
	);
}

function MainLayout(props) {
	return (
		<>
			<Header doLogin={props.doLogin} />
			<Outlet />
			<Footer />
		</>
	);
}

function Rules() {
	return (
		<div className="bg-white rounded-4 shadow mt-2 p-5">
			<h1 className="mb-4 fw-bold text-center">Rules: How to play?</h1>
			<p className="text-center mb-0 fs-5 mb">
				Mind the gap. Make the connection. Survive the rails.
			</p>

			{/* mx-auto centra orizzontalmente */}
			<div className="mx-auto" style={{ maxWidth: 900 }}>
				<Row className="align-items-center mb-4">
					<Col xs="auto" className="pe-4">
						<i className="display-5 bi bi-map text-primary"></i>
					</Col>
					{/* text-start forza il testo allineato a sinistra */}
					<Col className="text-start">
						<h4 className="fw-bold mb-1">1. Setup</h4>
						<p className="text-muted mb-0 fs-5">
							You start the game with <strong>20 coins</strong>. Carefully
							observe the complete map of the underground network and prepare
							for the mission.
						</p>
					</Col>
				</Row>

				<Row className="align-items-center mb-4">
					<Col xs="auto" className="pe-4">
						<i className="display-5 bi bi-stopwatch text-primary"></i>
					</Col>
					<Col className="text-start">
						<h4 className="fw-bold mb-1">2. Planning</h4>
						<p className="text-muted mb-0 fs-5">
							You have <strong>90 seconds</strong>. The map hides the lines. You
							will be assigned a starting and a destination station: select the
							segments in sequence to create a valid route before time runs out.
						</p>
					</Col>
				</Row>

				<Row className="align-items-center mb-4">
					<Col xs="auto" className="pe-4">
						<i className="display-5 bi bi-train-front text-primary"></i>
					</Col>
					<Col className="text-start">
						<h4 className="fw-bold mb-1">3. Execution</h4>
						<p className="text-muted mb-0 fs-5">
							The route is executed step by step. Watch out for the unexpected:
							at each stop, a <strong>random event</strong> will make you gain
							or lose coins. If the submitted route is invalid, you lose all
							your coins!
						</p>
					</Col>
				</Row>

				<Row className="align-items-center">
					<Col xs="auto" className="pe-4">
						<i className="display-5 bi bi-award text-primary"></i>
					</Col>
					<Col className="text-start">
						<h4 className="fw-bold mb-1">4. Result</h4>
						<p className="text-muted mb-0 fs-5">
							Reach your destination with as many coins as possible. Registered
							players compete in the <strong>General Ranking</strong> with their
							best score.
						</p>
					</Col>
				</Row>
			</div>
		</div>
	);
}

function HomeView() {
	const user = useContext(UserContext);
	const navigate = useNavigate();

	return (
		<Container className="mt-2">
			<div className="text-center bg-white p-5 my-4 rounded-4 shadow">
				<h1 className="fw-bold mb-3">Welcome to LastRace!</h1>
				{user.id ? (
					// utente loggato
					<>
						<p className="text-muted fs-5">
							Welcome back, <strong>{user.name || user.username}</strong>! Are
							you ready to continue your underground journey?
						</p>
						<Button
							variant="primary"
							size="lg"
							className="fw-bold px-5 mt-2 fs-4"
							onClick={() => navigate("/play")}
						>
							<i className="bi bi-controller me-2"></i> START THE GAME
						</Button>
						<p className="text-muted fs-5 mt-4">Curious about results?</p>
						<Button
							size="md"
							className="bg-white text-black rounded-pill fw-bold px-5"
							onClick={() => navigate("/ranking")}
						>
							<i className="bi bi-trophy me-2"></i> Discover your rank
						</Button>
					</>
				) : (
					// visitatore non loggato
					<>
						<p className="lead text-muted mb-4 fs-5">
							Login to start your underground journey and build your route
							before time runs out.
						</p>
						<Button
							size="lg"
							className="rounded-pill fw-bold px-5 mt-2"
							onClick={() => navigate("/login")}
						>
							<i className="bi bi-box-arrow-in-right me-2"></i> LOGIN TO PLAY
						</Button>
					</>
				)}
			</div>
			<Rules />
		</Container>
	);
}

export default App;
