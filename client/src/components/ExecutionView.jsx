import { useState, useEffect, useContext } from "react";
import { useNavigate, Navigate, useParams } from "react-router-dom";
import { Button, Container, Row, Col, Card, Spinner } from "react-bootstrap";
import { getNetwork, getGame } from "../api/api.js";
import UserContext from "../contexts/UserContext";
import { LoadingView } from "./LoadingView.jsx";

function ExecutionView({ gameResult }) {
    const { gameId } = useParams();
    const user = useContext(UserContext);
    const navigate = useNavigate();
    const timer = 2.5; // step visualization each 1.5 secs
    const [currentStep, setCurrentStep] = useState(-1);

    const [phase, setPhase] = useState("showSteps");

    const [gameData, setGameData] = useState(null);
    const [network, setNetwork] = useState({ stations: [], lines: [], segments: [] });
    const [loadingData, setLoadingData] = useState(true);

    // calls GET /api/games/:gameId and GET /api/network per popolare gameData e network
    useEffect(() => {
        async function fetchData() {
            if (!user.id || !gameId) return;
            try {
                const gameInfo = await getGame(gameId);
                if (gameInfo.error) {
                    navigate("/error");
                    return;
                }
                const networkData = await getNetwork();
                setNetwork(networkData);
                setGameData(gameInfo);
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingData(false);
            }
        }
        fetchData();
    }, [user.id, gameId, navigate]);

    let effectiveGameResult = gameResult;
    if (!gameResult && gameData && gameData.status !== "playing") {
        effectiveGameResult = {
            status: gameData.status,
            finalScore: gameData.score,
            reason: gameData.status === "failed" ? "Invalid route." : "",
            events: []
        };
    }

    // gestione degli steps con timer
    useEffect(() => {
        if (!effectiveGameResult) return;

        // partita failed o senza eventi da mostrare (es. accesso diretto a /result) -> passo al risultato finale
        if (effectiveGameResult.status === "failed" || effectiveGameResult.events?.length === 0) {
            setPhase("finalResult");
            return;
        }

        // showSteps -> proseguo passo dopo passo con timer finchè non ho mostrato tutti gli steps
        if (phase === "showSteps" && effectiveGameResult.events && currentStep < effectiveGameResult.events.length) {
            const timeoutId = setTimeout(() => {
                setCurrentStep((prev) => prev + 1);
            }, timer * 1000);
            return () => clearTimeout(timeoutId);
        } else if (
            phase === "showSteps" &&
            effectiveGameResult.events &&
            currentStep >= effectiveGameResult.events.length
        ) {
            setPhase("finalResult");
        }
    }, [currentStep, phase, gameResult, gameData]);

    if (!user.id) return <Navigate to="/login" replace />;

    if (loadingData) {
        return <LoadingView message="Loading results..." />;
    }

    if (!effectiveGameResult) {
        return <Navigate to="/error" replace />;
    }

    const startStationName = network.stations.find((s) => s.id === gameData?.startStationId)?.name || "..";
    const destStationName = network.stations.find((s) => s.id === gameData?.destinationStationId)?.name || "..";

    const displayedEvents = effectiveGameResult.events ? effectiveGameResult.events.slice(0, currentStep + 1) : [];

    let currentCoins = 20; // default initial coins
    if (displayedEvents.length > 0) {
        currentCoins = displayedEvents[displayedEvents.length - 1].updatedTotal;
    }

    return (
        <div className="text-center p-4">
            <Row className="text-start">
                <Col md={7} className="mb-4">
                    {loadingData ? (
                        <div className="text-center my-5"><Spinner animation="border" /></div>
                    ) : (
                        <div className="bg-dark text-center text-white rounded-4 shadow-lg p-3 mb-3">
                            <div className="text-uppercase text-secondary fw-bold">
                                Your Mission

                            </div>

                            <div className="fs-4 fw-bold">
                                <span style={{ color: "var(--metro-yellow)" }}>{startStationName}</span>
                                <i className="bi bi-arrow-right mx-3"></i>
                                <span style={{ color: "var(--metro-yellow)" }}>{destStationName}</span>
                            </div>
                        </div>
                    )}

                    <img
                        src="/complete_map.png"
                        className="img-fluid bg-white rounded-4 p-3 mb-3 shadow-sm"
                    />
                </Col>

                <Col md={5}>
                    {phase === "finalResult" && (
                        <Card className="shadow-sm rounded-4 p-4 text-center border mb-3">
                            <h3 className="fw-bold mb-1 text-uppercase">
                                {effectiveGameResult.status === "failed" ? "Mission Failed" : "Mission Completed"}
                            </h3>
                            {effectiveGameResult.status === "failed" && (
                                <p className="text-danger fs-5 mb-3">{effectiveGameResult.reason}</p>
                            )}
                            <h1 className="fw-bold mb-3">
                                {effectiveGameResult.finalScore} <i className="bi bi-coin text-warning fs-2"></i>
                            </h1>
                            <p className="text-muted mb-4">
                                {effectiveGameResult.status === "failed"
                                    ? "You lost all your coins."
                                    : "This is your final score. Great job!"}
                            </p>
                            <Button
                                variant="dark"
                                className="w-100 fw-bold mb-2 py-2"
                                onClick={() => navigate("/play")}
                            >
                                <i className="bi bi-arrow-clockwise me-2"></i> PLAY AGAIN
                            </Button>
                            <Button
                                size="md"
                                className="bg-white text-black rounded-pill fw-bold px-5"
                                onClick={() => navigate("/ranking")}
                            >
                                <i className="bi bi-trophy me-2"></i> Discover your rank
                            </Button>
                            <Button
                                variant="dark"
                                className="w-100 fw-bold rounded-pill mt-2 py-2"
                                onClick={() => navigate("/")}
                            >
                                <i className="bi bi-arrow-left mx-3"></i>
                                BACK TO HOMEPAGE
                            </Button>
                        </Card>
                    )}

                    {effectiveGameResult.status !== "failed" && effectiveGameResult.events?.length > 0 && gameData && (
                        <div className="bg-white p-4 border rounded-4 shadow-sm mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="mb-0 text-uppercase">YOUR JOURNEY</h4>
                                <div className="bg-light border rounded-3 px-3 py-1 fs-5">
                                    <span className="fw-bold text-secondary me-2">CURRENT COINS:</span>
                                    <span className="fw-bold">{currentCoins} <i className="bi bi-coin text-warning fs-5"></i></span>
                                </div>
                            </div>

                            <div className="d-flex flex-column gap-2" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                {displayedEvents.map((ev, idx) => (
                                    <StepCard key={idx} event={ev} />
                                ))}
                            </div>
                        </div>
                    )}
                </Col>
            </Row>
        </div>
    );
}

function StepCard({ event }) {
    const isPositive = event.coinEffect > 0;
    const isNegative = event.coinEffect < 0;
    const colorClass = isPositive ? "text-success" : isNegative ? "text-danger" : "text-muted";
    const sign = isPositive ? "+" : "";

    return (
        <Card className="rounded-4 bg-white shadow-sm">
            <Card.Body className="p-3 mx-3">
                <div className="d-flex justify-content-between align-items-center">
                    <div className="text-start me-3">
                        <div className="fw-bold">
                            {event.stationA} <i className="bi bi-arrow-right mx-1"></i> {event.stationB}
                        </div>
                    </div>
                    <div className="text-end">
                        <div className="text-secondary">{event.eventDescription}</div>
                        <div className={`fw-bold ${colorClass}`}>
                            {sign}{event.coinEffect} coins
                        </div>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
}

export { ExecutionView };
