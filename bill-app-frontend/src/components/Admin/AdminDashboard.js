import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('invoices');
  const [invoices, setInvoices] = useState([]);
  const [members, setMembers] = useState([]);
  const [months, setMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('adminToken');

  // ✅ Fetch available months dynamically
  useEffect(() => {
    const fetchMonths = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/invoices/months`, {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        const rawMonths = res.data.data || [];
  
        const formattedMonths = rawMonths.map(month => ({
          value: month,
          label: month
        }));
  
        setMonths(formattedMonths);
      } catch (err) {
        console.error('Error fetching months:', err);
      }
    };
  
    fetchMonths();
  }, [token]);  
  

  // ✅ Fetch Invoices (All or by month)
  const fetchAllInvoices = useCallback(async (month = '') => {
    setIsLoading(true);
    setError(null);
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const endpoint = month
        ? `/api/invoices/month/${month}`
        : '/api/admin/invoices';

      const response = await axios.get(`${API_BASE_URL}${endpoint}`, config);

      const invoiceData = response.data.invoices || response.data.data || [];
      if (!Array.isArray(invoiceData)) throw new Error('Invalid invoice data');

      setInvoices(invoiceData);
    } catch (err) {
      console.error('Invoice fetch error:', err);
      setError(err.response?.data?.message || err.message);

      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, navigate]);

  // ✅ Fetch Members
  const fetchAllMembers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get(`${API_BASE_URL}/api/admin/members`, config);
      const membersData = response.data.data || response.data.users || response.data;
      const filtered = membersData.filter(user =>
        user.role === 'user' || user.role === 'member' || !user.role
      );

      setMembers(filtered);
    } catch (err) {
      console.error('Member fetch error:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'invoices' && selectedMonth) {
      fetchAllInvoices(selectedMonth);
    } else if (activeTab === 'members') {
      fetchAllMembers();
    }
  }, [activeTab, fetchAllInvoices, fetchAllMembers, selectedMonth]);

  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    if (month) fetchAllInvoices(month);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Admin Dashboard</h2>
        <div className="header-actions">
          <button
            onClick={() => setActiveTab('members')}
            className={`btn ${activeTab === 'members' ? 'btn-active' : ''}`}
          >
            Members
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`btn ${activeTab === 'invoices' ? 'btn-active' : ''}`}
          >
            View Invoices
          </button>
          <button
            onClick={() => setActiveTab('')}
            className={`btn ${activeTab === '' ? 'btn-active' : ''}`}
          >
            Estatistics
          </button>
          <div className="exit-button-container">
            <button
              onClick={() => {
                localStorage.removeItem('adminToken');
                navigate('/admin');
              }}
              className="btn btn-exit"
            >
              Exit
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'invoices' && (
        <div className="tab-content">
          <div className="controls">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="month-filter"
          >
            <option value="">Select Month</option>
            {months.map(month => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>

          </div>

          {isLoading ? (
            <div className="loading-message">Loading invoices...</div>
          ) : (
            <div className="data-list">
              {invoices.length === 0 ? (
                <p className="no-data">No invoices found</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Month</th>
                      <th>File Type</th>
                      <th>Upload Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice._id || invoice.id}>
                        <td>
                          {invoice.user
                            ? `${invoice.user.firstname || 'N/A'} (${invoice.user.email || 'N/A'})`
                            : 'Unknown user'}
                        </td>
                        <td>{invoice.month || 'N/A'}</td>
                        <td>{invoice.fileType || 'N/A'}</td>
                        <td>{invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          {invoice.url && (
                            <a
                              href={`${API_BASE_URL}${invoice.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-view"
                            >
                              View
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'members' && (
        <div className="tab-content">
          {isLoading ? (
            <div className="loading-message">Loading members...</div>
          ) : (
            <div className="data-list">
              {members.length === 0 ? (
                <p className="no-data">No members found</p>
              ) : (
                <>
                  <p className="member-count">Total members: {members.length}</p>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>Phone Number</th>
                        <th>Role</th>
                        <th>Join Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((member) => (
                        <tr key={member._id || member.id}>
                          <td>{member.firstname || 'N/A'}</td>
                          <td>{member.lastname || 'N/A'}</td>
                          <td>{member.email || 'N/A'}</td>
                          <td>{member.phonenumber || 'N/A'}</td>
                          <td>{member.role || 'N/A'}</td>
                          <td>{member.createdAt ? new Date(member.createdAt).toLocaleDateString() : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
