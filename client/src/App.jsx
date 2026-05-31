import './App.css'
import { useContext, useState, useEffect } from 'react';
import { Container, Row, Col, ListGroup, Badge, Spinner } from 'react-bootstrap';
import { Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom';

import Footer from './components/Footer.jsx';
import Header from './components/Header.jsx';
import { LoginForm, Logout } from './components/LoginView.jsx';

import UserContext from './contexts/UserContext.js';

import { getNetwork } from './api/api.js';
import { checkSession } from './api/auth.js'; 

function App() {
  const navigate = useNavigate();

  const [user, setUser] = useState({ id: undefined, username: undefined, name: undefined });
  const [authLoading, setAuthLoading] = useState(true);
  
  const [network, setNetwork] = useState({ stations: [], lines: [], segments: [] });
  const [loadingNetwork, setLoadingNetwork] = useState(true);

  useEffect(() => {
    checkSession()
      .then(result => {
        if (result) {
          setUser({ id: result.id, username: result.username, name: result.name });
        }
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, []);

  useEffect(() => {
    async function fetchNetwork() {
      try {
        setLoadingNetwork(true);
        const networkData = await getNetwork();
        setNetwork(networkData);
      } catch (ex) {
        console.error(ex);
        navigate('/error');
      } finally {
        setLoadingNetwork(false);
      }
    }

    if (user.id) {
      fetchNetwork();
    } else {
      setLoadingNetwork(false);
    }
  }, [user.id, navigate]);

  const doLogin = (newUser) => {
    setUser({ id: newUser.id, username: newUser.username, name: newUser.is });
    navigate('/home');
  }

  if (authLoading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Verifica sessione in corso...</p>
      </Container>
    );
  }

  return (
    <UserContext.Provider value={user}>
      <Container>
        <Routes>
          <Route path='/' element={<MainLayout doLogin={doLogin} />}>
            <Route index element={<LoginView />} />
            
            <Route path='home' element={
              loadingNetwork ? 
                <div className="mt-5 text-center"><Spinner animation="border" /></div> 
                : <HomeView network={network} />
            } />
            
            <Route path='login' element={<LoginForm doLogin={doLogin} />} />
            <Route path='logout' element={<Logout doLogin={doLogin} />} />
            <Route path='error' element={<h1 className="mt-5 text-danger">Errore di connessione al server</h1>} />
          </Route>
        </Routes>
      </Container>
    </UserContext.Provider>
  );
}

function MainLayout(props) {
  return (
    <>
      <Header doLogin={props.doLogin} />
      <Outlet />
      <Footer />
    </>
  );
}

function LoginView(props) {
  const user = useContext(UserContext);
  
  if (user.id)
    return <Navigate to='/home' replace />;

  return (
    <div className="mt-5">
      <h2>Welcome to Last Race!</h2>
      <p>Login to start your underground journey and build your route before time runs out.</p>
    </div>
  );
}

function HomeView({ network }) {
  const user = useContext(UserContext);
  const [selectedSegments, setSelectedSegments] = useState([]);

  if (!user.id)
    return <Navigate to='/login' replace />;

  // search inside the selectedSegments array and return true if find s
  const isSelected = (id) => selectedSegments.some(s => s.id === id);

  const toggleSegment = (seg) => {
    if (isSelected(seg.id)) {
      setSelectedSegments(prev => prev.filter(s => s.id !== seg.id));
    } else {
      setSelectedSegments(prev => [...prev, seg]);
    }
  };

  const availableSegments = network.segments.filter(s => !isSelected(s.id));

  return (
    <div className="mt-4">
      <Row>
        {/*COLONNA SINISTR*/}
        
        {/* le colonne in bootrstrap sono 12! e md=5 significa occupa 7 colonne su 12 */}
        <Col className="mb-4">
          <div className="sticky-top" style={{ top: '20px' }}>
            
            <img 
              src="lastrace_map_draft.jpg" 
              alt="Mappa Last Race" 
              className="img-fluid rounded border mb-3 shadow-sm" 
            />

            {selectedSegments.length > 0 && (
              <div className="bg-white p-3 border rounded shadow-sm">
                <h4 className="mb-1">Il tuo percorso</h4>
                <p className="text-muted small mb-3">Clicca su un segmento per rimuoverlo.</p>

                <ListGroup variant="flush">
                  {selectedSegments.map((seg, index) => (
                    <div key={seg.id} className="d-flex align-items-center mb-2">
                      <Badge bg="dark" pill className="me-2">
                        {index + 1}
                      </Badge>
                      
                      <div className="flex-grow-1">
                        <SegmentItem
                          seg={seg}
                          onClick={() => toggleSegment(seg)}
                          selected={true}
                        />
                      </div>
                    </div>
                  ))}
                </ListGroup>

                <button className="btn btn-primary w-100 mt-3 fw-bold">
                  CONFERMA PERCORSO
                </button>
              </div>
            )}
          </div>
        </Col>

        {/* COLONNA DESTRA, segmenti */}
        <Col md={4}>
          <div className="bg-white p-3 border rounded shadow-sm">
            <h4 className="mb-1">Segments</h4>
            <p className="text-muted small mb-3">Seleziona i segmenti per costruire il tuo percorso.</p>

            {availableSegments.length === 0 && (
              <p className="text-muted fst-italic">Tutti i segmenti sono stati selezionati.</p>
            )}

            <ListGroup>
              {availableSegments.map(seg => (
                <SegmentItem
                  key={seg.id}
                  seg={seg}
                  onClick={() => toggleSegment(seg)}
                  selected={false}
                />
              ))}
            </ListGroup>
          </div>
        </Col>
      </Row>
    </div>
  );
}

function SegmentItem({ seg, onClick, selected }) {
  const colorName = seg.color;

  return (
    <ListGroup.Item
      action
      onClick={onClick}
      className={`d-flex text-primary justify-content-between align-items-center mb-2 rounded`}
      // style={{ borderLeft: `10px solid var(--metro-${colorName})` }}
      style={{border: `1.5px solid var(--metro-${colorName})`}}
    >
      <div className="d-flex fw-bold align-items-center">
        <span>{seg.stationAName}</span>
        <i className="bi bi-arrow-left-right mx-2 text-secondary"></i>
        <span>{seg.stationBName}</span>
      </div>

      <div className="d-flex align-items-center">

        
        <i className={`bi fs-5 ${selected ? 'bi-x-circle' : 'bi-plus-circle'}`}></i>
      </div>
    </ListGroup.Item>
  );
}

export default App;