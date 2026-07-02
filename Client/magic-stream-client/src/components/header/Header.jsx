import { useState } from 'react'
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import { useNavigate, NavLink, Link } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import logo from '../../assets/MagicStreamLogo.png'

const Header = ({ handleLogout }) => {
    const navigate = useNavigate();
    const { auth } = useAuth();

    return (
        <Navbar 
            expand="lg" 
            sticky="top" 
            style={{
                background: 'rgba(7, 7, 10, 0.75)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '16px 0',
                zIndex: 1050
            }}
        >
            <Container>
                <Navbar.Brand 
                    as={Link} 
                    to="/" 
                    className="d-flex align-items-center"
                    style={{
                        fontWeight: '800',
                        fontSize: '1.5rem',
                        letterSpacing: '-0.5px',
                        color: '#fff',
                        textDecoration: 'none'
                    }}
                >
                    <img
                        alt="Magic Stream Logo"
                        src={logo}
                        width="34"
                        height="34"
                        className="d-inline-block align-top me-2"
                        style={{
                            filter: 'drop-shadow(0 0 8px rgba(0, 240, 255, 0.6))',
                        }}
                    />
                    <span className="text-gradient">Magic Stream</span>
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="main-navbar-nav" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                
                <Navbar.Collapse id="main-navbar-nav">
                    <Nav className="me-auto ms-lg-4">
                        <Nav.Link 
                            as={NavLink} 
                            to="/" 
                            className="px-3"
                            style={({ isActive }) => ({
                                color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                                fontWeight: '500',
                                transition: 'var(--transition-smooth)'
                            })}
                        >
                            Home
                        </Nav.Link>
                        <Nav.Link 
                            as={NavLink} 
                            to="/recommended" 
                            className="px-3"
                            style={({ isActive }) => ({
                                color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                                fontWeight: '500',
                                transition: 'var(--transition-smooth)'
                            })}
                        >
                            Recommended
                        </Nav.Link>
                    </Nav>
    
                    <Nav className="ms-auto align-items-center mt-3 mt-lg-0">
                        {auth ? (
                            <div className="d-flex align-items-center gap-3">
                                <div className="text-end">
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
                                        Logged in as
                                    </span>
                                    <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                                        {auth.first_name} {auth.last_name} 
                                        {auth.role === 'ADMIN' && (
                                            <span 
                                                className="badge bg-dark ms-2"
                                                style={{
                                                    fontSize: '0.7rem',
                                                    border: '1px solid var(--accent-cyan)',
                                                    color: 'var(--accent-cyan)',
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
                                        border: '1.5px solid rgba(244, 63, 94, 0.4)',
                                        color: '#f43f5e',
                                        fontWeight: '500',
                                        padding: '6px 16px',
                                        borderRadius: '8px'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'rgba(244, 63, 94, 0.1)';
                                        e.target.style.borderColor = '#f43f5e';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'transparent';
                                        e.target.style.borderColor = 'rgba(244, 63, 94, 0.4)';
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
                                    style={{ padding: '8px 20px', borderRadius: '8px', fontSize: '0.9rem' }}
                                >
                                    Login
                                </Button>
                                <Button
                                    variant="info"
                                    size="sm"
                                    onClick={() => navigate("/register")}  
                                    style={{ padding: '8px 20px', borderRadius: '8px', fontSize: '0.9rem' }}
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