import { useState, useEffect, useContext } from "react";
import { Table, Spinner, Badge } from "react-bootstrap";
import { getRanking } from "../api/api.js";
import UserContext from "../contexts/UserContext.js";

function RankingView() {
	const [ranking, setRanking] = useState([]);
	const [loading, setLoading] = useState(true);

	const user = useContext(UserContext);

	useEffect(() => {
		async function fetchRanking() {
			try {
				setLoading(true);
				const data = await getRanking();
				setRanking(data || []);
			} catch (error) {
				console.error("Error while loading ranking", error);
			} finally {
				setLoading(false);
			}
		}

		fetchRanking();
	}, []);

	if (loading) {
		return (
			<div className="mt-5 text-center">
				<Spinner animation="grow" />
				<p className="mt-2">Loading ranking...</p>
			</div>
		);
	}

	return (
		<div className="container mt-4">
			<div className="text-center mb-4">
				<h2>General Ranking</h2>
				<p className="text-secondary">Best underground players.</p>
			</div>

			<Table bordered hover responsive className="text-center">
				<thead className="table-dark">
					<tr>
						<th>Pos</th>
						<th>Player</th>
						<th>Best Score</th>
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

								<td>
									{player.username}
									{isCurrentUser && (
										<Badge className="ms-2 bg-secondary">You</Badge>
									)}
								</td>

								<td>{player.best_score}</td>
							</tr>
						);
					})}

					{ranking.length === 0 && (
						<tr>
							<td colSpan="3" className="text-center py-4 text-secondary">
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
