import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/Auth.jsx'
import { toast } from 'react-toastify'
import './ProductPage.css'

const ProductPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  const IMAGE_BASE = import.meta.env.VITE_API_URL.replace('/api', '');

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const { data } = await api.get(`/products/${id}`)
      setProduct(data.data.product)
    } catch (error) {
      toast.error('Product not found')
    } finally {
      setLoading(false)
    }
  }

  const getFullImgPath = (path) => {
    if (!path) return '';
    return path.startsWith('http') ? path : `${IMAGE_BASE}${path}`;
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.info('Please login to add items to cart')
      navigate('/login'); return;
    }
    const result = await addToCart(product._id, quantity)
    if (result.success) toast.success('Added to cart!')
    else toast.error(result.error || 'Failed to add')
  }

  if (loading) return <div className="loading">Loading...</div>
  if (!product) return <div className="error">Product not found</div>

  return (
    <div className="product-page">
      <div className="container">
        <div className="product-detail">
          <div className="product-images">
            <div className="main-image">
              {product.images?.[selectedImage] ? (
                <img src={getFullImgPath(product.images[selectedImage])} alt={product.name} />
              ) : <div className="placeholder-image">No Image</div>}
            </div>
            {product.images?.length > 1 && (
              <div className="thumbnail-images">
                {product.images.map((img, index) => (
                  <img
                    key={index}
                    src={getFullImgPath(img)}
                    alt="thumbnail"
                    className={selectedImage === index ? 'active' : ''}
                    onClick={() => setSelectedImage(index)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="product-info">
            <h1 className="product-title">{product.name}</h1>
            <div className="product-meta">
              <span className="product-category">{product.category}</span>
            </div>
            <div className="product-price-section">
              <span className="product-price">Rs. {product.price.toLocaleString()}</span>
              {product.comparePrice > product.price && (
                <span className="product-compare-price">Rs. {product.comparePrice.toLocaleString()}</span>
              )}
            </div>
            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>
            <div className="product-stock">
              {product.stock > 0 ? (
                <span className="in-stock">In Stock ({product.stock} available)</span>
              ) : <span className="out-of-stock">Out of Stock</span>}
            </div>
            <div className="product-actions">
              <div className="quantity-selector">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <input type="number" value={quantity} readOnly />
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>+</button>
              </div>
              <button className="btn btn-primary btn-large" onClick={handleAddToCart} disabled={product.stock === 0}>
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default ProductPage


