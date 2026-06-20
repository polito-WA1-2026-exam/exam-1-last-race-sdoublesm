import { useState, useContext, useEffect } from "react";
import { useNavigate, Navigate, useParams } from "react-router-dom";
import { Row, Col, ListGroup, Badge, Spinner } from "react-bootstrap";
import { getNetwork, getGame, submitRoute } from "../api/api.js";
import UserContext from "../contexts/UserContext";
import dayjs from "dayjs";
import ErrorView from "./ErrorView.jsx";
import { LoadingView } from "./LoadingView.jsx";

function PlanningView(props) {
	const { gameId } = useParams();
	const user = useContext(UserContext);
	const navigate = useNavigate();

	const [gameData, setGameData] = useState(null);
	const [loadingGame, setLoadingGame] = useState(true);

	const [submitting, setSubmitting] = useState(false);

	const [network, setNetwork] = useState({
		stations: [],
		lines: [],
		segments: [],
	});
	const [loadingNetwork, setLoadingNetwork] = useState(true);

	const [selectedSegments, setSelectedSegments] = useState([]);
	const [timeLeft, setTimeLeft] = useState(90);

	useEffect(() => {
		async function fetchData() {
			if (!user.id || !gameId) return;
			try {
				setLoadingNetwork(true);
				setLoadingGame(true);

				const gameInfo = await getGame(gameId);

				if (gameInfo.error) {
					navigate("/error", { state: { msg: gameInfo.error } });
					return;
				}

				const networkData = await getNetwork();
				setNetwork(networkData);
				setGameData(gameInfo);
			} catch (e) {
				navigate("/error");
			} finally {
				setLoadingNetwork(false);
				setLoadingGame(false);
			}
		}
		fetchData();
	}, [user.id, gameId, navigate]);

	useEffect(() => {
		if (!user.id || !gameData) return;

		// ! calcoliamo tempo rimanente rispetto a db
		// utile se la pagina viene ricaricata
		const calculateRemainingTime = () => {
			const now = dayjs();
			const elapsedSeconds = now.diff(gameData.startedAt, "second");
			const remaining = 90 - elapsedSeconds;

			return remaining > 0 ? remaining : 0;
		};

		setTimeout(() => setTimeLeft(calculateRemainingTime()), 0);

		const timerId = setInterval(() => {
			setTimeLeft((prev) => {
				if (prev <= 1) {
					clearInterval(timerId);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timerId);
	}, [user.id, gameData]);

	const startStationName =
		network.stations.find((s) => s.id === gameData?.startStationId)?.name ||
		"None";

	const destStationName =
		network.stations.find((s) => s.id === gameData?.destinationStationId)
			?.name || "None";

	if (!user.id) return <Navigate to="/login" replace />;

	const isSelected = (id) => selectedSegments.some((s) => s.id === id);

	const toggleSegment = (seg) => {
		if (timeLeft <= 0 || submitting) return;

		if (isSelected(seg.id)) {
			setSelectedSegments((prev) => prev.filter((s) => s.id !== seg.id));
		} else {
			setSelectedSegments((prev) => [...prev, seg]);
		}
	};

	const handleSubmitRoute = async () => {
		const segmentIds = selectedSegments.map((seg) => seg.id);
		setSubmitting(true);

		try {
			const result = await submitRoute(gameId, segmentIds);
			props.setGameResult(result);
			navigate(`/play/${gameId}/result`);
		} catch (error) {
			console.error("Errore durante la submission:", error);
			setSubmitting(false);
		}
	};

	useEffect(() => {
		if (timeLeft === 0 && gameData?.status === "playing" && !submitting) {
			handleSubmitRoute();
		}
	}, [timeLeft, gameData, submitting]);

	const availableSegments = network.segments.filter((s) => !isSelected(s.id));

	if (loadingNetwork || loadingGame) {
		return <LoadingView message="Loading map and routes.." animation="grow" />;
	}

	if (gameData && gameData.status !== "playing") {
		return (
			<ErrorView title={"Mission terminated"} subtitle={"Compl or ended."} />
		);
	}

	return (
		<div className="text-center p-4">
			<Row className="text-start">
				<Col md={8} className="mb-4">
					{gameData && (
						<div className="bg-dark text-center text-white rounded-4 shadow-lg p-3 mb-4">
							<div className="text-uppercase text-secondary fw-bold">
								Your Mission
							</div>

							<div className="fs-4 fw-bold">
								<span>{startStationName}</span>
								<i className="bi bi-arrow-right mx-3"></i>
								<span>{destStationName}</span>
							</div>
						</div>
					)}
					<div>
						<img
							src="/complete_map.png"
							className="img-fluid rounded-4 border mb-3 shadow-sm "
						/>

						{selectedSegments.length > 0 && (
							<div className="bg-white p-4 border rounded-4 shadow-sm">
								<h4 className="mb-1">Your route</h4>
								<p className="text-muted small mb-3">
									Click on a segment to remove it.
								</p>

								<ListGroup variant="flush">
									{selectedSegments.map((seg, index) => (
										<div
											key={seg.id}
											className="d-flex align-items-center mb-2"
										>
											<Badge bg="dark" pill className="me-2">
												{index + 1}
											</Badge>
											<div className="flex-grow-1">
												<SegmentItem
													seg={seg}
													onClick={() => toggleSegment(seg)}
													selected={true}
												/>
											</div>
										</div>
									))}
								</ListGroup>

								<button
									className="btn btn-dark w-100 mt-3 fw-bold py-2 text-uppercase"
									disabled={selectedSegments.length === 0 || submitting}
									onClick={handleSubmitRoute}
								>
									{submitting ? (
										<>
											<Spinner
												as="span" // lo trasforma in uno span (elemento inline) per allineam.
												animation="grow"
												size="sm"
												variant="secondary"
												className="me-2"
											/>
											Submitting...
										</>
									) : (
										"CONFIRM ROUTE"
									)}
								</button>
							</div>
						)}
					</div>
				</Col>

				<Col md={4}>
					<div
						className={`mb-4 p-4 rounded-4 border text-center ${
							timeLeft <= 10
								? "bg-danger text-white border-danger"
								: "bg-white text-dark"
						}`}
					>
						<h5
							className={`mb-1 ${timeLeft <= 10 ? "text-white" : "text-muted"}`}
						>
							TIME LEFT
						</h5>
						<div className="display-6 fw-bold">
							<i className="bi bi-stopwatch me-3"></i>
							{timeLeft}s
						</div>
					</div>

					<div className="bg-white p-3 border rounded-4 shadow-sm">
						<h4 className="mb-1">Segments</h4>
						<p className="text-muted small mb-3">
							Select the segments in sequence to build your route.
						</p>

						{availableSegments.length === 0 && (
							<p className="text-muted">All segments selected.</p>
						)}

						<ListGroup>
							{availableSegments.map((seg) => (
								<SegmentItem
									key={seg.id}
									seg={seg}
									onClick={() => toggleSegment(seg)}
									selected={false}
								/>
							))}
						</ListGroup>
					</div>
				</Col>
			</Row>
		</div>
	);
}

function SegmentItem({ seg, onClick, selected }) {
	// const colorName = seg.color;

	return (
		<ListGroup.Item
			action
			onClick={onClick}
			className="d-flex text-dark justify-content-between align-items-center mb-2 rounded-4"
			style={{
				border: `2.5px solid var(--metro-border)`,
				// borderLeft: `10px solid var(--metro-${colorName})`,
			}}
		>
			<div className="d-flex fw-bold align-items-center">
				{" "}
				<span>{seg.stationAName}</span>
				<small className="mx-2 text-secondary">
					<i className="bi bi-arrow-left-right"></i>
				</small>
				<span>{seg.stationBName}</span>
			</div>

			<div className="d-flex align-items-center">
				<i
					className={`bi ${selected ? "bi-x-circle text-danger" : "bi-plus-circle text-dark"}`}
				/>
			</div>
		</ListGroup.Item>
	);
}

export { PlanningView };
