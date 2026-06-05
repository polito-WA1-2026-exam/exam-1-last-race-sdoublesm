import { useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import UserContext from "../contexts/UserContext";

function UserInfo({ user }) {
	return (
		<div className="d-flex align-items-center gap-2 border rounded-pill px-4 py-2 bg-white shadow-sm">
			<span className="fw-bold">{user.username}</span>
			<span
				className="metro-dot"
				style={{ background: "var(--metro-green)" }}
			/>
			<span className="text-secondary" style={{ fontSize: "0.9rem" }}>
				online
			</span>
			{/* divisore verticale bootstrap */}
			<div className="vr mx-1"></div>

			<Link to="/logout" className="text-danger text-decoration-none fw-bold">
				<i class="bi bi-box-arrow-in-right"></i>
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

			<div className="d-flex align-items-center justify-content-between px-4 py-2 mt-2 mb-2">
				<div className="d-flex align-items-center gap-2">
					<img src="/favicon.svg" alt="" />
					<div className="metro-logo-title m-0">
						<Link to="/" className="text-decoration-none text-dark">
							Last Race
						</Link>
					</div>
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
