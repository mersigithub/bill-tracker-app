export const verifyAdminToken = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return false;
  
    try {
      const response = await fetch('http://localhost:5000/api/admin/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.ok;
    } catch (err) {
      console.error('Token verification failed:', err);
      return false;
    }
  };