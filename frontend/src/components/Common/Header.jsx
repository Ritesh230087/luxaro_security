import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/Auth.jsx'
import { useCart } from '../../context/CartContext'
import './Header.css'

const Header = () => {
  const { user, logout, isAuthenticated, loading } = useAuth() // ✅ Add loading
  const { getCartItemCount } = useCart()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // ✅ FIX: Don't render auth-dependent UI while loading
  if (loading) {
    return (
      <header className="header">
        <div className="container">
          <div className="header-content">
            <Link to="/" className="logo">
              <span className="logo-text">LUXARO</span>
              <span className="logo-accent">®</span>
            </Link>
            <div style={{ color: '#D4AF37' }}>Loading...</div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <span className="logo-text">LUXARO</span>
            <span className="logo-accent">®</span>
          </Link>

          <nav className="nav">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/shop" className="nav-link">Shop</Link>
            {isAuthenticated && (
              <>
                <Link to="/orders" className="nav-link">Orders</Link>
                <Link to="/profile" className="nav-link">Profile</Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="nav-link">Admin</Link>
                )}
              </>
            )}
          </nav>

          <div className="header-actions">
            <Link to="/cart" className="cart-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              {isAuthenticated && getCartItemCount() > 0 && (
                <span className="cart-badge">{getCartItemCount()}</span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="user-menu">
                <span className="user-name">{user?.name}</span>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-outline">Login</Link>
                <Link to="/register" className="btn btn-primary">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header