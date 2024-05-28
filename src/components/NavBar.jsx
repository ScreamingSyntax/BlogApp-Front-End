import React from 'react';
import { Link } from 'react-router-dom';
import './NavBar.scss';
import { useNavigate } from 'react-router-dom';

const NavBar = () => {
  const navigate = useNavigate();
  // Check if there is a token in localStorage
  const isLoggedIn = !!localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    window.location.reload();
  };

  return (
    <nav className="navbar">
      <ul>
        {isLoggedIn && role === 'Admin' ? (
          // Only show logout button for admin users
          <>
          <li>
          <Link to="/dashboard" className="nav-link">
              <box-icon name='home-alt' color="blue`"></box-icon>
              <span style={{color: 'blue'}}>Dashboard</span>
          </Link>
          </li>        
          <li>
            <a onClick={handleLogout} className="nav-link" href="#!">
              <box-icon name='door-open' color="red"></box-icon>
              <span style={{color: 'red'}}>Logout</span>
            </a>
          </li>
          </>

        ) : (
          <>
            <li>
              <Link to="/" className="nav-link">
                <box-icon name='home-alt' color="blue"></box-icon>
                <span>Home</span>
              </Link>
            </li>

            {isLoggedIn && (
              <>
                <li>
                  <Link to="/profile" className="nav-link">
                    <box-icon name='user-circle' color="blue"></box-icon>
                    <span>Profile</span>
                  </Link>
                </li>
                <li>
                  <a onClick={handleLogout} className="nav-link" href="#!">
                    <box-icon name='door-open' color="red"></box-icon>
                    <span style={{color: 'red'}}>Logout</span>
                  </a>
                </li>
              </>
            )}

            {!isLoggedIn && (
              <>
                <li>
                  <Link to="/login" className="nav-link">
                    <box-icon name='log-in' color="blue"></box-icon>
                    <span>Login</span>
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="nav-link">
                    <box-icon name='user-plus' color="blue"></box-icon>
                    <span>Register</span>
                  </Link>
                </li>
              </>
            )}
          </>
        )}
      </ul>
    </nav>
  );
};

export default NavBar;
