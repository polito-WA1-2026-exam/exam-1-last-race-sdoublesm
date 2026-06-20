import { Container, Spinner } from "react-bootstrap";

function LoadingView({ message = "Loading...", animation = "border" }) {
	return (
		<Container className="d-flex align-items-center justify-content-center gap-3 vh-100">
			<Spinner as="span" animation={animation} variant="secondary" />
			<p className="mt-2 text-muted mb-0">{message}</p>
		</Container>
	);
}

export { LoadingView };
