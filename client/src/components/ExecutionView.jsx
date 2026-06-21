import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Button, Container, Row, Col, Card } from "react-bootstrap";

function ExecutionView({ gameResult }) {
    const navigate = useNavigate();
    const timer = 40;
    const [currentStep, setCurrentStep] = useState(0);

    const [phase, setPhase] = useState("showSteps"); // showSteps or finalResult

    useEffect(() => {
        if (!gameResult) return;

        if (gameResult.status === "failed") {
            setPhase("finalResult");
            return;
        }

        if (
            phase === "showSteps" &&
            gameResult.events &&
            currentStep < gameResult.events.length
        ) {
            const timer = setTimeout(() => {
                setCurrentStep((prev) => prev + 1);
            }, timer * 1000);
            return () => clearTimeout(timer);
        } else if (
            phase === "showSteps" &&
            gameResult.events &&
            currentStep >= gameResult.events.length
        ) {
            setPhase("finalResult");
        }
    }, [currentStep, phase, gameResult]);

    if (!gameResult) {
        return <Navigate to="/error" replace />;
    }

    if (phase === "finalResult") {
        return (
            <Container className="text-center p-5 mt-4">
                <Card
                    className="shadow-lg rounded-4 p-5 mx-auto align-items-center"
                    style={{ maxWidth: 600 }}
                >
                    <h2 className="fw-bold mb-1 text-uppercase">
                        {gameResult.status === "failed"
                            ? "Mission Failed"
                            : "Mission Completed"}
                    </h2>
                    {gameResult.status === "failed" && (
                        <p className="text-danger fs-5 mb-4">
                            {gameResult.reason}
                        </p>
                    )}
                    <h1 className="fw-bold mb-3">
                        {gameResult.finalScore} <small className="bi bi-coin text-warning"></small>
                    </h1>
                    <p className="text-muted fs-5 mb-5">
                        {gameResult.status === "failed"
                            ? "You lost all your coins."
                            : "This is your final score. Great job!"}
                    </p>
                    <Button
                        variant="dark"
                        size="lg"
                        className="rounded px-5 fw-bold fs-4 mb-3"
                        onClick={() => navigate("/play")}
                    ><i class="bi bi-arrow-clockwise me-3"></i>
                        PLAY AGAIN
                    </Button>
                    <Button
                        size="md"
                        className="bg-white text-black rounded-pill fw-bold px-5"
                        onClick={() => navigate("/ranking")}
                    >
                        <i className="bi bi-trophy me-2"></i> Discover your rank
                    </Button>
                </Card>
            </Container>
        );
    }

    const displayedEvents = gameResult.events.slice(0, currentStep + 1);

    return (
        <Container className="p-4 mt-2" style={{ maxWidth: 800 }}>
            <div className="text-center mb-5">
                <h2 className="fw-bold">Executing Route...</h2>
                <p className="text-muted fs-5">Watch your steps and random events.</p>
            </div>

            <div className="d-flex flex-column gap-3">
                {displayedEvents.map((ev, idx) => (
                    <StepCard key={idx} event={ev} isActive={idx === currentStep} />
                ))}
            </div>
        </Container>
    );
}

function StepCard({ event, isActive }) {
    const isPositive = event.coinEffect > 0;
    const isNegative = event.coinEffect < 0;
    const colorClass = isPositive ? "text-success" : isNegative ? "text-danger" : "text-muted";
    const sign = isPositive ? "+" : "";

    return (
        <Card className={`mb-3 border rounded-4 ${isActive ? "border-primary bg-light" : "bg-white"}`}>
            <Card.Body className="p-4">
                <Row className="align-items-center">
                    <Col md={5} className="text-start">
                        <h5 className="fw-bold mb-1">{event.stationA}</h5>
                        <i className="bi bi-arrow-down text-muted small"></i>
                        <h5 className="fw-bold mb-0">{event.stationB}</h5>
                    </Col>
                    <Col md={4} className="text-center">
                        <p className="mb-0 fs-5 text-secondary">{event.eventDescription}</p>
                        <span className={`fw-bold fs-5 ${colorClass}`}>
                            {sign}{event.coinEffect} coins
                        </span>
                    </Col>
                    <Col md={3} className="text-end">
                        <h4 className="fw-bold mb-0">
                            Total: {event.updatedTotal} <i className="bi bi-coin text-warning"></i>
                        </h4>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
}

export { ExecutionView };
