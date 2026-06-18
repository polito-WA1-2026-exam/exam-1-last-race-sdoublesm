import { useState, useContext } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Container, Row, Col, Spinner } from "react-bootstrap";

import { startGame } from "../api/api.js";
import UserContext from "../contexts/UserContext.js";

function SetupView() {
	const user = useContext(UserContext);
	const navigate = useNavigate();

	const [starting, setStarting] = useState(false);

	if (!user.id) return <Navigate to="/login" replace />;

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
		<Container className="mt-4 text-center bg-white rounded-4 py-5 px-3 shadow-lg ">
			<Row className="justify-content-center">
				<Col md={10} lg={8}>
					<div className="mb-4">
						<h1 className="fw-bold">Phase 1: Setup</h1>
						<p className="text-secondary text-start">
							Study the undergorund map carefully. The network will not change
							during the game. When you're ready, begin the mission to reach
							your destination. Be fast, you only have 90 seconds!
						</p>
					</div>

					<div className="bg-white my-5">
						<img
							src="/complete_map.png"
							alt="Complete map"
							className="img-fluid rounded"
						/>
					</div>

					<div className="d-grid gap-2 col-md-6 mx-auto mb-5">
						<button
							className="btn btn-dark fw-bold fs-5 py-3 text-uppercase"
							style={{ letterSpacing: "1px" }}
							onClick={handleStartGame}
							disabled={starting}
						>
							{starting ? (
								<>
									<Spinner
										as="span" // lo trasforma in uno span (elemento inline) per allineam.
										animation="grow"
										size="sm"
										variant="secondary"
										className="me-2"
									/>
									Starting...
								</>
							) : (
								<>
									<i class="bi bi-compass"></i> Start the mission
								</>
							)}
						</button>
					</div>
				</Col>
			</Row>
		</Container>
	);
}

export { SetupView };
