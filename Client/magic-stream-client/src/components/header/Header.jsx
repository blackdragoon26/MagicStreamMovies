import { useState } from 'react'
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import { useNavigate, NavLink, Link } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import SlixLogo from './SlixLogo'

const Header = ({ handleLogout }) => {
    const navigate = useNavigate();
    const { auth } = useAuth();

    return (
        <Navbar 
            expand="lg" 
            sticky="top" 
            style={{
                background: '#030304',
                borderBottom: '1px solid #121217',
                padding: '16px 0',
                zIndex: 1050
            }}
        >
            <Container>
                <Navbar.Brand 
                    as={Link} 
                    to="/" 
                    className="d-flex align-items-center gap-2"
                    style={{
                        fontWeight: '800',
                        fontSize: '1.4rem',
                        letterSpacing: '-0.5px',
                        color: '#fff',
                        textDecoration: 'none'
                    }}
                >
                    <SlixLogo size={30} />
                    <span style={{ color: '#fff', fontFamily: 'Outfit', letterSpacing: '1px' }}>SLIX</span>
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="main-navbar-nav" style={{ borderColor: 'rgba(255, 255, 255, 0.15)', filter: 'invert(1)' }} />
                
                <Navbar.Collapse id="main-navbar-nav">
                    <Nav className="me-auto ms-lg-4">
                        <Nav.Link 
                            as={NavLink} 
                            to="/" 
                            className="px-3"
                            style={({ isActive }) => ({
                                color: isActive ? '#ffffff' : '#8c8c9a',
                                fontWeight: isActive ? '700' : '500',
                                borderBottom: isActive ? '2px solid #e50914' : '2px solid transparent',
                                borderRadius: '0',
                                paddingBottom: '4px',
                                transition: 'var(--transition-cinematic)'
                            })}
                        >
                            Home
                        </Nav.Link>
                        <Nav.Link 
                            as={NavLink} 
                            to="/recommended" 
                            className="px-3"
                            style={({ isActive }) => ({
                                color: isActive ? '#ffffff' : '#8c8c9a',
                                fontWeight: isActive ? '700' : '500',
                                borderBottom: isActive ? '2px solid #e50914' : '2px solid transparent',
                                borderRadius: '0',
                                paddingBottom: '4px',
                                transition: 'var(--transition-cinematic)'
                            })}
                        >
                            Recommended
                        </Nav.Link>
                        {auth && auth.role === 'ADMIN' && (
                            <Nav.Link 
                                as={NavLink} 
                                to="/add-movie" 
                                className="px-3"
                                style={({ isActive }) => ({
                                    color: isActive ? '#ffffff' : '#8c8c9a',
                                    fontWeight: isActive ? '700' : '500',
                                    borderBottom: isActive ? '2px solid #e50914' : '2px solid transparent',
                                    borderRadius: '0',
                                    paddingBottom: '4px',
                                    transition: 'var(--transition-cinematic)'
                                })}
                            >
                                Add Movie
                            </Nav.Link>
                        )}
                    </Nav>
    
                    <Nav className="ms-auto align-items-center mt-3 mt-lg-0">
                        {auth ? (
                            <div className="d-flex align-items-center gap-3">
                                <div className="text-end">
                                    <span style={{ fontSize: '0.75rem', color: '#52525c', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Account
                                    </span>
                                    <span style={{ fontWeight: '600', color: '#ffffff' }}>
                                        {auth.first_name} {auth.last_name} 
                                        {auth.role === 'ADMIN' && (
                                            <span 
                                                className="badge bg-dark ms-2"
                                                style={{
                                                    fontSize: '0.7rem',
                                                    border: '1px solid #e50914',
                                                    color: '#e50914',
                                                    padding: '3px 6px',
                                                    verticalAlign: 'middle'
                                                }}
                                            >
                                                ADMIN
                                            </span>
                                        )}
                                    </span>
                                </div>
                                <Button 
                                    variant="outline-light" 
                                    size="sm" 
                                    onClick={handleLogout}
                                    style={{
                                        border: '1px solid rgba(255, 255, 255, 0.15)',
                                        color: '#ffffff',
                                        fontWeight: '500',
                                        padding: '6px 16px',
                                        borderRadius: '4px'
                                    }}
                                >
                                    Logout
                                </Button>
                            </div>
                        ) : (
                            <div className="d-flex align-items-center gap-2">
                                <Button
                                    variant="outline-info"
                                    size="sm"
                                    onClick={() => navigate("/login")} 
                                    style={{ padding: '8px 20px', borderRadius: '4px', fontSize: '0.9rem' }}
                                >
                                    Login
                                </Button>
                                <Button
                                    variant="info"
                                    size="sm"
                                    onClick={() => navigate("/register")}  
                                    style={{ padding: '8px 20px', borderRadius: '4px', fontSize: '0.9rem' }}
                                >
                                    Register
                                </Button>                        
                            </div>
                        )}
                    </Nav>       
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}
export default Header;