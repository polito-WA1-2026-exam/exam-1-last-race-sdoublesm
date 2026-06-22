import "./App.css";
import { useState, useEffect, useContext } from "react";
import { Button, Container, Row, Col } from "react-bootstrap";
import { Outlet, Route, Routes, useNavigate, Navigate } from "react-router-dom";
import Footer from "./components/Footer.jsx";
import Header from "./components/Header.jsx";
import { LoginForm, Logout } from "./components/LoginView.jsx";
import { PlanningView } from "./components/PlanningView.jsx";
import ErrorView from "./components/ErrorView.jsx";
import { ExecutionView } from "./components/ExecutionView.jsx";
import { LoadingView } from "./components/LoadingView.jsx";
import UserContext from "./contexts/UserContext.js";
import { checkSession } from "./api/auth.js";
import { RankingView } from "./components/RankingView.jsx";
import { SetupView } from "./components/SetupView.jsx";
import HomeView from "./components/HomeView.jsx";

function App() {
	const navigate = useNavigate();

	const [user, setUser] = useState(null);
	const [authLoading, setAuthLoading] = useState(true);
	const [gameResult, setGameResult] = useState(null);

	useEffect(() => {
		checkSession()
			.then((result) => {
				if (result) {
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
							element={<ErrorView />}
						/>
						<Route path="*" element={<Navigate to="/error" replace />} />
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

export default App;
