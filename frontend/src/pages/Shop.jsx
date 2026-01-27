import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api' // Use your api service instead of axios
import './Shop.css'

const Shop = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([]) // New state for real categories
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    minPrice: '',
    maxPrice: ''
  })

  // Helper to get the base URL for images
  const API_BASE = import.meta.env.VITE_API_URL.replace('/api', '');

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [filters])

const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      
      // 🛡️ Logic Check: Ensure data exists before mapping/filtering
      if (data && data.success && data.data.categories) {
        // If your backend already filters by isActive, you don't need .filter() here
        // but it is safer to keep it.
        setCategories(data.data.categories);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]); // Prevent map error if request fails
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.category) params.append('category', filters.category)
      if (filters.search) params.append('search', filters.search)
      if (filters.minPrice) params.append('minPrice', filters.minPrice)
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice)

      const { data } = await api.get(`/products?${params.toString()}`)
      setProducts(data.data.products)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    })
  }

  if (loading && products.length === 0) {
    return <div className="loading">Loading products...</div>
  }

  return (
    <div className="shop-page">
      <div className="container">
        <h1 className="page-title">Shop</h1>

        <div className="shop-content">
          <aside className="filters">
            <h3>Filters</h3>
            
            <div className="filter-group">
              <label>Search</label>
              <input
                type="text"
                name="search"
                placeholder="Search products..."
                value={filters.search}
                onChange={handleFilterChange}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label>Category</label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="filter-input"
              >
                <option value="">All Categories</option>
                {/* Dynamically render categories from database */}
                {categories.map(cat => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Price Range</label>
              <div className="price-inputs">
                <input type="number" name="minPrice" placeholder="Min" value={filters.minPrice} onChange={handleFilterChange} className="filter-input" />
                <span>-</span>
                <input type="number" name="maxPrice" placeholder="Max" value={filters.maxPrice} onChange={handleFilterChange} className="filter-input" />
              </div>
            </div>
          </aside>

          <main className="products-grid">
            {products.length === 0 ? (
              <div className="no-products">No products found</div>
            ) : (
              products.map((product) => (
                <Link key={product._id} to={`/product/${product._id}`} className="product-card">
                  <div className="product-image">
                    {product.images && product.images[0] ? (
                      <img 
                        src={product.images[0].startsWith('http') ? product.images[0] : `${API_BASE}${product.images[0]}`} 
                        alt={product.name} 
                      />
                    ) : (
                      <div className="placeholder-image">No Image</div>
                    )}
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-category">{product.category}</p>
                    <div className="product-price">
                      <span className="price">Rs. {product.price.toLocaleString()}</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default Shop


