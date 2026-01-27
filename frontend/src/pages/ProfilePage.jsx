// import { useEffect, useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useAuth } from '../context/Auth.jsx'
// import api from '../services/api'
// import { QRCodeSVG } from 'qrcode.react' // npm install qrcode.react
// import { toast } from 'react-toastify'
// import './ProfilePage.css'

// const ProfilePage = () => {
//   const { user, isAuthenticated } = useAuth()
//   const navigate = useNavigate()
  
//   // 2FA States
//   const [show2FASetup, setShow2FASetup] = useState(false)
//   const [qrCodeUrl, setQrCodeUrl] = useState('')
//   const [totpToken, setTotpToken] = useState('')
//   const [backupCodes, setBackupCodes] = useState([])

//   useEffect(() => {
//     if (!isAuthenticated) navigate('/login')
//   }, [isAuthenticated, navigate])

//   const start2FASetup = async () => {
//     try {
//       const { data } = await api.post('/users/2fa/setup')
//       setQrCodeUrl(data.qrCodeUrl) // Backend returns otpauth URL
//       setShow2FASetup(true)
//     } catch (error) {
//       toast.error('Could not initiate 2FA setup')
//     }
//   }

//   const enable2FA = async () => {
//     try {
//       const { data } = await api.post('/users/2fa/enable', { token: totpToken })
//       if (data.success) {
//         setBackupCodes(data.backupCodes)
//         toast.success('2FA Enabled Successfully!')
//         setShow2FASetup(false)
//         // Ideally reload user context here to update UI
//       }
//     } catch (error) {
//       toast.error('Invalid Code')
//     }
//   }

//   if (!user) return <div className="loading">Loading...</div>

//   return (
//     <div className="profile-page">
//       <div className="container">
//         <h1 className="page-title">My Profile</h1>
//         <div className="profile-content">
          
//           {/* User Info Card */}
//           <div className="profile-card">
//             <h2>Account Details</h2>
//             <div className="profile-info">
//               <div className="info-row"><span>Name:</span> <span>{user.name}</span></div>
//               <div className="info-row"><span>Email:</span> <span>{user.email}</span></div>
//               <div className="info-row">
//                 <span>Security:</span> 
//                 <span className={user.twoFactorEnabled ? "enabled-badge" : "disabled-badge"}>
//                   {user.twoFactorEnabled ? "2FA Enabled" : "2FA Disabled"}
//                 </span>
//               </div>
//             </div>

//             {/* 2FA Section */}
//             {!user.twoFactorEnabled && !backupCodes.length && (
//               <div style={{ marginTop: '20px' }}>
//                 {!show2FASetup ? (
//                   <button className="btn btn-primary" onClick={start2FASetup}>Enable 2FA Security</button>
//                 ) : (
//                   <div className="setup-2fa-box" style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
//                     <h3>Scan this QR Code</h3>
//                     <div style={{ background: 'white', padding: '10px', width: 'fit-content', margin: '10px auto' }}>
//                       <QRCodeSVG value={qrCodeUrl} size={200} />
//                     </div>
//                     <p>Enter the 6-digit code from Google Authenticator:</p>
//                     <input 
//                       type="text" 
//                       value={totpToken} 
//                       onChange={(e) => setTotpToken(e.target.value)} 
//                       placeholder="000000"
//                       style={{ padding: '10px', fontSize: '18px', textAlign: 'center', width: '150px', display: 'block', margin: '10px auto' }}
//                     />
//                     <button className="btn btn-success" onClick={enable2FA} style={{ marginTop: '10px' }}>Verify & Enable</button>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Backup Codes Display */}
//             {backupCodes.length > 0 && (
//               <div className="backup-codes-section" style={{ marginTop: '20px', background: '#fff3cd', padding: '20px' }}>
//                 <h3 style={{ color: '#856404' }}>Save these Backup Codes!</h3>
//                 <p>If you lose your phone, you can use these to login. They will only be shown once.</p>
//                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px', fontFamily: 'monospace' }}>
//                   {backupCodes.map((code, i) => (
//                     <span key={i} style={{ background: 'white', padding: '5px' }}>{code}</span>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default ProfilePage






























































// import { useEffect, useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useAuth } from '../context/Auth.jsx'
// import api from '../services/api'
// import { QRCodeSVG } from 'qrcode.react'
// import { toast } from 'react-toastify'
// import './ProfilePage.css'

// const ProfilePage = () => {
//   const { user, isAuthenticated, checkAuthStatus } = useAuth()
//   const navigate = useNavigate()
  
//   // 2FA States
//   const [show2FASetup, setShow2FASetup] = useState(false)
//   const [qrCodeUrl, setQrCodeUrl] = useState('')
//   const [totpToken, setTotpToken] = useState('')
//   const [backupCodes, setBackupCodes] = useState([])

//   // 🆕 Edit Profile States
//   const [isEditingProfile, setIsEditingProfile] = useState(false)
//   const [profileForm, setProfileForm] = useState({ name: '', phone: '' })

//   // 🆕 Password Change States
//   const [isChangingPassword, setIsChangingPassword] = useState(false)
//   const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

//   // 🆕 Session Management States
//   const [sessions, setSessions] = useState([])
//   const [showSessions, setShowSessions] = useState(false)

//   // 🆕 Activity Log States
//   const [showActivityLog, setShowActivityLog] = useState(false)

//   // 🆕 Password Expiry Warning
//   const [passwordExpiry, setPasswordExpiry] = useState(null)

//   useEffect(() => {
//     if (!isAuthenticated) navigate('/login')
//     else {
//       setProfileForm({ name: user?.name || '', phone: user?.phone || '' })
//       calculatePasswordExpiry()
//     }
//   }, [isAuthenticated, user, navigate])

//   // 🆕 Calculate password expiry warning
//   const calculatePasswordExpiry = () => {
//     if (user?.passwordExpiresAt) {
//       const expiryDate = new Date(user.passwordExpiresAt)
//       const now = new Date()
//       const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24))
      
//       if (daysLeft <= 15 && daysLeft > 0) {
//         setPasswordExpiry({ daysLeft, severity: daysLeft <= 7 ? 'critical' : 'warning' })
//       } else if (daysLeft <= 0) {
//         setPasswordExpiry({ daysLeft: 0, severity: 'expired' })
//       }
//     }
//   }

//   // ========== 2FA FUNCTIONS (Existing) ==========
//   const start2FASetup = async () => {
//     try {
//       const { data } = await api.post('/users/2fa/setup')
//       setQrCodeUrl(data.qrCodeUrl)
//       setShow2FASetup(true)
//     } catch (error) {
//       toast.error('Could not initiate 2FA setup')
//     }
//   }

//   const enable2FA = async () => {
//     try {
//       const { data } = await api.post('/users/2fa/enable', { token: totpToken })
//       if (data.success) {
//         setBackupCodes(data.backupCodes)
//         toast.success('2FA Enabled Successfully!')
//         setShow2FASetup(false)
//         await checkAuthStatus() // Reload user context
//       }
//     } catch (error) {
//       toast.error('Invalid Code')
//     }
//   }

//   // 🆕 Disable 2FA
//   const disable2FA = async () => {
//     const password = prompt('Enter your password to disable 2FA:')
//     if (!password) return

//     try {
//       const { data } = await api.post('/users/2fa/disable', { password })
//       if (data.success) {
//         toast.success('2FA Disabled')
//         await checkAuthStatus()
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to disable 2FA')
//     }
//   }

//   // ========== 🆕 PROFILE UPDATE FUNCTIONS ==========
//   const handleProfileChange = (e) => {
//     setProfileForm({ ...profileForm, [e.target.name]: e.target.value })
//   }

//   const handleProfileSubmit = async (e) => {
//     e.preventDefault()
//     try {
//       const { data } = await api.put('/users/profile', profileForm)
//       if (data.success) {
//         toast.success('Profile updated successfully')
//         setIsEditingProfile(false)
//         await checkAuthStatus() // Reload user data
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to update profile')
//     }
//   }

//   // ========== 🆕 PASSWORD CHANGE FUNCTIONS ==========
//   const handlePasswordChange = (e) => {
//     setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value })
//   }

//   const handlePasswordSubmit = async (e) => {
//     e.preventDefault()

//     if (passwordForm.newPassword !== passwordForm.confirmPassword) {
//       toast.error('Passwords do not match')
//       return
//     }

//     if (passwordForm.newPassword.length < 12) {
//       toast.error('Password must be at least 12 characters')
//       return
//     }

//     try {
//       const { data } = await api.put('/users/password', {
//         currentPassword: passwordForm.currentPassword,
//         newPassword: passwordForm.newPassword
//       })
      
//       if (data.success) {
//         toast.success('Password changed successfully')
//         setIsChangingPassword(false)
//         setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
//         setPasswordExpiry(null) // Reset expiry warning
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to change password')
//     }
//   }

//   // ========== 🆕 SESSION MANAGEMENT FUNCTIONS ==========
//   const fetchSessions = async () => {
//     try {
//       const { data } = await api.get('/auth/sessions')
//       setSessions(data.data.sessions)
//       setShowSessions(true)
//     } catch (error) {
//       toast.error('Failed to load sessions')
//     }
//   }



//   if (!user) return <div className="loading">Loading...</div>

//   return (
//     <div className="profile-page">
//       <div className="container">
//         <h1 className="page-title">My Profile</h1>

//         {/* 🆕 Password Expiry Warning Banner */}
//         {passwordExpiry && (
//           <div className={`alert alert-${passwordExpiry.severity}`} style={{ marginBottom: '20px' }}>
//             {passwordExpiry.daysLeft === 0 ? (
//               <p><strong>⚠️ Password Expired!</strong> Your password has expired. Please change it immediately.</p>
//             ) : (
//               <p><strong>⚠️ Password Expiring Soon!</strong> Your password will expire in {passwordExpiry.daysLeft} days. 
//               <button onClick={() => setIsChangingPassword(true)} style={{ marginLeft: '10px', textDecoration: 'underline' }}>
//                 Change Now
//               </button>
//               </p>
//             )}
//           </div>
//         )}

//         <div className="profile-content">
          
//           {/* ========== USER INFO CARD ========== */}
//           <div className="profile-card">
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//               <h2>Account Details</h2>
//               {!isEditingProfile && (
//                 <button className="btn btn-outline" onClick={() => setIsEditingProfile(true)}>
//                   Edit Profile
//                 </button>
//               )}
//             </div>

//             {!isEditingProfile ? (
//               <div className="profile-info">
//                 <div className="info-row"><span>Name:</span> <span>{user.name}</span></div>
//                 <div className="info-row"><span>Email:</span> <span>{user.email}</span></div>
//                 <div className="info-row"><span>Phone:</span> <span>{user.phone || 'Not set'}</span></div>
//                 <div className="info-row">
//                   <span>Role:</span> 
//                   <span className={`role-badge ${user.role}`}>{user.role}</span>
//                 </div>
//                 <div className="info-row">
//                   <span>2FA:</span> 
//                   <span className={user.twoFactorEnabled ? "enabled-badge" : "disabled-badge"}>
//                     {user.twoFactorEnabled ? "✅ Enabled" : "❌ Disabled"}
//                   </span>
//                 </div>
//               </div>
//             ) : (
//               /* 🆕 Edit Profile Form */
//               <form onSubmit={handleProfileSubmit} style={{ marginTop: '20px' }}>
//                 <div className="form-group">
//                   <label>Name</label>
//                   <input 
//                     type="text" 
//                     name="name" 
//                     value={profileForm.name} 
//                     onChange={handleProfileChange} 
//                     required 
//                     maxLength={100}
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label>Phone</label>
//                   <input 
//                     type="tel" 
//                     name="phone" 
//                     value={profileForm.phone} 
//                     onChange={handleProfileChange} 
//                     maxLength={20}
//                   />
//                 </div>
//                 <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
//                   <button type="submit" className="btn btn-primary">Save Changes</button>
//                   <button 
//                     type="button" 
//                     className="btn btn-outline" 
//                     onClick={() => {
//                       setIsEditingProfile(false)
//                       setProfileForm({ name: user.name, phone: user.phone || '' })
//                     }}
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </form>
//             )}
//           </div>

//           {/* ========== 🆕 PASSWORD CHANGE CARD ========== */}
//           <div className="profile-card">
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//               <h2>Password Security</h2>
//               {!isChangingPassword && (
//                 <button className="btn btn-outline" onClick={() => setIsChangingPassword(true)}>
//                   Change Password
//                 </button>
//               )}
//             </div>

//             {isChangingPassword && (
//               <form onSubmit={handlePasswordSubmit} style={{ marginTop: '20px' }}>
//                 <div className="form-group">
//                   <label>Current Password</label>
//                   <input 
//                     type="password" 
//                     name="currentPassword" 
//                     value={passwordForm.currentPassword} 
//                     onChange={handlePasswordChange} 
//                     required 
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label>New Password</label>
//                   <input 
//                     type="password" 
//                     name="newPassword" 
//                     value={passwordForm.newPassword} 
//                     onChange={handlePasswordChange} 
//                     required 
//                     minLength={12}
//                   />
//                   <small>Minimum 12 characters with uppercase, lowercase, number, and special character</small>
//                 </div>
//                 <div className="form-group">
//                   <label>Confirm New Password</label>
//                   <input 
//                     type="password" 
//                     name="confirmPassword" 
//                     value={passwordForm.confirmPassword} 
//                     onChange={handlePasswordChange} 
//                     required 
//                   />
//                 </div>
//                 <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
//                   <button type="submit" className="btn btn-primary">Update Password</button>
//                   <button 
//                     type="button" 
//                     className="btn btn-outline" 
//                     onClick={() => {
//                       setIsChangingPassword(false)
//                       setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
//                     }}
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </form>
//             )}
//           </div>

//           {/* ========== 2FA MANAGEMENT CARD ========== */}
//           <div className="profile-card">
//             <h2>Two-Factor Authentication</h2>
            
//             {!user.twoFactorEnabled && !backupCodes.length && (
//               <div style={{ marginTop: '20px' }}>
//                 {!show2FASetup ? (
//                   <>
//                     <p style={{ marginBottom: '15px' }}>
//                       Add an extra layer of security to your account with 2FA.
//                     </p>
//                     <button className="btn btn-primary" onClick={start2FASetup}>
//                       Enable 2FA
//                     </button>
//                   </>
//                 ) : (
//                   <div className="setup-2fa-box" style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
//                     <h3>Scan this QR Code</h3>
//                     <p>Use Google Authenticator or any TOTP app</p>
//                     <div style={{ background: 'white', padding: '10px', width: 'fit-content', margin: '10px auto' }}>
//                       <QRCodeSVG value={qrCodeUrl} size={200} />
//                     </div>
//                     <p>Enter the 6-digit code from your authenticator app:</p>
//                     <input 
//                       type="text" 
//                       value={totpToken} 
//                       onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, '').slice(0, 6))} 
//                       placeholder="000000"
//                       maxLength={6}
//                       style={{ 
//                         padding: '10px', 
//                         fontSize: '18px', 
//                         textAlign: 'center', 
//                         width: '150px', 
//                         display: 'block', 
//                         margin: '10px auto',
//                         letterSpacing: '5px'
//                       }}
//                     />
//                     <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '15px' }}>
//                       <button className="btn btn-primary" onClick={enable2FA}>
//                         Verify & Enable
//                       </button>
//                       <button 
//                         className="btn btn-outline" 
//                         onClick={() => {
//                           setShow2FASetup(false)
//                           setTotpToken('')
//                         }}
//                       >
//                         Cancel
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* 🆕 Disable 2FA Option */}
//             {user.twoFactorEnabled && (
//               <div style={{ marginTop: '20px' }}>
//                 <p style={{ color: '#10B981', marginBottom: '15px' }}>
//                   ✅ Two-Factor Authentication is currently enabled
//                 </p>
//                 <button className="btn btn-outline" style={{ color: '#EF4444', borderColor: '#EF4444' }} onClick={disable2FA}>
//                   Disable 2FA
//                 </button>
//               </div>
//             )}

//             {/* Backup Codes Display */}
//             {backupCodes.length > 0 && (
//               <div className="backup-codes-section" style={{ marginTop: '20px', background: '#fff3cd', padding: '20px', borderRadius: '8px' }}>
//                 <h3 style={{ color: '#856404' }}>⚠️ Save these Backup Codes!</h3>
//                 <p>If you lose your phone, you can use these to login. <strong>They will only be shown once.</strong></p>
//                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px', fontFamily: 'monospace', fontSize: '14px' }}>
//                   {backupCodes.map((code, i) => (
//                     <span key={i} style={{ background: 'white', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
//                       {code}
//                     </span>
//                   ))}
//                 </div>
//                 <button 
//                   className="btn btn-primary" 
//                   style={{ marginTop: '15px' }}
//                   onClick={() => {
//                     const text = backupCodes.join('\n')
//                     navigator.clipboard.writeText(text)
//                     toast.success('Backup codes copied to clipboard')
//                   }}
//                 >
//                   Copy All Codes
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default ProfilePage






































// import { useEffect, useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useAuth } from '../context/Auth.jsx'
// import api from '../services/api'
// import { QRCodeSVG } from 'qrcode.react'
// import { toast } from 'react-toastify'
// import PasswordInput from '../components/Auth/PasswordInput'
// import PasswordStrengthMeter from '../components/Auth/PasswordStrengthMeter'
// import './ProfilePage.css'

// const ProfilePage = () => {
//   const { user, isAuthenticated, checkAuthStatus } = useAuth()
//   const navigate = useNavigate()
  
//   // 2FA States
//   const [show2FASetup, setShow2FASetup] = useState(false)
//   const [qrCodeUrl, setQrCodeUrl] = useState('')
//   const [totpToken, setTotpToken] = useState('')
//   const [backupCodes, setBackupCodes] = useState([])

//   // Edit Profile States
//   const [isEditingProfile, setIsEditingProfile] = useState(false)
//   const [profileForm, setProfileForm] = useState({ name: '', phone: '' })

//   // Password Change States
//   const [isChangingPassword, setIsChangingPassword] = useState(false)
//   const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
//   const [isPasswordValid, setIsPasswordValid] = useState(false) // ✅ NEW: Track password validation

//   // Session Management States
//   const [sessions, setSessions] = useState([])
//   const [showSessions, setShowSessions] = useState(false)

//   // Activity Log States
//   const [showActivityLog, setShowActivityLog] = useState(false)

//   // Password Expiry Warning
//   const [passwordExpiry, setPasswordExpiry] = useState(null)

//   useEffect(() => {
//     if (!isAuthenticated) navigate('/login')
//     else {
//       setProfileForm({ name: user?.name || '', phone: user?.phone || '' })
//       calculatePasswordExpiry()
//     }
//   }, [isAuthenticated, user, navigate])

//   // Calculate password expiry warning
//   const calculatePasswordExpiry = () => {
//     if (user?.passwordExpiresAt) {
//       const expiryDate = new Date(user.passwordExpiresAt)
//       const now = new Date()
//       const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24))
      
//       if (daysLeft <= 15 && daysLeft > 0) {
//         setPasswordExpiry({ daysLeft, severity: daysLeft <= 7 ? 'critical' : 'warning' })
//       } else if (daysLeft <= 0) {
//         setPasswordExpiry({ daysLeft: 0, severity: 'expired' })
//       }
//     }
//   }

//   // ========== 2FA FUNCTIONS (Existing) ==========
//   const start2FASetup = async () => {
//     try {
//       const { data } = await api.post('/users/2fa/setup')
//       setQrCodeUrl(data.qrCodeUrl)
//       setShow2FASetup(true)
//     } catch (error) {
//       toast.error('Could not initiate 2FA setup')
//     }
//   }

//   const enable2FA = async () => {
//     try {
//       const { data } = await api.post('/users/2fa/enable', { token: totpToken })
//       if (data.success) {
//         setBackupCodes(data.backupCodes)
//         toast.success('2FA Enabled Successfully!')
//         setShow2FASetup(false)
//         await checkAuthStatus()
//       }
//     } catch (error) {
//       toast.error('Invalid Code')
//     }
//   }

//   const disable2FA = async () => {
//     const password = prompt('Enter your password to disable 2FA:')
//     if (!password) return

//     try {
//       const { data } = await api.post('/users/2fa/disable', { password })
//       if (data.success) {
//         toast.success('2FA Disabled')
//         await checkAuthStatus()
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to disable 2FA')
//     }
//   }

//   // ========== PROFILE UPDATE FUNCTIONS ==========
//   const handleProfileChange = (e) => {
//     setProfileForm({ ...profileForm, [e.target.name]: e.target.value })
//   }

//   const handleProfileSubmit = async (e) => {
//     e.preventDefault()
//     try {
//       const { data } = await api.put('/users/profile', profileForm)
//       if (data.success) {
//         toast.success('Profile updated successfully')
//         setIsEditingProfile(false)
//         await checkAuthStatus()
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to update profile')
//     }
//   }

//   // ========== PASSWORD CHANGE FUNCTIONS ==========
//   const handlePasswordChange = (e) => {
//     setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value })
//   }

//   const handlePasswordSubmit = async (e) => {
//     e.preventDefault()

//     if (passwordForm.newPassword !== passwordForm.confirmPassword) {
//       toast.error('Passwords do not match')
//       return
//     }

//     // ✅ Check if password meets validation requirements
//     if (!isPasswordValid) {
//       toast.error('Password does not meet security requirements')
//       return
//     }

//     try {
//       const { data } = await api.put('/users/password', {
//         currentPassword: passwordForm.currentPassword,
//         newPassword: passwordForm.newPassword
//       })
      
//       if (data.success) {
//         toast.success('Password changed successfully')
//         setIsChangingPassword(false)
//         setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
//         setPasswordExpiry(null)
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to change password')
//     }
//   }

//   // ========== SESSION MANAGEMENT FUNCTIONS ==========
//   const fetchSessions = async () => {
//     try {
//       const { data } = await api.get('/auth/sessions')
//       setSessions(data.data.sessions)
//       setShowSessions(true)
//     } catch (error) {
//       toast.error('Failed to load sessions')
//     }
//   }

//   if (!user) return <div className="loading">Loading...</div>

//   return (
//     <div className="profile-page">
//       <div className="container">
//         <h1 className="page-title">My Profile</h1>

//         {/* Password Expiry Warning Banner */}
//         {passwordExpiry && (
//           <div className={`alert alert-${passwordExpiry.severity}`} style={{ marginBottom: '20px' }}>
//             {passwordExpiry.daysLeft === 0 ? (
//               <p><strong>⚠️ Password Expired!</strong> Your password has expired. Please change it immediately.</p>
//             ) : (
//               <p><strong>⚠️ Password Expiring Soon!</strong> Your password will expire in {passwordExpiry.daysLeft} days. 
//               <button onClick={() => setIsChangingPassword(true)} style={{ marginLeft: '10px', textDecoration: 'underline' }}>
//                 Change Now
//               </button>
//               </p>
//             )}
//           </div>
//         )}

//         <div className="profile-content">
          
//           {/* ========== USER INFO CARD ========== */}
//           <div className="profile-card">
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//               <h2>Account Details</h2>
//               {!isEditingProfile && (
//                 <button className="btn btn-outline" onClick={() => setIsEditingProfile(true)}>
//                   Edit Profile
//                 </button>
//               )}
//             </div>

//             {!isEditingProfile ? (
//               <div className="profile-info">
//                 <div className="info-row"><span>Name:</span> <span>{user.name}</span></div>
//                 <div className="info-row"><span>Email:</span> <span>{user.email}</span></div>
//                 <div className="info-row"><span>Phone:</span> <span>{user.phone || 'Not set'}</span></div>
//                 <div className="info-row">
//                   <span>Role:</span> 
//                   <span className={`role-badge ${user.role}`}>{user.role}</span>
//                 </div>
//                 <div className="info-row">
//                   <span>2FA:</span> 
//                   <span className={user.twoFactorEnabled ? "enabled-badge" : "disabled-badge"}>
//                     {user.twoFactorEnabled ? "✅ Enabled" : "❌ Disabled"}
//                   </span>
//                 </div>
//               </div>
//             ) : (
//               <form onSubmit={handleProfileSubmit} style={{ marginTop: '20px' }}>
//                 <div className="form-group">
//                   <label>Name</label>
//                   <input 
//                     type="text" 
//                     name="name" 
//                     value={profileForm.name} 
//                     onChange={handleProfileChange} 
//                     required 
//                     maxLength={100}
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label>Phone</label>
//                   <input 
//                     type="tel" 
//                     name="phone" 
//                     value={profileForm.phone} 
//                     onChange={handleProfileChange} 
//                     maxLength={20}
//                   />
//                 </div>
//                 <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
//                   <button type="submit" className="btn btn-primary">Save Changes</button>
//                   <button 
//                     type="button" 
//                     className="btn btn-outline" 
//                     onClick={() => {
//                       setIsEditingProfile(false)
//                       setProfileForm({ name: user.name, phone: user.phone || '' })
//                     }}
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </form>
//             )}
//           </div>

//           {/* ========== PASSWORD CHANGE CARD WITH VALIDATION ========== */}
//           <div className="profile-card">
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//               <h2>Password Security</h2>
//               {!isChangingPassword && (
//                 <button className="btn btn-outline" onClick={() => setIsChangingPassword(true)}>
//                   Change Password
//                 </button>
//               )}
//             </div>

//             {isChangingPassword && (
//               <form onSubmit={handlePasswordSubmit} style={{ marginTop: '20px' }}>
//                 <div className="form-group">
//                   <label>Current Password</label>
//                   <PasswordInput 
//                     name="currentPassword" 
//                     value={passwordForm.currentPassword} 
//                     onChange={handlePasswordChange} 
//                     placeholder="Enter current password"
//                     required 
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label>New Password</label>
//                   <PasswordInput 
//                     name="newPassword" 
//                     value={passwordForm.newPassword} 
//                     onChange={handlePasswordChange} 
//                     placeholder="Enter new password"
//                     required 
//                     minLength={12}
//                   />
//                   {/* ✅ NEW: Password Strength Meter */}
//                   <PasswordStrengthMeter 
//                     password={passwordForm.newPassword}
//                     onValidationChange={setIsPasswordValid}
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label>Confirm New Password</label>
//                   <PasswordInput 
//                     name="confirmPassword" 
//                     value={passwordForm.confirmPassword} 
//                     onChange={handlePasswordChange} 
//                     placeholder="Confirm new password"
//                     required 
//                   />
//                   {/* ✅ NEW: Password Match Indicator */}
//                   {passwordForm.confirmPassword && (
//                     <small style={{ 
//                       color: passwordForm.newPassword === passwordForm.confirmPassword ? '#10B981' : '#EF4444',
//                       display: 'block',
//                       marginTop: '5px'
//                     }}>
//                       {passwordForm.newPassword === passwordForm.confirmPassword 
//                         ? '✓ Passwords match' 
//                         : '✗ Passwords do not match'}
//                     </small>
//                   )}
//                 </div>
//                 <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
//                   <button 
//                     type="submit" 
//                     className="btn btn-primary"
//                     disabled={!isPasswordValid || passwordForm.newPassword !== passwordForm.confirmPassword}
//                   >
//                     Update Password
//                   </button>
//                   <button 
//                     type="button" 
//                     className="btn btn-outline" 
//                     onClick={() => {
//                       setIsChangingPassword(false)
//                       setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
//                       setIsPasswordValid(false)
//                     }}
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </form>
//             )}
//           </div>

//           {/* ========== 2FA MANAGEMENT CARD ========== */}
//           <div className="profile-card">
//             <h2>Two-Factor Authentication</h2>
            
//             {!user.twoFactorEnabled && !backupCodes.length && (
//               <div style={{ marginTop: '20px' }}>
//                 {!show2FASetup ? (
//                   <>
//                     <p style={{ marginBottom: '15px' }}>
//                       Add an extra layer of security to your account with 2FA.
//                     </p>
//                     <button className="btn btn-primary" onClick={start2FASetup}>
//                       Enable 2FA
//                     </button>
//                   </>
//                 ) : (
//                   <div className="setup-2fa-box" style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
//                     <h3>Scan this QR Code</h3>
//                     <p>Use Google Authenticator or any TOTP app</p>
//                     <div style={{ background: 'white', padding: '10px', width: 'fit-content', margin: '10px auto' }}>
//                       <QRCodeSVG value={qrCodeUrl} size={200} />
//                     </div>
//                     <p>Enter the 6-digit code from your authenticator app:</p>
//                     <input 
//                       type="text" 
//                       value={totpToken} 
//                       onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, '').slice(0, 6))} 
//                       placeholder="000000"
//                       maxLength={6}
//                       style={{ 
//                         padding: '10px', 
//                         fontSize: '18px', 
//                         textAlign: 'center', 
//                         width: '150px', 
//                         display: 'block', 
//                         margin: '10px auto',
//                         letterSpacing: '5px'
//                       }}
//                     />
//                     <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '15px' }}>
//                       <button className="btn btn-primary" onClick={enable2FA}>
//                         Verify & Enable
//                       </button>
//                       <button 
//                         className="btn btn-outline" 
//                         onClick={() => {
//                           setShow2FASetup(false)
//                           setTotpToken('')
//                         }}
//                       >
//                         Cancel
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}

//             {user.twoFactorEnabled && (
//               <div style={{ marginTop: '20px' }}>
//                 <p style={{ color: '#10B981', marginBottom: '15px' }}>
//                   ✅ Two-Factor Authentication is currently enabled
//                 </p>
//                 <button className="btn btn-outline" style={{ color: '#EF4444', borderColor: '#EF4444' }} onClick={disable2FA}>
//                   Disable 2FA
//                 </button>
//               </div>
//             )}

//             {backupCodes.length > 0 && (
//               <div className="backup-codes-section" style={{ marginTop: '20px', background: '#fff3cd', padding: '20px', borderRadius: '8px' }}>
//                 <h3 style={{ color: '#856404' }}>⚠️ Save these Backup Codes!</h3>
//                 <p>If you lose your phone, you can use these to login. <strong>They will only be shown once.</strong></p>
//                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px', fontFamily: 'monospace', fontSize: '14px' }}>
//                   {backupCodes.map((code, i) => (
//                     <span key={i} style={{ background: 'white', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
//                       {code}
//                     </span>
//                   ))}
//                 </div>
//                 <button 
//                   className="btn btn-primary" 
//                   style={{ marginTop: '15px' }}
//                   onClick={() => {
//                     const text = backupCodes.join('\n')
//                     navigator.clipboard.writeText(text)
//                     toast.success('Backup codes copied to clipboard')
//                   }}
//                 >
//                   Copy All Codes
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default ProfilePage























































import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/Auth.jsx'
import api from '../services/api'
import { QRCodeSVG } from 'qrcode.react'
import { toast } from 'react-toastify'
import PasswordInput from '../components/Auth/PasswordInput'
import PasswordStrengthMeter from '../components/Auth/PasswordStrengthMeter'
import './ProfilePage.css'

const ProfilePage = () => {
  const { user, isAuthenticated, checkAuthStatus } = useAuth()
  const navigate = useNavigate()
  
  // 2FA States
  const [show2FASetup, setShow2FASetup] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [totpToken, setTotpToken] = useState('')
  const [backupCodes, setBackupCodes] = useState([])

  // Edit Profile States
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' })

  // Password Change States
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [isPasswordValid, setIsPasswordValid] = useState(false)

  // Custom Modal States
  const [showDisable2FAModal, setShowDisable2FAModal] = useState(false)
  const [modalPassword, setModalPassword] = useState('')
  const [modalLoading, setModalLoading] = useState(false)

  // Session Management States
  const [sessions, setSessions] = useState([])
  const [showSessions, setShowSessions] = useState(false)

  // Activity Log States
  const [showActivityLog, setShowActivityLog] = useState(false)

  // Password Expiry Warning
  const [passwordExpiry, setPasswordExpiry] = useState(null)

  useEffect(() => {
    if (!isAuthenticated) navigate('/login')
    else {
      setProfileForm({ name: user?.name || '', phone: user?.phone || '' })
      calculatePasswordExpiry()
    }
  }, [isAuthenticated, user, navigate])

  const calculatePasswordExpiry = () => {
    if (user?.passwordExpiresAt) {
      const expiryDate = new Date(user.passwordExpiresAt)
      const now = new Date()
      const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24))
      
      if (daysLeft <= 15 && daysLeft > 0) {
        setPasswordExpiry({ daysLeft, severity: daysLeft <= 7 ? 'critical' : 'warning' })
      } else if (daysLeft <= 0) {
        setPasswordExpiry({ daysLeft: 0, severity: 'expired' })
      }
    }
  }

  // ========== 2FA FUNCTIONS ==========
  const start2FASetup = async () => {
    try {
      const { data } = await api.post('/users/2fa/setup')
      setQrCodeUrl(data.qrCodeUrl)
      setShow2FASetup(true)
    } catch (error) {
      toast.error('Could not initiate 2FA setup')
    }
  }

  const enable2FA = async () => {
    try {
      const { data } = await api.post('/users/2fa/enable', { token: totpToken })
      if (data.success) {
        setBackupCodes(data.backupCodes)
        toast.success('2FA Enabled Successfully!')
        setShow2FASetup(false)
        await checkAuthStatus()
      }
    } catch (error) {
      toast.error('Invalid Code')
    }
  }

  const handleDisable2FAClick = () => {
    setShowDisable2FAModal(true)
  }

  const handleDisable2FAConfirm = async (e) => {
    e.preventDefault()
    if (!modalPassword.trim()) return

    setModalLoading(true)
    try {
      const { data } = await api.post('/users/2fa/disable', { password: modalPassword })
      if (data.success) {
        toast.success('2FA Disabled')
        setShowDisable2FAModal(false)
        setModalPassword('')
        await checkAuthStatus()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to disable 2FA')
    } finally {
      setModalLoading(false)
    }
  }

  const closeModal = () => {
    setShowDisable2FAModal(false)
    setModalPassword('')
    setModalLoading(false)
  }

  // ========== PROFILE UPDATE FUNCTIONS ==========
  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value })
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    try {
      const { data } = await api.put('/users/profile', profileForm)
      if (data.success) {
        toast.success('Profile updated successfully')
        setIsEditingProfile(false)
        await checkAuthStatus()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    }
  }

  // ========== PASSWORD CHANGE FUNCTIONS ==========
  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value })
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (!isPasswordValid) {
      toast.error('Password does not meet security requirements')
      return
    }

    try {
      const { data } = await api.put('/users/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
      
      if (data.success) {
        toast.success('Password changed successfully')
        setIsChangingPassword(false)
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setPasswordExpiry(null)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password')
    }
  }

  // ========== SESSION MANAGEMENT FUNCTIONS ==========
  const fetchSessions = async () => {
    try {
      const { data } = await api.get('/auth/sessions')
      setSessions(data.data.sessions)
      setShowSessions(true)
    } catch (error) {
      toast.error('Failed to load sessions')
    }
  }

  if (!user) return <div className="loading">Loading...</div>

  return (
    <div className="profile-page">
      <div className="container">
        <h1 className="page-title">My Profile</h1>

        {/* Password Expiry Warning Banner */}
        {passwordExpiry && (
          <div className={`alert alert-${passwordExpiry.severity}`} style={{ marginBottom: '20px' }}>
            {passwordExpiry.daysLeft === 0 ? (
              <p><strong>⚠️ Password Expired!</strong> Your password has expired. Please change it immediately.</p>
            ) : (
              <p><strong>⚠️ Password Expiring Soon!</strong> Your password will expire in {passwordExpiry.daysLeft} days. 
              <button onClick={() => setIsChangingPassword(true)} style={{ marginLeft: '10px', textDecoration: 'underline' }}>
                Change Now
              </button>
              </p>
            )}
          </div>
        )}

        <div className="profile-content">
          
          {/* ========== USER INFO CARD ========== */}
          <div className="profile-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Account Details</h2>
              {!isEditingProfile && (
                <button className="btn btn-outline" onClick={() => setIsEditingProfile(true)}>
                  Edit Profile
                </button>
              )}
            </div>

            {!isEditingProfile ? (
              <div className="profile-info">
                <div className="info-row"><span>Name:</span> <span>{user.name}</span></div>
                <div className="info-row"><span>Email:</span> <span>{user.email}</span></div>
                <div className="info-row"><span>Phone:</span> <span>{user.phone || 'Not set'}</span></div>
                <div className="info-row">
                  <span>Role:</span> 
                  <span className={`role-badge ${user.role}`}>{user.role}</span>
                </div>
                <div className="info-row">
                  <span>2FA:</span> 
                  <span className={user.twoFactorEnabled ? "enabled-badge" : "disabled-badge"}>
                    {user.twoFactorEnabled ? "✅ Enabled" : "❌ Disabled"}
                  </span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleProfileSubmit} style={{ marginTop: '20px' }}>
                <div className="form-group">
                  <label>Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={profileForm.name} 
                    onChange={handleProfileChange} 
                    required 
                    maxLength={100}
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={profileForm.phone} 
                    onChange={handleProfileChange} 
                    maxLength={20}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    onClick={() => {
                      setIsEditingProfile(false)
                      setProfileForm({ name: user.name, phone: user.phone || '' })
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ========== PASSWORD CHANGE CARD ========== */}
          <div className="profile-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Password Security</h2>
              {!isChangingPassword && (
                <button className="btn btn-outline" onClick={() => setIsChangingPassword(true)}>
                  Change Password
                </button>
              )}
            </div>

            {isChangingPassword && (
              <form onSubmit={handlePasswordSubmit} style={{ marginTop: '20px' }}>
                <div className="form-group">
                  <label>Current Password</label>
                  <PasswordInput 
                    name="currentPassword" 
                    value={passwordForm.currentPassword} 
                    onChange={handlePasswordChange} 
                    placeholder="Enter current password"
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <PasswordInput 
                    name="newPassword" 
                    value={passwordForm.newPassword} 
                    onChange={handlePasswordChange} 
                    placeholder="Enter new password"
                    required 
                    minLength={12}
                  />
                  <PasswordStrengthMeter 
                    password={passwordForm.newPassword}
                    onValidationChange={setIsPasswordValid}
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <PasswordInput 
                    name="confirmPassword" 
                    value={passwordForm.confirmPassword} 
                    onChange={handlePasswordChange} 
                    placeholder="Confirm new password"
                    required 
                  />
                  {passwordForm.confirmPassword && (
                    <small style={{ 
                      color: passwordForm.newPassword === passwordForm.confirmPassword ? '#10B981' : '#EF4444',
                      display: 'block',
                      marginTop: '5px'
                    }}>
                      {passwordForm.newPassword === passwordForm.confirmPassword 
                        ? '✓ Passwords match' 
                        : '✗ Passwords do not match'}
                    </small>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={!isPasswordValid || passwordForm.newPassword !== passwordForm.confirmPassword}
                  >
                    Update Password
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    onClick={() => {
                      setIsChangingPassword(false)
                      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                      setIsPasswordValid(false)
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ========== 2FA MANAGEMENT CARD ========== */}
          <div className="profile-card">
            <h2>Two-Factor Authentication</h2>
            
            {!user.twoFactorEnabled && !backupCodes.length && (
              <div style={{ marginTop: '20px' }}>
                {!show2FASetup ? (
                  <>
                    <p style={{ marginBottom: '15px' }}>
                      Add an extra layer of security to your account with 2FA.
                    </p>
                    <button className="btn btn-primary" onClick={start2FASetup}>
                      Enable 2FA
                    </button>
                  </>
                ) : (
                  <div className="setup-2fa-box" style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
                    <h3>Scan this QR Code</h3>
                    <p>Use Google Authenticator or any TOTP app</p>
                    <div style={{ background: 'white', padding: '10px', width: 'fit-content', margin: '10px auto' }}>
                      <QRCodeSVG value={qrCodeUrl} size={200} />
                    </div>
                    <p>Enter the 6-digit code from your authenticator app:</p>
                    <input 
                      type="text" 
                      value={totpToken} 
                      onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                      placeholder="000000"
                      maxLength={6}
                      style={{ 
                        padding: '10px', 
                        fontSize: '18px', 
                        textAlign: 'center', 
                        width: '150px', 
                        display: 'block', 
                        margin: '10px auto',
                        letterSpacing: '5px'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '15px' }}>
                      <button className="btn btn-primary" onClick={enable2FA}>
                        Verify & Enable
                      </button>
                      <button 
                        className="btn btn-outline" 
                        onClick={() => {
                          setShow2FASetup(false)
                          setTotpToken('')
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {user.twoFactorEnabled && (
              <div style={{ marginTop: '20px' }}>
                <p style={{ color: '#10B981', marginBottom: '15px' }}>
                  ✅ Two-Factor Authentication is currently enabled
                </p>
                <button 
                  className="btn btn-outline" 
                  style={{ color: '#EF4444', borderColor: '#EF4444' }} 
                  onClick={handleDisable2FAClick}
                >
                  Disable 2FA
                </button>
              </div>
            )}

            {backupCodes.length > 0 && (
              <div className="backup-codes-section" style={{ marginTop: '20px', background: '#fff3cd', padding: '20px', borderRadius: '8px' }}>
                <h3 style={{ color: '#856404' }}>⚠️ Save these Backup Codes!</h3>
                <p>If you lose your phone, you can use these to login. <strong>They will only be shown once.</strong></p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px', fontFamily: 'monospace', fontSize: '14px' }}>
                  {backupCodes.map((code, i) => (
                    <span key={i} style={{ background: 'white', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
                      {code}
                    </span>
                  ))}
                </div>
                <button 
                  className="btn btn-primary" 
                  style={{ marginTop: '15px' }}
                  onClick={() => {
                    const text = backupCodes.join('\n')
                    navigator.clipboard.writeText(text)
                    toast.success('Backup codes copied to clipboard')
                  }}
                >
                  Copy All Codes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========== CUSTOM MODAL FOR DISABLE 2FA ========== */}
      {showDisable2FAModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            animation: 'fadeIn 0.2s ease-in-out'
          }}
          onClick={closeModal}
        >
          <div 
            style={{
              background: '#1a1a1a',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '500px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              animation: 'slideUp 0.3s ease-out',
              border: '1px solid rgba(212, 175, 55, 0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '24px 24px 16px 24px',
              borderBottom: '1px solid rgba(212, 175, 55, 0.1)'
            }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#D4AF37', fontWeight: 600 }}>
                Disable Two-Factor Authentication
              </h2>
              <button
                onClick={closeModal}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#888',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#fff'
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#888'
                  e.target.style.background = 'transparent'
                }}
                aria-label="Close"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <p style={{ color: '#ccc', marginBottom: '20px', lineHeight: 1.6 }}>
                Please enter your password to disable 2FA. This will make your account less secure.
              </p>

              <form onSubmit={handleDisable2FAConfirm}>
                <div className="form-group">
                  <label>Password</label>
                  <PasswordInput
                    name="modalPassword"
                    value={modalPassword}
                    onChange={(e) => setModalPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={closeModal}
                    disabled={modalLoading}
                    style={{ minWidth: '100px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={modalLoading || !modalPassword.trim()}
                    style={{ minWidth: '100px' }}
                  >
                    {modalLoading ? 'Confirming...' : 'Confirm'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

export default ProfilePage