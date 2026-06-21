import { Link } from "react-router-dom";
import { Container } from "react-bootstrap";
function ErrorView() {

    return (
        <Container className="p-5 text-center mt-5" style={{ maxWidth: 900 }}>
            <div className="bg-dark text-white p-5 rounded-4 shadow-lg border">
                <i className="bi bi-x-octagon-fill text-danger mb-3 fs-1"></i>
                <h1>Something went wrong.</h1>
                <p className="text-secondary fs-5">Probably you shouldn't be here.</p>
                <Link to="/" className="btn btn-outline-light rounded px-4 mt-3 fw-bold">
                    <i className="bi bi-arrow-left mx-3"></i>
                    BACK TO HOMEPAGE
                </Link>
            </div>
        </Container>
    );
}

export default ErrorView;
