import { useContext } from "react";
import { useNavigate, Link } from "react-router-dom"; 
import UserContext from "../contexts/UserContext";

function UserInfo({ user }) {
  return (
    <div className="d-flex align-items-center gap-2 border rounded-pill px-3 py-1 bg-white shadow-sm">
      <i className="bi bi-person text-muted fs-5"></i>
      
      <span className="fw-bold" style={{ fontSize: '0.9rem' }}>{user.username}</span>
      
      {/* divisore verticale bootstrap */}
      <div className="vr mx-1"></div> 
      
      <Link to="/logout" className="text-danger text-decoration-none " style={{ fontSize: '0.85rem' }}>
        Logout
      </Link>
    </div>
  );
}

function Header() {
  const user = useContext(UserContext);
  const navigate = useNavigate();

  return (
    <header className="bg-white border-bottom sticky-top shadow-sm" style={{ zIndex: 100 }}>
      <div className="metro-stripe">
        <span style={{ background: "var(--metro-red)" }} />
        <span style={{ background: "var(--metro-yellow)" }} />
        <span style={{ background: "var(--metro-blue)" }} />
        <span style={{ background: "var(--metro-green)" }} />
      </div>

      <div className="d-flex align-items-center justify-content-between px-4 py-2">
        
        <div className="d-flex align-items-center gap-2">
          <div className="d-flex gap-1 me-1">
            <span className="metro-dot" style={{ background: "var(--metro-red)" }} />
            <span className="metro-dot" style={{ background: "var(--metro-yellow)" }} />
            <span className="metro-dot" style={{ background: "var(--metro-blue)" }} />
            <span className="metro-dot" style={{ background: "var(--metro-green)" }} />
          </div>
          <div className="metro-logo-title m-0">LastRace</div>
        </div>

        <div>
          {user.id
            ? <UserInfo user={user} />
            : <button 
                className="btn btn-primary fw-bold px-4" 
                onClick={() => navigate("/login")}
              >
                LOGIN
              </button>
          }
        </div>
      </div>
    </header>
  );
}

export default Header;