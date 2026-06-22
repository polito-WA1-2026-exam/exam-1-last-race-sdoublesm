import { useState, useEffect, useContext } from "react";
import { Table, Spinner, Badge } from "react-bootstrap";
import { getRanking } from "../api/api.js";
import UserContext from "../contexts/UserContext.js";
import { useNavigate } from "react-router";
import { LoadingView } from "./LoadingView.jsx";

function RankingView() {
	const [ranking, setRanking] = useState([]);
	const [loading, setLoading] = useState(true);

	const user = useContext(UserContext);
	const navigate = useNavigate();

	useEffect(() => {
		async function fetchRanking() {
			if (!user?.id) return;
			try {
				setLoading(true);
				const data = await getRanking();
				// returns an array of [.., { id, username, bestScore, totalGames}] 
				setRanking(data);
			} catch (error) {
				navigate("/error");
			} finally {
				setLoading(false);
			}
		}

		fetchRanking();
	}, [user?.id]);

	if (!user?.id) return <Navigate to="/login" replace />;

	if (loading) {
		return <LoadingView message="Loading ranking..." animation="grow" />;
	}

	return (
		<div className="container mt-4 p-5 bg-white rounded-4 shadow-lg">
			<div className="text-center mb-4">
				<h2>General Ranking</h2>
				<p className="text-secondary">
					Only the fastest survive the rails. Do you have what it takes to climb
					to the top?
				</p>
			</div>

			<Table bordered hover responsive className="text-center">
				<thead className="table-dark">
					<tr>
						<th className="col-md-2">Position</th>
						<th className="col-md-6">Username</th>
						<th className="col-md-2">Best Score</th>
						<th className="col-md-2">Total Games</th>
					</tr>
				</thead>
				<tbody>
					{ranking.map((player) => {
						const isCurrentUser = user && user.id === player.id;

						return (
							<tr
								key={player.id}
								// table-active crea un leggero sfondo grigio, fw-bold rende il testo in grassetto
								className={isCurrentUser ? "table-active fw-bold" : ""}
							>
								<td>{player.position}°</td>

								<td className="text-center">
									{player.username}
									{isCurrentUser && (
										<Badge className="ms-3 bg-secondary">You</Badge>
									)}
								</td>

								<td>{player.bestScore}</td>
								<td>{player.totalGames}</td>
							</tr>
						);
					})}

					{ranking.length === 0 && (
						<tr>
							<td colSpan="4" className="text-center py-4 text-secondary">
								Ranking not available.
							</td>
						</tr>
					)}
				</tbody>
			</Table>
		</div>
	);
}

export { RankingView };
