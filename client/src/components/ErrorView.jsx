import { Link } from "react-router-dom";
import { Container } from "react-bootstrap";
function ErrorView() {

    return (
        <Container className="p-5 text-center mt-5" style={{ maxWidth: 900 }}>
            <div className="bg-dark text-white p-5 rounded-4 shadow-lg border">
                <i className="bi bi-x-octagon-fill text-danger mb-3 fs-1"></i>
                <h1>Are you lost?</h1>
                <p className="text-secondary fs-5">You probably shouldn't be here. We can't seem to find the page you're looking for.</p>
                <Link to="/" className="btn btn-outline-light rounded px-4 mt-3 fw-bold">
                    GO BACK TO HOME PAGE
                </Link>
            </div>
        </Container>
    );
}

export default ErrorView;
