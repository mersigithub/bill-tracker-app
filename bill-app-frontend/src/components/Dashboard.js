import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './Auth/AuthContext';
import axios from 'axios';
import './Dashboard.css';
import Notification from './Notification'; 
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://bill-app-backend-production.up.railway.app';

const Dashboard = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  
  // State for Upload Invoices
  const [showUpload, setShowUpload] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [file, setFile] = useState(null);
  
  // State for View Invoices
  const [showInvoices, setShowInvoices] = useState(false);
  const [userInvoices, setUserInvoices] = useState({});
  const [viewingMonth, setViewingMonth] = useState(null);

  // Common states
  const [showEmail, setShowEmail] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Notification States
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Initialize axios defaults and token storage
  useEffect(() => {
    if (user?.token) {
      localStorage.setItem('token', user.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
    }
  }, [user]);

  // Axios response interceptor for token errors
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          setError('Session expired. Please login again.');
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [logout]);

  // Fetch user's invoices
  const fetchUserInvoices = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/invoices`);
      
      const groupedInvoices = {};
      response.data.data.forEach(invoice => {
        if (!groupedInvoices[invoice.month]) {
          groupedInvoices[invoice.month] = {
            url: `${API_BASE_URL}${invoice.url}`,
            id: invoice._id,
            fileType: invoice.fileType,
            month: invoice.month,
            createdAt: invoice.createdAt
          };
        }
      });

      setUserInvoices(groupedInvoices);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError(err.response?.data?.message || 'Failed to fetch invoices');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (showInvoices) {
      fetchUserInvoices();
    }
  }, [showInvoices, fetchUserInvoices]);

  // Handle new notifications (simulate for now)
  const addNotification = (message) => {
    const newNotification = { id: new Date().toISOString(), message, read: false };
    setNotifications((prev) => [newNotification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  };

  // Mark notifications as read when bell is clicked
  const handleBellClick = () => {
    setUnreadCount(0);
    setShowNotifications(!showNotifications);
  };

  // Mark a notification as read
  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(selectedFile.type)) {
        setError('Only JPEG, PNG, and PDF files are allowed');
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedMonth || !file) {
      setError('Please select a month and a file');
      return;
    }

    if (userInvoices[selectedMonth]) {
      setError(`Invoice for ${selectedMonth} already exists`);
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('month', selectedMonth);
      formData.append('invoice', file);

      await axios.post(`${API_BASE_URL}/api/invoices/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess(`Invoice for ${selectedMonth} uploaded successfully!`);
      fetchUserInvoices();

      setSelectedMonth('');
      setFile(null);
      setShowUpload(false);

      // Add notification when reminder email is sent
      addNotification(`Reminder sent for ${selectedMonth}`); // You can replace this with real email logic

    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Failed to upload invoice');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (!user) {
    window.location.href = '/login'; 
    return null;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          {user && (
            <div>
              <span 
                className="user-welcome"
                onClick={() => setShowEmail(!showEmail)}
              >
                Welcome, {user.firstname}
              </span>
              {showEmail && (
                <div className="user-email">
                  {user.email}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="header-actions">
          <button 
            onClick={() => {
              setShowUpload(false);
              setShowInvoices(prev => !prev);
              setViewingMonth(null);
              setError(null);
              setSuccess(null);
            }}
            className="btn btn-invoices"
          >
            {showInvoices ? 'Hide Invoices' : 'View Invoices'}
          </button>

          <button 
            onClick={() => {
              setShowInvoices(false);
              setShowUpload(prev => !prev);
              setSelectedMonth('');
              setFile(null);
              setError(null);
              setSuccess(null);
            }}
            className="btn btn-upload"
          >
            {showUpload ? 'Hide Upload' : 'Upload Invoice'}
          </button>

          <button onClick={() => logout(navigate)} className="btn btn-logout">
            Logout
          </button>

          <Notification
            notifications={notifications}
            unreadCount={unreadCount}
            showNotifications={showNotifications}
            onBellClick={handleBellClick}
            onMarkAsRead={markAsRead}
          />
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showUpload && (
        <div className="upload-form-container">
          <h3>Upload Invoice</h3>
          <form onSubmit={handleUploadSubmit}>
            <div className="form-group">
              <label>Select Month:</label>
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                required
              >
                <option value="">-- Select Month --</option>
                {months.map((month) => (
                  <option 
                    key={month} 
                    value={month}
                    disabled={!!userInvoices[month]}
                  >
                    {month} {userInvoices[month] ? '(Uploaded)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Choose File (JPEG, PNG, PDF, max 5MB):</label>
              <input 
                type="file" 
                accept=".jpeg,.jpg,.png,.pdf"
                onChange={handleFileChange}
                required
              />
              {file && (
                <div className="file-selected">
                  Selected: {file.name} ({Math.round(file.size / 1024)} KB)
                </div>
              )}
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                disabled={isLoading}
                className="btn btn-submit"
              >
                {isLoading ? 'Uploading...' : 'Upload'}
              </button>

              <button 
                type="button" 
                onClick={() => {
                  setShowUpload(false);
                  setSelectedMonth('');
                  setFile(null);
                  setError(null);
                }}
                disabled={isLoading}
                className="btn btn-cancel"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {showInvoices && (
        <div className="invoices-view-container">
          <h2>Your Monthly Invoices</h2>

          {isLoading ? (
            <div className="loading-spinner">Loading invoices...</div>
          ) : (
            <div className="months-grid">
              {months.map(month => (
                <div 
                  key={month} 
                  className={`month-card ${userInvoices[month] ? 'has-invoice' : 'no-invoice'}`}
                  onClick={() => userInvoices[month] && setViewingMonth(month)}
                >
                  <h3>{month}</h3>
                  {userInvoices[month] ? (
                    <div className="invoice-status">
                      <span className="status-badge uploaded">Uploaded</span>
                      <small>{new Date(userInvoices[month].createdAt).toLocaleDateString()}</small>
                    </div>
                  ) : (
                    <span className="status-badge missing">No Invoice</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {viewingMonth && userInvoices[viewingMonth] && (
            <div className="invoice-details">
              <h3>Invoice for {viewingMonth}</h3>
              {userInvoices[viewingMonth].fileType === 'application/pdf' ? (
                <iframe 
                  src={userInvoices[viewingMonth].url} 
                  title={`Invoice for ${viewingMonth}`}
                  className="invoice-preview"
                />
              ) : (
                <img
                  src={userInvoices[viewingMonth].url}
                  alt={`Invoice for ${viewingMonth}`}
                  className="invoice-image"
                />
              )}
              <div className="invoice-actions">
                <a 
                  href={userInvoices[viewingMonth].url} 
                  download
                  className="btn btn-download"
                >
                  Download
                </a>
                <button 
                  onClick={() => setViewingMonth(null)}
                  className="btn btn-close"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;