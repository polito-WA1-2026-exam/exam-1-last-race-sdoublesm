import { useState, useContext } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Container, Spinner } from "react-bootstrap";

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
		<Container
			className="mt-4 text-center bg-white rounded-4 p-5 shadow-lg"
		>

			<h2 className="fw-bold">Phase 1: Setup</h2>

			<p className="text-secondary mx-5">
				Study the undergorund map carefully. The network will not change
				during the game. <br />When you're ready, begin the mission to reach
				your destination. Be fast, you only have 90 seconds!
			</p>


			<div className="bg-white my-5">
				<img
					src="/complete_map.png"
					className="img-fluid bg-white rounded-4 mb-3 mx-auto"
					style={{ maxWidth: "700px" }}
				/>
			</div>

			<div className="d-flex justify-content-center gap-2 mx-auto">
				<button
					className="btn btn-dark fw-bold fs-5 px-5 py-3 text-uppercase"
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
		</Container>
	);
}

export { SetupView };
