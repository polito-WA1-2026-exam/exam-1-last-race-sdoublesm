import { useState, useContext, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Row, Col, ListGroup, Badge, Spinner } from "react-bootstrap";

import { getNetwork } from "../api/api.js";
import UserContext from "../contexts/UserContext";

function PlanningView() {
	const user = useContext(UserContext);
	const navigate = useNavigate();

	const [network, setNetwork] = useState({
		stations: [],
		lines: [],
		segments: [],
	});
	const [loadingNetwork, setLoadingNetwork] = useState(true);
	const [selectedSegments, setSelectedSegments] = useState([]);

	const [timeLeft, setTimeLeft] = useState(90);

	if (!user.id) return <Navigate to="/login" replace />;

	// ! to fix condition call
	useEffect(() => {
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
	}, []);

	// ! to fix condition call
	useEffect(() => {
		async function fetchNetwork() {
			try {
				setLoadingNetwork(true);
				const networkData = await getNetwork();
				setNetwork(networkData);
			} catch (ex) {
				console.error(ex);
				navigate("/error");
			} finally {
				setLoadingNetwork(false);
			}
		}
		if (user.id) fetchNetwork();
		else setLoadingNetwork(false);
	}, [user.id, navigate]);

	const isSelected = (id) => selectedSegments.some((s) => s.id === id);

	const toggleSegment = (seg) => {
		if (timeLeft <= 0) return;

		if (isSelected(seg.id)) {
			setSelectedSegments((prev) => prev.filter((s) => s.id !== seg.id));
		} else {
			setSelectedSegments((prev) => [...prev, seg]);
		}
	};

	const availableSegments = network.segments.filter((s) => !isSelected(s.id));

	if (loadingNetwork) {
		return (
			<div className="mt-5 text-center">
				<Spinner animation="border" variant="primary" />
				<p className="mt-2 text-muted">Loading network...</p>
			</div>
		);
	}

	return (
		<div className="text-center p-4">
			<Row className="text-start">
				<Col md={8} className="mb-4">
					<div className="sticky-top" style={{ top: "20px" }}>
						<img
							src="complete_map.png"
							alt="LastRace map"
							className="img-fluid rounded border mb-3 shadow-sm w-100"
						/>

						{selectedSegments.length > 0 && (
							<div className="bg-white p-3 border rounded shadow-sm">
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
									className="btn btn-primary w-100 mt-3 fw-bold py-2"
									disabled={timeLeft <= 0}
								>
									{timeLeft <= 0 ? "TIME EXPIRED" : "CONFIRM ROUTE"}
								</button>
							</div>
						)}
					</div>
				</Col>

				<Col md={4}>
					<div
						className={`mb-4 p-4 rounded shadow-sm border text-center ${
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

					<div className="bg-white p-3 border rounded shadow-sm">
						<h4 className="mb-1">Segments</h4>
						<p className="text-muted small mb-3">
							Select the segments in sequence to build your route.
						</p>

						{availableSegments.length === 0 && (
							<p className="text-muted fst-italic">All segments selected.</p>
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
	const colorName = seg.color;

	return (
		<ListGroup.Item
			action
			onClick={onClick}
			className={`d-flex text-primary justify-content-between align-items-center mb-2 rounded`}
			style={{ border: `1.5px solid var(--metro-${colorName})` }}
		>
			<div className="d-flex fw-bold align-items-center">
				<span>{seg.stationAName}</span>
				<i className="bi bi-arrow-left-right mx-2 text-secondary"></i>
				<span>{seg.stationBName}</span>
			</div>
			<div className="d-flex align-items-center">
				<i
					className={`bi fs-5 ${selected ? "bi-x-circle" : "bi-plus-circle"}`}
				></i>
			</div>
		</ListGroup.Item>
	);
}

export { PlanningView };
