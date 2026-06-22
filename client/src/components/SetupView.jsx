import { useState, useContext } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Container, Spinner, Row, Col } from "react-bootstrap";

import { startGame } from "../api/api.js";
import UserContext from "../contexts/UserContext.js";

function SetupView() {
	const user = useContext(UserContext);
	const navigate = useNavigate();

	const [starting, setStarting] = useState(false);

	if (!user?.id) return <Navigate to="/login" replace />;

	const handleStartGame = async () => {
		try {
			setStarting(true);
			const newGameData = await startGame(); // chiama POST /api/games
			// che ritorna {gameId, startStationId, destinationStationId, startedAt}

			// ! redirect a planning phase PASSANDO VIA PARAM il gameId
			navigate(`/play/${newGameData.gameId}`);
		} catch (error) {
			console.error("Error while starting a new game.", error);
			navigate("/error");
		} finally {
			setStarting(false);
		}
	};

	return (
		<Container
			className="m-5 p-5 text-start bg-white rounded-4 shadow-lg"
		>
			<Row className="align-items-center">
				<Col md={7} className="text-center me-3">
					<img
						src="/complete_map.png"
						className="img-fluid bg-white rounded-4 my-5"
						alt="Complete Map"
					/>
				</Col>
				<Col md={4}>
					<h2 className="fw-bold mb-3">Phase 1: Setup</h2>
					<p className="text-secondary mb-4">
						Study the underground map carefully. The network will not change
						during the game. <br />When you're ready, begin the mission to reach
						your destination. Be fast, you only have 90 seconds!
					</p>
					<button
						className="btn btn-dark fw-bold fs-5 py-3 text-uppercase w-100"
						style={{ letterSpacing: "1px" }}
						onClick={handleStartGame}
						disabled={starting}
					>
						{starting ? (
							<>
								<Spinner
									as="span"
									animation="grow"
									size="sm"
									variant="secondary"
									className="me-2"
								/>
								Starting...
							</>
						) : (
							<>
								<i className="bi bi-compass me-2"></i> Start the mission
							</>
						)}
					</button>
				</Col>
			</Row>
		</Container >
	);
}

export { SetupView };
