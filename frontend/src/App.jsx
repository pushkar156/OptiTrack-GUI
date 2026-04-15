import React, { useState, useEffect } from 'react';
import './index.css';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem('optitrack_auth');
    return saved ? JSON.parse(saved) : { isLoggedIn: false, role: null };
  });
  
  const [activeTab, setActiveTab] = useState('inventory');
  const [stats, setStats] = useState({ totalProducts: 0, lowStockCount: 0, ordersProcessed: 0 });
  const [inventory, setInventory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    localStorage.setItem('optitrack_auth', JSON.stringify(auth));
    if (auth.isLoggedIn) {
      fetchDashboardData();
    }
  }, [auth]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, invRes, alertsRes, hubsRes, shipRes] = await Promise.all([
        fetch(`${API_URL}/stats`),
        fetch(`${API_URL}/inventory`),
        fetch(`${API_URL}/alerts`),
        fetch(`${API_URL}/hubs`),
        fetch(`${API_URL}/shipments`)
      ]);
      
      const statsData = await statsRes.json();
      const invData = await invRes.json();
      const alertsData = await alertsRes.json();
      const hubsData = await hubsRes.json();
      const shipData = await shipRes.json();
      
      setStats(statsData.error ? { totalProducts: 0, lowStockCount: 0, ordersProcessed: 0 } : statsData);
      setInventory(Array.isArray(invData) ? invData : []);
      setAlerts(Array.isArray(alertsData) ? alertsData : []);
      setHubs(Array.isArray(hubsData) ? hubsData : []);
      setShipments(Array.isArray(shipData) ? shipData : []);
      
    } catch (err) {
      console.error('System synchronization failed:', err);
      setInventory([]);
      setAlerts([]);
      setHubs([]);
      setShipments([]);
    } finally {
      setLoading(false);
    }
  };

  if (!auth.isLoggedIn) {
    return <LoginPage onLogin={(role) => setAuth({ isLoggedIn: true, role })} />;
  }

  const isAdmin = auth.role === 'ADMIN';

  // Safety check for filter
  const filteredInventory = Array.isArray(inventory) ? inventory.filter(item => 
    item.name?.toLowerCase().includes((searchTerm || '').toLowerCase()) || 
    item.asset_id?.toString().includes(searchTerm)
  ) : [];

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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <h2 className="section-title" style={{ margin: 0 }}>Active Inventory Flux</h2>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span className="material-icons-outlined" style={{ position: 'absolute', left: '1.25rem', color: '#666', fontSize: '1.1rem', pointerEvents: 'none' }}>search</span>
                    <input 
                      type="text" 
                      placeholder="SEARCH ASSET ID / NAME..." 
                      className="search-input"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ paddingLeft: '3.5rem', width: '320px', border: 'none' }}
                    />
                  </div>
                  {isAdmin && (
                    <>
                      <button className="btn-control" style={{ height: '48px' }} onClick={() => setIsRestockOpen(true)}>+ RESTOCK</button>
                      <button className="btn-control" style={{ height: '48px' }} onClick={() => setIsModalOpen(true)}>+ SHIPMENT</button>
                    </>
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

          {activeTab === 'logs' && (
            <section>
              <h2 className="section-title">Audit Trail & Shipment Ledger</h2>
              <table className="status-table" style={{ marginTop: '2rem' }}>
                <thead>
                  <tr>
                    <th>Log ID</th>
                    <th>Timestamp</th>
                    <th>Asset</th>
                    <th>Recipient</th>
                    <th>Units</th>
                    <th>Valuation</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.length > 0 ? shipments.map((s) => (
                    <tr key={s.order_id}>
                      <td style={{ color: 'var(--primary)', fontWeight: 800 }}>#ORDER-{s.order_id}</td>
                      <td>{new Date(s.order_date).toLocaleString()}</td>
                      <td>{s.product_name}</td>
                      <td>{s.customer_name}</td>
                      <td>{s.quantity}</td>
                      <td style={{ fontWeight: 600 }}>C {s.total_bill}</td>
                      <td>
                        <span className={`status-badge ${s.status?.toLowerCase()}`}>
                          {s.status?.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '4rem', color: '#444' }}>
                        <span className="material-icons-outlined" style={{ display: 'block', fontSize: '2rem', marginBottom: '1rem' }}>history</span>
                        NO SHIPMENT LOGS DETECTED IN LOCAL NETWORK
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
          )}
        </main>
      </div>

      {isModalOpen && <OrderModal onClose={() => setIsModalOpen(false)} onRefresh={fetchDashboardData} />}
      {isRestockOpen && <RestockModal onClose={() => setIsRestockOpen(false)} onRefresh={fetchDashboardData} />}
    </div>
  );
}

function RestockModal({ onClose, onRefresh }) {
  const [metadata, setMetadata] = useState({ products: [], warehouses: [], customers: [] });
  const [formData, setFormData] = useState({ product_id: '', warehouse_id: '', quantity: 10 });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/metadata`)
      .then(res => res.json())
      .then(data => setMetadata(data))
      .catch(err => console.error('Metadata sync failed:', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`${API_URL}/restock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'RESTOCK_SYSTEM_FAILURE');
      
      onRefresh();
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '450px' }}>
        <h2 className="section-title" style={{ marginBottom: '2rem' }}>INBOUND RESTOCK</h2>
        
        {error && <div style={{ background: 'rgba(255,0,0,0.05)', color: '#ff4444', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.7rem', border: '1px solid rgba(255,68,68,0.2)' }}>[SYSTEM_ERROR]: {error.toUpperCase()}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>TARGET ASSET</label>
            <select required value={formData.product_id} onChange={e => setFormData({...formData, product_id: e.target.value})}>
              <option value="">SELECT PRODUCT</option>
              {metadata.products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>RECEIVING HUB</label>
            <select required value={formData.warehouse_id} onChange={e => setFormData({...formData, warehouse_id: e.target.value})}>
              <option value="">SELECT WAREHOUSE</option>
              {metadata.warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>UNIT COUNT (ADDITION)</label>
            <input type="number" required value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2.5rem' }}>
            <button type="button" className="btn-control" style={{ background: 'transparent' }} onClick={onClose}>ABORT</button>
            <button type="submit" className="btn-control">RESTOCK</button>
          </div>
        </form>
      </div>
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
      .then(data => {
        setMetadata({
          products: Array.isArray(data.products) ? data.products : [],
          warehouses: Array.isArray(data.warehouses) ? data.warehouses : [],
          customers: Array.isArray(data.customers) ? data.customers : []
        });
      })
      .catch(err => {
        console.error('Metadata sync failed:', err);
        setMetadata({ products: [], warehouses: [], customers: [] });
      });
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
      <div className="modal-content" style={{ maxWidth: '700px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h2 className="section-title" style={{ marginBottom: '0.25rem' }}>INITIALIZE SHIPMENT</h2>
            <p style={{ color: '#444', fontSize: '0.7rem', fontWeight: 800 }}>PROTOCOL: INVENTORY_FLUX_v4.2</p>
          </div>
          <span className="material-icons-outlined" style={{ color: 'var(--primary)', fontSize: '2rem' }}>cloud_upload</span>
        </div>
        
        {error && <div style={{ background: 'rgba(255,0,0,0.05)', color: '#ff4444', padding: '1.25rem', marginBottom: '2rem', fontSize: '0.8rem', border: '1px solid rgba(255,68,68,0.2)', fontFamily: 'monospace' }}>[SYSTEM_ERROR]: {error.toUpperCase()}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className="form-group">
              <label><span className="material-icons-outlined" style={{ fontSize: '0.8rem', verticalAlign: 'middle', marginRight: '0.5rem' }}>inventory_2</span>TARGET ASSET</label>
              <select required value={formData.product_id} onChange={e => setFormData({...formData, product_id: e.target.value})}>
                <option value="">SELECT PRODUCT</option>
                {metadata.products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label><span className="material-icons-outlined" style={{ fontSize: '0.8rem', verticalAlign: 'middle', marginRight: '0.5rem' }}>warehouse</span>LOGISTICS HUB</label>
              <select required value={formData.warehouse_id} onChange={e => setFormData({...formData, warehouse_id: e.target.value})}>
                <option value="">SELECT WAREHOUSE</option>
                {metadata.warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label><span className="material-icons-outlined" style={{ fontSize: '0.8rem', verticalAlign: 'middle', marginRight: '0.5rem' }}>account_circle</span>RECIPIENT OPERATOR</label>
            <select required value={formData.customer_id} onChange={e => setFormData({...formData, customer_id: e.target.value})}>
              <option value="">SELECT CUSTOMER</option>
              {metadata.customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className="form-group">
              <label><span className="material-icons-outlined" style={{ fontSize: '0.8rem', verticalAlign: 'middle', marginRight: '0.5rem' }}>numbers</span>UNITS</label>
              <input type="number" required value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
            </div>
            <div className="form-group">
              <label><span className="material-icons-outlined" style={{ fontSize: '0.8rem', verticalAlign: 'middle', marginRight: '0.5rem' }}>payments</span>VALUATION (CREDITS)</label>
              <input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '3rem' }}>
            <button type="button" className="btn-control" style={{ background: 'transparent', color: '#888', border: '1px solid #333' }} onClick={onClose}>ABORT PROTOCOL</button>
            <button type="submit" className="btn-control" style={{ boxShadow: '0 0 20px rgba(204, 255, 0, 0.2)' }}>INITIALIZE SHIPMENT</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuth = (e) => {
    e.preventDefault();
    setError('');

    // --- CONFIGURE YOUR CREDENTIALS HERE ---
    const ADMIN_CREDENTIALS = { user: 'admin', pass: 'admin123' };
    const STAFF_CREDENTIALS = { user: 'staff', pass: 'staff123' };

    if (username === ADMIN_CREDENTIALS.user && password === ADMIN_CREDENTIALS.pass) {
      onLogin('ADMIN');
    } else if (username === STAFF_CREDENTIALS.user && password === STAFF_CREDENTIALS.pass) {
      onLogin('STAFF');
    } else {
      setError('INVALID CREDENTIALS: ACCESS DENIED');
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
      <div style={{ width: '400px', padding: '4rem', border: '1px solid #222', background: '#0D0D0D', textAlign: 'center' }}>
        <div style={{ color: 'var(--primary)', marginBottom: '2rem' }}>
          <span className="material-icons-outlined" style={{ fontSize: '3rem' }}>radar</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--primary)', fontSize: '2rem', marginBottom: '1rem', textTransform: 'uppercase' }}>Initialize System</h1>
        <p style={{ color: '#666', marginBottom: '3rem', fontSize: '0.9rem' }}>ENTER SECURITY CREDENTIALS TO GAIN ACCESS</p>
        
        {error && <div style={{ color: '#ff4444', fontSize: '0.7rem', marginBottom: '2rem', border: '1px solid rgba(255,0,0,0.2)', padding: '1rem', background: 'rgba(255,0,0,0.05)' }}>[SECURITY_ALERT]: {error}</div>}

        <form onSubmit={handleAuth} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ color: '#444', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', display: 'block', marginBottom: '0.5rem' }}>OPERATOR ID</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%', padding: '1rem', background: '#111', border: 'none', borderBottom: '2px solid #222', color: '#fff' }} 
              placeholder="Username" 
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
              placeholder="Password" 
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


