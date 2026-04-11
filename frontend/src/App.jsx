import React, { useState, useEffect } from 'react';
import './index.css';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [auth, setAuth] = useState({ isLoggedIn: false, role: null });
  const [activeTab, setActiveTab] = useState('inventory');
  const [stats, setStats] = useState({ totalProducts: 0, lowStockCount: 0, ordersProcessed: 0 });
  const [inventory, setInventory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (auth.isLoggedIn) {
      fetchDashboardData();
    }
  }, [auth]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, invRes, alertsRes, hubsRes] = await Promise.all([
        fetch(`${API_URL}/stats`),
        fetch(`${API_URL}/inventory`),
        fetch(`${API_URL}/alerts`),
        fetch(`${API_URL}/hubs`)
      ]);
      const statsData = await statsRes.json();
      const invData = await invRes.json();
      const alertsData = await alertsRes.json();
      const hubsData = await hubsRes.json();
      
      setStats(statsData);
      setInventory(invData);
      setAlerts(alertsData);
      setHubs(hubsData);
    } catch (err) {
      console.error('System synchronization failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!auth.isLoggedIn) {
    return <LoginPage onLogin={(role) => setAuth({ isLoggedIn: true, role })} />;
  }

  const isAdmin = auth.role === 'ADMIN';

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.asset_id.toString().includes(searchTerm)
  );

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside>
        <div style={{ padding: '0 2.5rem', marginBottom: '3rem' }}>
          <div style={{ width: '40px', height: '40px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justify_content: 'center' }}>
            <span className="material-icons-outlined" style={{ color: '#000' }}>settings_input_component</span>
          </div>
        </div>
        <nav>
          <NavItem label="Dashboard" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
          {isAdmin && <NavItem label="Hub Logistics" active={activeTab === 'logistics'} onClick={() => setActiveTab('logistics')} />}
          <NavItem label="System Alerts" active={activeTab === 'alerts'} onClick={() => setActiveTab('alerts')} />
          {isAdmin && <NavItem label="Access Logs" active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} />}
        </nav>
        
        <div style={{ marginTop: 'auto', padding: '0 2.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ color: 'var(--primary)', fontSize: '0.7rem', fontWeight: 800 }}>ID: {auth.role}_OPS</p>
            <p style={{ color: '#444', fontSize: '0.6rem' }}>STATUS: ONLINE</p>
          </div>
          <p style={{ color: '#444', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.2em' }}>VERSION 4.2.0</p>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <header className="top-nav">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="material-icons-outlined" style={{ color: 'var(--primary)' }}>radar</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '0.1em' }}>OPTITRACK / {activeTab.toUpperCase()}</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn-control" onClick={() => fetchDashboardData()}>SYNC NETWORK</button>
            <button className="btn-control" onClick={() => setAuth({ isLoggedIn: false, role: null })}>LOGOUT SESSION</button>
          </div>
        </header>

        <main>
          {/* Metrics - Shared across views */}
          <section className="metrics-grid">
            <MetricCard label="TOTAL ASSETS" value={loading ? '...' : stats.totalProducts} />
            <MetricCard label="CRITICAL ALERTS" value={loading ? '...' : stats.lowStockCount} isCritical={stats.lowStockCount > 0} />
            <MetricCard label="ORDERS SYNCED" value={loading ? '...' : stats.ordersProcessed} />
          </section>

          {activeTab === 'inventory' && (
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 className="section-title">Active Inventory Flux</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ position: 'relative' }}>
                    <span className="material-icons-outlined" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', color: '#444' }}>search</span>
                    <input 
                      type="text" 
                      placeholder="SEARCH ASSET ID / NAME..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ padding: '0.5rem 1rem 0.5rem 2.5rem', background: '#111', border: '1px solid #222', color: '#fff', fontSize: '0.7rem', width: '250px' }}
                    />
                  </div>
                  {isAdmin && (
                    <button className="btn-control" onClick={() => setIsModalOpen(true)} style={{ padding: '0.5rem 1.5rem', fontSize: '0.7rem' }}>
                      + INIT NEW SHIPMENT
                    </button>
                  )}
                </div>
              </div>
              
              <table className="status-table">
                <thead>
                  <tr>
                    <th>Asset ID</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Stock</th>
                    <th>Status</th>
                    {isAdmin && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item) => (
                    <tr key={item.asset_id}>
                      <td style={{ color: 'var(--primary)', fontWeight: 700 }}>OT-{item.asset_id}</td>
                      <td style={{ fontWeight: 600 }}>{item.name}</td>
                      <td style={{ color: '#666' }}>{item.category}</td>
                      <td>{item.hub}</td>
                      <td>{item.stock} UNITS</td>
                      <td>
                        <span className={`badge ${item.status.toLowerCase()}`}>
                          {item.status}
                        </span>
                      </td>
                      {isAdmin && (
                        <td>
                          <button style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
                            <span className="material-icons-outlined">settings</span>
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {activeTab === 'alerts' && (
            <section>
              <h2 className="section-title">Critical Threshold Alerts</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
                {alerts.map((alert, i) => (
                  <div key={i} style={{ border: '1px solid var(--primary)', padding: '2rem', background: 'rgba(204, 255, 0, 0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                      <span className="material-icons-outlined" style={{ color: 'var(--primary)' }}>report_problem</span>
                      <span className="badge critical">CRITICAL</span>
                    </div>
                    <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '0.5rem' }}>{alert.product_name}</h3>
                    <p style={{ color: '#666', fontSize: '0.8rem', marginBottom: '1.5rem' }}>LOCATION: {alert.warehouse_name}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ fontSize: '0.7rem', color: '#444' }}>REMAINING UNITS</p>
                      <p style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 800 }}>{alert.items_remaining}</p>
                    </div>
                  </div>
                ))}
                {alerts.length === 0 && <p style={{ color: '#444' }}>No active critical alerts detected.</p>}
              </div>
            </section>
          )}

          {activeTab === 'logistics' && (
            <section>
              <h2 className="section-title">Global Hub Operations</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
                {hubs.map((hub) => (
                  <div key={hub.id} style={{ border: '1px solid #222', padding: '2rem', background: '#0D0D0D' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h3 style={{ fontSize: '1.1rem', color: 'var(--primary)', fontWeight: 800 }}>{hub.name}</h3>
                      <span style={{ color: '#444', fontSize: '0.7rem' }}>HUB_ID: {hub.id}</span>
                    </div>
                    <p style={{ color: '#666', fontSize: '0.8rem', marginBottom: '1.5rem' }}>LOCATION: {hub.location}</p>
                    
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#444', marginBottom: '0.5rem' }}>
                        <span>CAPACITY UTILIZATION</span>
                        <span>{Math.round(hub.utilization || 0)}%</span>
                      </div>
                      <div style={{ height: '2px', background: '#111', width: '100%', position: 'relative' }}>
                        <div style={{ height: '100%', background: 'var(--primary)', width: `${Math.min(hub.utilization || 0, 100)}%` }}></div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ fontSize: '0.7rem', color: '#444' }}>STORAGE UNITS</p>
                      <p style={{ fontSize: '1rem', color: '#fff', fontWeight: 600 }}>{hub.current_stock || 0} / {hub.capacity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      {isModalOpen && <OrderModal onClose={() => setIsModalOpen(false)} onRefresh={fetchDashboardData} />}
    </div>
  );
}


function OrderModal({ onClose, onRefresh }) {
  const [metadata, setMetadata] = useState({ products: [], warehouses: [], customers: [] });
  const [formData, setFormData] = useState({ product_id: '', warehouse_id: '', customer_id: '', quantity: 1, price: 0 });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/metadata`)
      .then(res => res.json())
      .then(data => setMetadata(data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      onRefresh();
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="section-title" style={{ marginBottom: '2rem' }}>INITIALIZE SHIPMENT</h2>
        
        {error && <div style={{ background: 'rgba(255,0,0,0.1)', color: '#ff4444', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.8rem', border: '1px solid #ff4444' }}>ERROR: {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>TARGET ASSET</label>
            <select required value={formData.product_id} onChange={e => setFormData({...formData, product_id: e.target.value})}>
              <option value="">SELECT PRODUCT</option>
              {metadata.products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>LOGISTICS HUB</label>
            <select required value={formData.warehouse_id} onChange={e => setFormData({...formData, warehouse_id: e.target.value})}>
              <option value="">SELECT WAREHOUSE</option>
              {metadata.warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>RECIPIENT OPERATOR</label>
            <select required value={formData.customer_id} onChange={e => setFormData({...formData, customer_id: e.target.value})}>
              <option value="">SELECT CUSTOMER</option>
              {metadata.customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>UNITS</label>
              <input type="number" required value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
            </div>
            <div className="form-group">
              <label>VALUATION (CREDITS)</label>
              <input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn-control" style={{ background: 'transparent', color: '#666', border: '1px solid #222' }} onClick={onClose}>ABORT</button>
            <button type="submit" className="btn-control">INITIALIZE</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = (e) => {
    e.preventDefault();
    const role = username.toLowerCase().includes('admin') ? 'ADMIN' : 'STAFF';
    onLogin(role);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
      <div style={{ width: '400px', padding: '4rem', border: '1px solid #222', background: '#0D0D0D', textAlign: 'center' }}>
        <div style={{ color: 'var(--primary)', marginBottom: '2rem' }}>
          <span className="material-icons-outlined" style={{ fontSize: '3rem' }}>radar</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--primary)', fontSize: '2rem', marginBottom: '1rem', textTransform: 'uppercase' }}>Initialize System</h1>
        <p style={{ color: '#666', marginBottom: '3rem', fontSize: '0.9rem' }}>ENTER SECURITY CREDENTIALS TO GAIN ACCESS</p>
        
        <form onSubmit={handleAuth} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ color: '#444', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', display: 'block', marginBottom: '0.5rem' }}>OPERATOR ID</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%', padding: '1rem', background: '#111', border: 'none', borderBottom: '2px solid #222', color: '#fff' }} 
              placeholder="Enter name (e.g. 'Pushkar Admin')" 
              required
            />
          </div>
          <div style={{ marginBottom: '2.5rem' }}>
            <label style={{ color: '#444', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', display: 'block', marginBottom: '0.5rem' }}>SECURITY KEY</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '1rem', background: '#111', border: 'none', borderBottom: '2px solid #222', color: '#fff' }} 
              placeholder="••••••••" 
              required
            />
          </div>
          <button type="submit" className="btn-control" style={{ width: '100%' }}>Establish Connection</button>
        </form>
      </div>
    </div>
  );
}

function NavItem({ label, active, onClick }) {
  return (
    <div className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>
      {label}
    </div>
  );
}

function MetricCard({ label, value, isCritical }) {
  return (
    <div className={`metric-card ${isCritical ? 'critical' : ''}`}>
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
    </div>
  );
}

export default App;


