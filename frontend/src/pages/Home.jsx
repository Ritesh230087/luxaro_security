import { Link } from 'react-router-dom'
import './Home.css'

const Home = () => {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">LUXARO</h1>
          <p className="hero-subtitle">Where Luxury Meets Excellence</p>
          <p className="hero-description">
            Discover our curated collection of premium products, crafted with precision and elegance.
          </p>
          <Link to="/shop" className="btn btn-primary btn-large">
            Explore Collection
          </Link>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚚</div>
              <h3>Free Shipping</h3>
              <p>On orders over NPR 1,000</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure Payment</h3>
              <p>eSewa & multiple options</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✨</div>
              <h3>Premium Quality</h3>
              <p>Handpicked luxury items</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💎</div>
              <h3>Exclusive Access</h3>
              <p>Limited edition products</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home

