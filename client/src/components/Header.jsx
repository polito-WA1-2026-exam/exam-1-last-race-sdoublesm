import { useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import UserContext from "../contexts/UserContext";

function UserInfo({ user }) {
	console.log(user);
	return (
		<div className="d-flex align-items-center gap-2 border rounded-pill px-4 py-2 bg-white shadow-sm">
			<span
				className="badge bg-light text-dark border d-flex align-items-center me-1"
				style={{ fontSize: "0.85rem" }}
			>
				<i className="bi bi-trophy-fill text-warning me-2"></i>
				{user.bestScore}
			</span>

			<span className="fw-bold">{user.username}</span>

			<div className="d-flex align-items-center gap-1" title="Status: Online">
				<span
					className="metro-dot me-1"
					style={{ background: "var(--metro-green)" }}
				/>
				<span
					className="text-secondary d-none d-md-inline"
					style={{ fontSize: "0.85rem" }}
				>
					online
				</span>
			</div>

			<div className="vr mx-1"></div>

			<Link
				to="/logout"
				className="text-danger text-decoration-none fs-5 ms-1"
				title="Logout"
			>
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

			<div className="d-flex align-items-center justify-content-between px-4 py-1 mt-2 mb-2">
				<div className="d-flex align-items-center gap-2">
					<div className="metro-logo-title m-0">
						<Link to="/" className="text-decoration-none text-dark">
							LastRace
						</Link>
					</div>
					<span
						className="metro-dot"
						style={{ background: "var(--metro-red)", marginLeft: "10px" }}
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

				<div>
					{user.id ? (
						<UserInfo user={user} />
					) : (
						<button
							className="btn btn-primary fw-bold px-4"
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
