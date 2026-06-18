import { useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import UserContext from "../contexts/UserContext";

function UserInfo({ user }) {
	return (
		<div className="d-flex align-items-center gap-3 border rounded-pill px-3 py-2 bg-white shadow-sm">
			<span className="badge border text-dark" title="Best Score">
				<i className="bi bi-trophy-fill text-warning me-1"></i>
				{user.bestScore}
			</span>

			<span className="fw-bold">{user.username}</span>

			<div className="d-flex align-items-center gap-1" title="Status: Online">
				<span
					className="metro-dot"
					style={{ background: "var(--metro-green)" }}
				/>
				<small className="text-secondary d-none d-md-inline">online</small>
			</div>

			<div className="vr"></div>

			<Link to="/logout" className="text-danger fs-5" title="Logout">
				<i className="bi bi-box-arrow-right"></i>
			</Link>
		</div>
	);
}

function Header() {
	const user = useContext(UserContext);
	const navigate = useNavigate();

	return (
		<header
			className="bg-white border-bottom sticky-top shadow-sm"
			style={{ zIndex: 100 }}
		>
			<div className="metro-stripe">
				<span style={{ background: "var(--metro-red)" }} />
				<span style={{ background: "var(--metro-yellow)" }} />
				<span style={{ background: "var(--metro-blue)" }} />
				<span style={{ background: "var(--metro-green)" }} />
			</div>

			<div className="d-flex align-items-center justify-content-between px-4 py-3">
				<div className="d-flex align-items-center gap-3">
					<Link
						to="/"
						className="metro-logo-title text-decoration-none text-dark m-0"
					>
						LastRace
					</Link>

					<div className="d-flex gap-1">
						<span
							className="metro-dot"
							style={{ background: "var(--metro-red)" }}
						/>
						<span
							className="metro-dot"
							style={{ background: "var(--metro-yellow)" }}
						/>
						<span
							className="metro-dot"
							style={{ background: "var(--metro-blue)" }}
						/>
						<span
							className="metro-dot"
							style={{ background: "var(--metro-green)" }}
						/>
					</div>

					<span className="text-secondary">| Survive the rails</span>
				</div>

				<div>
					{user.id ? (
						<UserInfo user={user} />
					) : (
						<button
							className="btn btn-dark fw-bold px-4 "
							onClick={() => navigate("/login")}
						>
							LOGIN
						</button>
					)}
				</div>
			</div>
		</header>
	);
}

export default Header;
