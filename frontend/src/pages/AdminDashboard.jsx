import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api' // Secure API import
import { useAuth } from '../context/Auth.jsx'

// Sub-components
import AdminProducts from './AdminProducts'
import AdminCategories from './AdminCategories'
import AdminOrders from './AdminOrders'
import AdminUsers from './AdminUsers'
import AdminCoupons from './AdminCoupons' // <--- Import New Component

import './AdminDashboard.css'

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    if (user?.role !== 'admin') {
      navigate('/')
      return
    }

    fetchDashboard()
  }, [isAuthenticated, user, navigate])

  const fetchDashboard = async () => {
    try {
      const { data } = await api.get('/admin/dashboard')
      setStats(data.data)
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading Luxury Dashboard...</div>
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <h1 className="page-title" style={{ color: '#D4AF37', fontFamily: 'serif' }}>Admin Control Center</h1>

        <div className="admin-tabs">
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>Overview</button>
          <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>Products</button>
          <button className={activeTab === 'categories' ? 'active' : ''} onClick={() => setActiveTab('categories')}>Categories</button>
          <button className={activeTab === 'coupons' ? 'active' : ''} onClick={() => setActiveTab('coupons')}>Coupons</button> {/* NEW TAB */}
          <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>Orders</button>
          <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>Users</button>
        </div>

        {activeTab === 'dashboard' && stats && (
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Total Users</h3>
              <p className="stat-value">{stats.stats.totalUsers}</p>
            </div>
            <div className="stat-card">
              <h3>Total Products</h3>
              <p className="stat-value">{stats.stats.totalProducts}</p>
            </div>
            <div className="stat-card">
              <h3>Total Orders</h3>
              <p className="stat-value">{stats.stats.totalOrders}</p>
            </div>
            <div className="stat-card">
              <h3>Total Revenue</h3>
              <p className="stat-value">NPR {stats.stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'products' && <AdminProducts />}
        {activeTab === 'categories' && <AdminCategories />}
        {activeTab === 'coupons' && <AdminCoupons />} {/* Render Coupon Component */}
        {activeTab === 'orders' && <AdminOrders />}
        {activeTab === 'users' && <AdminUsers />}
      </div>
    </div>
  )
}

export default AdminDashboard