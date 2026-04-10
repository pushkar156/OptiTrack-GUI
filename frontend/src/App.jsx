import React, { useState } from 'react';
import './index.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('inventory');

  const inventoryData = [
    { id: 'OT-902', name: 'NEURAL LINK MOD', category: 'BIO-TECH', hub: 'HUB ALPHA', stock: 8, status: 'CRITICAL' },
    { id: 'OT-741', name: 'FLUX CAPACITOR', category: 'ENERGY', hub: 'HUB BETA', stock: 45, status: 'OPTIMAL' },
    { id: 'OT-332', name: 'GRAPHENE SHEET', category: 'MATERIALS', hub: 'HUB GAMMA', stock: 120, status: 'OPTIMAL' },
    { id: 'OT-105', name: 'OPTIC SENSOR', category: 'HARDWARE', hub: 'HUB OMEGA', stock: 15, status: 'WARNING' },
    { id: 'OT-882', name: 'QUANTUM PROC', category: 'HARDWARE', hub: 'HUB ALPHA', stock: 42, status: 'OPTIMAL' },
  ];

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

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
          <NavItem label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem label="Inventory" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
          <NavItem label="Hub Logistics" active={activeTab === 'logistics'} onClick={() => setActiveTab('logistics')} />
          <NavItem label="System Alerts" active={activeTab === 'alerts'} onClick={() => setActiveTab('alerts')} />
          <NavItem label="Access Logs" active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} />
        </nav>
        
        <div style={{ marginTop: 'auto', padding: '0 2.5rem' }}>
          <p style={{ color: '#444', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.2em' }}>VERSION 4.2.0</p>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        {/* Top Nav */}
        <header className="top-nav">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="material-icons-outlined" style={{ color: 'var(--primary)' }}>radar</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '0.1em' }}>OPTITRACK</span>
          </div>
          <button className="btn-control" onClick={() => setIsLoggedIn(false)}>ADMIN CONTROL CENTER</button>
        </header>

        <main>
          {/* Metrics */}
          <section className="metrics-grid">
            <MetricCard label="TOTAL ASSETS" value="1,284" />
            <MetricCard label="CRITICAL ALERTS" value="09" isCritical />
            <MetricCard label="ACTIVE HUBS" value="14" />
          </section>

          {/* Table */}
          <section>
            <h2 className="section-title">Active Inventory Flux</h2>
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
                {inventoryData.map((item) => (
                  <tr key={item.id}>
                    <td style={{ color: 'var(--primary)', fontWeight: 700 }}>{item.id}</td>
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
        </main>
      </div>
    </div>
  );
}

function LoginPage({ onLogin }) {
  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
      <div style={{ width: '400px', padding: '4rem', border: '1px solid #222', background: '#0D0D0D', textAlign: 'center' }}>
        <div style={{ color: 'var(--primary)', marginBottom: '2rem' }}>
          <span className="material-icons-outlined" style={{ fontSize: '3rem' }}>radar</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--primary)', fontSize: '2rem', marginBottom: '1rem', textTransform: 'uppercase' }}>Initialize System</h1>
        <p style={{ color: '#666', marginBottom: '3rem', fontSize: '0.9rem' }}>ENTER SECURITY CREDENTIALS TO GAIN ACCESS</p>
        
        <form onSubmit={(e) => { e.preventDefault(); onLogin(); }} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ color: '#444', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', display: 'block', marginBottom: '0.5rem' }}>OPERATOR ID</label>
            <input type="text" style={{ width: '100%', padding: '1rem', background: '#111', border: 'none', borderBottom: '2px solid #222', color: '#fff' }} placeholder="ADMIN_USR" />
          </div>
          <div style={{ marginBottom: '2.5rem' }}>
            <label style={{ color: '#444', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', display: 'block', marginBottom: '0.5rem' }}>SECURITY KEY</label>
            <input type="password" style={{ width: '100%', padding: '1rem', background: '#111', border: 'none', borderBottom: '2px solid #222', color: '#fff' }} placeholder="••••••••" />
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


