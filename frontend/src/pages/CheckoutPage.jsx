import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/Auth.jsx';
import api from '../services/api'; 
import { toast } from 'react-toastify';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { cart, getCartTotal } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discountData, setDiscountData] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // All fields included to match your Order Model
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Nepal',
    notes: ''
  });

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
    if (!cart?.items?.length) navigate('/cart');
  }, [isAuthenticated, cart, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    try {
      const subtotal = getCartTotal();
      const { data } = await api.post('/orders/verify-coupon', {
        couponCode: couponCode,
        cartTotal: subtotal
      });

      if (data.success) {
        setDiscountData(data.data);
        toast.success(`Coupon Applied! Saved Rs. ${data.data.discount}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid Coupon');
      setDiscountData(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handlePayment = async () => {
    // 🛡️ Validation for mandatory fields
    if (!formData.fullName || !formData.phone || !formData.address || !formData.city) {
      return toast.error('Please fill in all required fields marked with *');
    }

    setLoading(true);
    try {
      // STEP 1: Prepare Order with ALL fields
      const { data: orderResponse } = await api.post('/orders/prepare', {
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country
        },
        paymentMethod: 'esewa',
        couponCode: discountData ? discountData.code : undefined,
        notes: formData.notes
      });
      
      const orderId = orderResponse.data._id;
      if (!orderId) throw new Error("Failed to generate Order ID");

      // STEP 2: Initiate eSewa
      const { data: paymentResponse } = await api.post('/payments/esewa/initiate', { orderId });
      
      // STEP 3: Auto-submit Hidden Form
      const form = document.createElement('form');
      form.method = 'POST';
      // URL provided by your backend paymentController
      form.action = paymentResponse.data.esewaUrl; 
      
      Object.entries(paymentResponse.data.formData).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden'; 
        input.name = key; 
        input.value = value;
        form.appendChild(input);
      });
      
      document.body.appendChild(form);
      form.submit();

    } catch (error) {
      console.error("Checkout detail error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Checkout failed. Check your connection.');
      setLoading(false);
    }
  };

  // Logic Calculations
  const subtotal = getCartTotal();
  const shipping = subtotal > 5000 ? 0 : 150;
  const tax = Math.round(subtotal * 0.13 * 100) / 100;
  const discount = discountData ? discountData.discount : 0;
  const total = subtotal + shipping + tax - discount;

  const getImgUrl = (path) => {
    if (!path) return '';
    return path.startsWith('http') ? path : `${import.meta.env.VITE_API_URL.replace('/api', '')}${path}`;
  };

  return (
    <div className="checkout-page container">
      <div className="checkout-content">
        <div className="checkout-form">
          <section className="checkout-section">
            <h2>Shipping Details</h2>
            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Address (Street/Tol) *</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} required />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>State / Province</label>
                <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="e.g. Bagmati" />
              </div>
              <div className="form-group">
                <label>Postal Code</label>
                <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="e.g. 44600" />
              </div>
            </div>

            <div className="form-group">
              <label>Country</label>
              <input type="text" name="country" value={formData.country} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Order Notes (Optional)</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows="2" placeholder="Notes about your delivery"></textarea>
            </div>
          </section>
        </div>

        <div className="checkout-summary">
          <h2>Order Summary</h2>
          <div className="order-items">
            {cart.items.map(item => (
              <div key={item._id} className="order-item">
                <div className="order-item-image"><img src={getImgUrl(item.product.images?.[0])} alt={item.product.name} /></div>
                <div className="order-item-info"><h4>{item.product.name}</h4><p>Qty: {item.quantity}</p></div>
                <div className="order-item-price">Rs. {(item.product.price * item.quantity).toLocaleString()}</div>
              </div>
            ))}
          </div>
          
          <div className="coupon-section">
            <div className="coupon-input-group">
              <input type="text" placeholder="COUPON" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} disabled={!!discountData} />
              <button onClick={handleApplyCoupon} disabled={validatingCoupon || !!discountData} className="btn-apply">{discountData ? '✓' : 'APPLY'}</button>
            </div>
          </div>

          <div className="order-totals">
            <div className="total-row"><span>Subtotal</span><span>Rs. {subtotal.toLocaleString()}</span></div>
            <div className="total-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? <b style={{color: '#4ade80'}}>FREE</b> : `Rs. ${shipping}`}</span>
            </div>
            <div className="total-row"><span>Tax (13%)</span><span>Rs. {tax.toLocaleString()}</span></div>
            {discount > 0 && <div className="total-row discount-row"><span>Discount</span><span>- Rs. {discount}</span></div>}
            <div className="total-row final"><span>Total</span><span>Rs. {total.toLocaleString()}</span></div>
          </div>
          
          <button className="btn btn-primary btn-block" style={{width: '100%'}} onClick={handlePayment} disabled={loading}>
            {loading ? 'Processing...' : 'Pay with eSewa'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;


