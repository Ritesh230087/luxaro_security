import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/Auth.jsx'
import { toast } from 'react-toastify'
import './CartPage.css'

const CartPage = () => {
  const { cart, loading, updateCartItem, removeFromCart, getCartTotal } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Helper to fix image paths
  const IMAGE_BASE = import.meta.env.VITE_API_URL.replace('/api', '');

  useEffect(() => {
    if (!isAuthenticated) navigate('/login')
  }, [isAuthenticated, navigate])

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return
    const result = await updateCartItem(itemId, newQuantity)
    if (result.success) toast.success('Cart updated')
    else toast.error(result.error || 'Failed to update')
  }

  const handleRemove = async (itemId) => {
    const result = await removeFromCart(itemId)
    if (result.success) toast.success('Item removed')
    else toast.error(result.error || 'Failed to remove')
  }

  if (loading) return <div className="loading">Loading cart...</div>

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <h1 className="page-title">Shopping Cart</h1>
          <div className="empty-cart">
            <p>Your cart is empty</p>
            <Link to="/shop" className="btn btn-primary">Continue Shopping</Link>
          </div>
        </div>
      </div>
    )
  }

  const subtotal = getCartTotal()
  const shipping = subtotal > 1000 ? 0 : 150
  const tax = subtotal * 0.13
  const total = subtotal + shipping + tax

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="page-title">Shopping Cart</h1>
        <div className="cart-content">
          <div className="cart-items">
            {cart.items.map((item) => {
              if (!item.product) return null; // Safety check
              const imgUrl = item.product.images?.[0]?.startsWith('http') 
                ? item.product.images[0] 
                : `${IMAGE_BASE}${item.product.images[0]}`;

              return (
                <div key={item._id} className="cart-item">
                  <div className="cart-item-image">
                    {item.product.images?.[0] ? (
                      <img src={imgUrl} alt={item.product.name} />
                    ) : (
                      <div className="placeholder-image">No Image</div>
                    )}
                  </div>
                  <div className="cart-item-info">
                    <h3>{item.product.name}</h3>
                    <p className="cart-item-price">Rs. {item.product.price?.toLocaleString()}</p>
                  </div>
                  <div className="cart-item-quantity">
                    <button onClick={() => handleQuantityChange(item._id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => handleQuantityChange(item._id, item.quantity + 1)}>+</button>
                  </div>
                  <div className="cart-item-total">
                    Rs. {(item.product.price * item.quantity).toLocaleString()}
                  </div>
                  <button className="cart-item-remove" onClick={() => handleRemove(item._id)}>×</button>
                </div>
              );
            })}
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row"><span>Subtotal</span><span>Rs. {subtotal.toLocaleString()}</span></div>
            <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `Rs. ${shipping}`}</span></div>
            <div className="summary-row"><span>Tax</span><span>Rs. {tax.toFixed(2)}</span></div>
            <div className="summary-row total"><span>Total</span><span>Rs. {total.toFixed(2)}</span></div>
            <Link to="/checkout" className="btn btn-primary btn-large btn-block">Proceed to Checkout</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage


