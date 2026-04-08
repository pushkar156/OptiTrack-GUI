import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, AlertTriangle, ShoppingCart, BarChart3, Database, Warehouse, UserCircle } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ totalProducts: 0, lowStockItems: 0, totalOrders: 0 });
  const [products, setProducts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE}/login`, credentials);
      setUser(res.data);
      setLoading(false);
    } catch (err) {
      setError('Invalid username or password');
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [sRes, pRes, aRes] = await Promise.all([
        axios.get(`${API_BASE}/stats`),
        axios.get(`${API_BASE}/products`),
        axios.get(`${API_BASE}/alerts`)
      ]);
      setStats(sRes.data);
      setProducts(pRes.data);
      setAlerts(aRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="login-view">
        <div className="login-form glass-card">
          <Database size={56} color="#a3a6ff" style={{ marginBottom: '1.5rem' }} />
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Observatory Login</h1>
          <p style={{ color: '#a3aac4', fontSize: '0.875rem', marginBottom: '2.5rem' }}>System Integrity: Secure Access Required</p>
          
          {error && <div style={{ color: '#ff6e84', marginBottom: '1.5rem', fontSize: '0.875rem' }}>{error}</div>}
          
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1rem' }}>
              <label className="input-label">Identity</label>
              <input 
                type="text" 
                className="input-field"
                placeholder="Username (admin/staff)"
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              />
            </div>
            <div style={{ marginBottom: '2rem' }}>
              <label className="input-label">Access Code</label>
              <input 
                 type="password" 
                 className="input-field"
                 placeholder="••••••••"
                 value={credentials.password}
                 onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              />
            </div>
            <button type="submit" disabled={loading} className="primary" style={{ width: '100%' }}>
              {loading ? 'Authenticating...' : 'Enter System'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header>
        <div className="logo">
          <Database size={36} />
          OptiTrack
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{user.role}</div>
          </div>
          {user.role === 'Admin' && <button className="secondary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.875rem' }}>System Console</button>}
          <button 
            onClick={() => setUser(null)}
            className="secondary"
            style={{ padding: '0.6rem 1.2rem', fontSize: '0.875rem' }}
          >
            Terminal Out
          </button>
        </div>
      </header>

      <section style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 300, marginBottom: '0.5rem' }}>{user.role} Overview</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px' }}>Real-time synchronization across logistics hubs. Inventory integrity is currently <span style={{ color: 'var(--primary)' }}>99.8%</span>.</p>
      </section>

      {/* Stats Section */}
      <div className="stats-grid">
        <div className="glass-card">
          <div className="stat-label">Total Fleet Units</div>
          <div className="stat-value">{stats.totalProducts}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontSize: '0.75rem' }}>
            <BarChart3 size={14} /> +12% from last cycle
          </div>
        </div>
        <div className="glass-card">
          <div className="stat-label">Critical Flux</div>
          <div className="stat-value" style={{ color: stats.lowStockItems > 0 ? 'var(--error)' : 'inherit' }}>
            {stats.lowStockItems}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
            <AlertTriangle size={14} /> Requires attention
          </div>
        </div>
        <div className="glass-card">
          <div className="stat-label">Protocol Shifts</div>
          <div className="stat-value">{stats.totalOrders}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontSize: '0.75rem' }}>
            <ShoppingCart size={14} /> Real-time active
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2.5rem', alignItems: 'start' }}>
        {/* Inventory List */}
        <section className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '2rem', letterSpacing: '0.05em' }}>Inventory Integrity Flux</h2>
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Identifier</th>
                <th>Classification</th>
                <th>Magnitude</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.pname}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{p.category}</td>
                  <td>{p.total_stock || 0} units</td>
                  <td>
                    <span className={`status-chip ${p.total_stock <= 10 ? 'status-error' : 'status-stable'}`}>
                      {p.total_stock <= 10 ? 'DEPLETED' : 'STABLE'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Localized Alerts */}
        <aside className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Warehouse size={18} /> Logistics Alerts
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {alerts.length > 0 ? alerts.map((alert, idx) => (
              <div key={idx} style={{ paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem' }}>{alert.product_name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Location: <span style={{ color: 'var(--text-primary)' }}>{alert.warehouse_name}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--error)', marginTop: '0.25rem', fontWeight: 700 }}>
                   Critical: {alert.items_remaining} units
                </div>
              </div>
            )) : (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>
                All systems reporting functional levels.
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;
