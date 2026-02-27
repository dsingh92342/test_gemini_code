import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, Search, ArrowLeft, Trash2, Phone, Calendar, 
  Receipt, TrendingUp, Download, Upload, 
  MessageCircle, Edit2, X, Users, Wallet, 
  Moon, Sun, Filter, Share2, Printer, ChevronDown, CheckCircle2
} from 'lucide-react';
import { useUdharData } from './hooks/useUdharData';
import { formatCurrency, formatDate } from './utils/formatters';
import { generateWhatsAppLink } from './utils/whatsapp';

// --- Sub-components ---

const DashboardHeader = ({ darkMode, setDarkMode, onExport, onImport }) => (
  <header className="app-header animate-slide-up no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.04em', background: 'linear-gradient(to right, var(--primary), #818CF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Udhar Khata Pro
      </h1>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Smart Credit Ledger</p>
    </div>
    <div style={{ display: 'flex', gap: '8px' }}>
      <button className="btn-icon" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>
      <button className="btn-icon" onClick={onExport} title="Export Data"><Download size={20} /></button>
      <label className="btn-icon" style={{ cursor: 'pointer' }}>
        <Upload size={20} />
        <input type="file" hidden onChange={onImport} accept=".json" />
      </label>
    </div>
  </header>
);

const ProStatCard = ({ label, value, colorClass, icon: Icon, isFull }) => (
  <div className={`glass animate-slide-up ${isFull ? 'full-width' : ''}`} style={{ padding: '24px', gridColumn: isFull ? 'span 2' : 'span 1', display: 'flex', flexDirection: 'column', gap: '4px', border: 'none', background: isFull ? 'linear-gradient(135deg, var(--primary), #818CF8)' : 'var(--surface)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: isFull ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)' }}>{label}</span>
      {Icon && <Icon size={16} style={{ color: isFull ? 'white' : 'var(--text-muted)', opacity: 0.6 }} />}
    </div>
    <div className={`amount-display ${colorClass}`} style={{ color: isFull ? 'white' : 'inherit', fontSize: isFull ? '2rem' : '1.4rem' }}>
      {formatCurrency(Math.abs(value))}
    </div>
    {isFull && <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>{value >= 0 ? 'Net Debt' : 'Net Credit'}</div>}
  </div>
);

const SortingTabs = ({ active, onChange }) => (
  <div className="sort-tabs no-print">
    <div className={`sort-tab ${active === 'name' ? 'active' : ''}`} onClick={() => onChange('name')}>A-Z</div>
    <div className={`sort-tab ${active === 'balance-high' ? 'active' : ''}`} onClick={() => onChange('balance-high')}>High Bal</div>
    <div className={`sort-tab ${active === 'balance-low' ? 'active' : ''}`} onClick={() => onChange('balance-low')}>Low Bal</div>
    <div className={`sort-tab ${active === 'recent' ? 'active' : ''}`} onClick={() => onChange('recent')}>Recent</div>
  </div>
);

const CustomerListItem = ({ customer, onClick }) => {
  const balance = useMemo(() => {
    let bal = 0;
    customer.transactions.forEach(tx => {
      if (tx.type === 'udhar') bal += tx.amount;
      else bal -= tx.amount;
    });
    return bal;
  }, [customer]);

  const initials = customer.name.substring(0, 2).toUpperCase();

  return (
    <div className="glass animate-slide-up" style={{ padding: '16px 20px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', border: '1px solid var(--border)' }} onClick={() => onClick(customer)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="customer-avatar">{initials}</div>
        <div>
          <h4 style={{ fontWeight: '800', fontSize: '1.1rem' }}>{customer.name}</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Phone size={12} /> {customer.phone}
          </p>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div className={`amount-display ${balance >= 0 ? 'text-udhar' : 'text-vasuli'}`} style={{ fontSize: '1.1rem' }}>
          {formatCurrency(Math.abs(balance))}
        </div>
        <div style={{ fontSize: '0.65rem', fontWeight: '800', background: balance >= 0 ? 'var(--udhar)' : 'var(--vasuli)', color: 'white', padding: '2px 8px', borderRadius: '8px', display: 'inline-block', marginTop: '4px' }}>
          {balance >= 0 ? 'GIVE' : 'GET'}
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

function App() {
  const { 
    customers, addCustomer, deleteCustomer, addTransaction, 
    deleteTransaction, editTransaction, totalUdhar, totalVasuli, balance 
  } = useUdharData();

  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [txMode, setTxMode] = useState({ type: 'udhar', mode: 'add', tx: null });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const currentCustomer = useMemo(() => 
    activeCustomer ? customers.find(c => c.id === activeCustomer.id) : null
  , [customers, activeCustomer]);

  const sortedAndFilteredCustomers = useMemo(() => {
    let filtered = customers.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.phone.includes(searchTerm)
    );

    const getBal = (cust) => cust.transactions.reduce((acc, tx) => acc + (tx.type === 'udhar' ? tx.amount : -tx.amount), 0);

    switch(sortBy) {
      case 'balance-high': return filtered.sort((a, b) => Math.abs(getBal(b)) - Math.abs(getBal(a)));
      case 'balance-low': return filtered.sort((a, b) => Math.abs(getBal(a)) - Math.abs(getBal(b)));
      case 'recent': return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      default: return filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [customers, searchTerm, sortBy]);

  const customerBalance = useMemo(() => {
    if (!currentCustomer) return 0;
    return currentCustomer.transactions.reduce((acc, tx) => acc + (tx.type === 'udhar' ? tx.amount : -tx.amount), 0);
  }, [currentCustomer]);

  const handlePrint = () => window.print();

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(customers, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `khata-pro-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          localStorage.setItem('udhar-khata-customers', JSON.stringify(data));
          window.location.reload();
        } catch (err) { alert('Invalid file format'); }
      };
      reader.readAsText(file);
    }
  };

  // --- Render Functions ---

  if (currentCustomer) {
    const initials = currentCustomer.name.substring(0, 2).toUpperCase();
    return (
      <div className="app-container">
        <header className="no-print animate-slide-up" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <button className="btn-icon" onClick={() => setActiveCustomer(null)}><ArrowLeft size={20} /></button>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>{currentCustomer.name}</h2>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600' }}><Phone size={12} /> {currentCustomer.phone}</div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
             <button className="btn-icon" onClick={handlePrint}><Printer size={20} /></button>
             <button className="btn-icon" style={{ color: 'var(--udhar)' }} onClick={() => confirm('Delete Customer?') && deleteCustomer(currentCustomer.id) && setActiveCustomer(null)}><Trash2 size={20} /></button>
          </div>
        </header>

        {/* Print Only Header */}
        <div className="print-only" style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1>Transaction Statement</h1>
          <p>Customer: {currentCustomer.name} | Phone: {currentCustomer.phone}</p>
          <hr style={{ margin: '20px 0' }} />
        </div>

        <div className="glass animate-slide-up" style={{ padding: '28px', marginBottom: '24px', textAlign: 'center', border: 'none', background: 'var(--surface)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Current Outstanding</div>
          <div className={`amount-display ${customerBalance >= 0 ? 'text-udhar' : 'text-vasuli'}`} style={{ fontSize: '2.4rem' }}>
            {formatCurrency(Math.abs(customerBalance))}
          </div>
          <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {customerBalance >= 0 ? 'You will Pay' : 'You will Get'}
          </div>
          <button className="btn-pro no-print" style={{ background: '#25D366', color: 'white', margin: '20px auto 0', width: '200px' }} onClick={() => window.open(generateWhatsAppLink(currentCustomer.phone, currentCustomer.name, customerBalance), '_blank')}>
            <MessageCircle size={20} /> SEND REMINDER
          </button>
        </div>

        <div className="stat-grid no-print" style={{ marginBottom: '32px' }}>
          <button className="btn-pro" style={{ background: 'var(--udhar)', color: 'white' }} onClick={() => { setTxMode({ type: 'udhar', mode: 'add', tx: null }); setIsTxModalOpen(true); }}>
            <TrendingUp size={20} /> GAVE MONEY
          </button>
          <button className="btn-pro" style={{ background: 'var(--vasuli)', color: 'white' }} onClick={() => { setTxMode({ type: 'vasuli', mode: 'add', tx: null }); setIsTxModalOpen(true); }}>
            <Receipt size={20} /> GOT MONEY
          </button>
        </div>

        <h3 className="no-print" style={{ fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px' }}>Transaction History</h3>

        <div className="history-list">
          {currentCustomer.transactions.length === 0 ? (
             <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.5 }}><Wallet size={48} style={{ margin: '0 auto 16px' }} /><p>No history found</p></div>
          ) : (
            [...currentCustomer.transactions].reverse().map(tx => (
              <div key={tx.id} className="glass animate-slide-up" style={{ padding: '16px 20px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '800', color: 'var(--text-main)' }}>{tx.description}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    <Calendar size={12} /> {formatDate(tx.date)}
                  </div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div>
                    <div className={tx.type === 'udhar' ? 'text-udhar' : 'text-vasuli'} style={{ fontWeight: '800' }}>
                      {tx.type === 'udhar' ? '-' : '+'}{formatCurrency(tx.amount)}
                    </div>
                    <span style={{ fontSize: '0.6rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{tx.type}</span>
                  </div>
                  <div className="no-print" style={{ display: 'flex', gap: '4px' }}>
                     <button className="btn-icon" style={{ width: '32px', height: '32px' }} onClick={() => { setTxMode({ type: tx.type, mode: 'edit', tx }); setIsTxModalOpen(true); }}><Edit2 size={14} /></button>
                     <button className="btn-icon" style={{ width: '32px', height: '32px', color: 'var(--udhar)' }} onClick={() => confirm('Delete entry?') && deleteTransaction(currentCustomer.id, tx.id)}><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {isTxModalOpen && (
          <div className="modal-overlay no-print" onClick={(e) => e.target.className === 'modal-overlay' && setIsTxModalOpen(false)}>
            <div className="modal-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontWeight: '800' }}>{txMode.mode === 'add' ? 'New Transaction' : 'Edit Entry'}</h3>
                <button className="btn-icon" style={{ border: 'none' }} onClick={() => setIsTxModalOpen(false)}><X size={20} /></button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const d = new FormData(e.target);
                if (txMode.mode === 'add') addTransaction(currentCustomer.id, txMode.type, d.get('amt'), d.get('note'));
                else editTransaction(currentCustomer.id, txMode.tx.id, { amount: d.get('amt'), description: d.get('note') });
                setIsTxModalOpen(false);
              }}>
                <div style={{ marginBottom: '16px' }}>
                   <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)' }}>Amount (₹)</label>
                   <input className="input-pro" name="amt" type="number" defaultValue={txMode.tx?.amount || ''} required autoFocus />
                </div>
                <div style={{ marginBottom: '24px' }}>
                   <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)' }}>Description</label>
                   <input className="input-pro" name="note" type="text" defaultValue={txMode.tx?.description || ''} placeholder="Dinner, Groceries, etc." />
                </div>
                <button className={`btn-pro ${txMode.type === 'udhar' ? 'btn-udhar' : 'btn-vasuli'}`} style={{ width: '100%', background: txMode.type === 'udhar' ? 'var(--udhar)' : 'var(--vasuli)', color: 'white' }}>
                   {txMode.mode === 'add' ? 'RECORD TRANSACTION' : 'UPDATE ENTRY'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="app-container">
      <DashboardHeader darkMode={darkMode} setDarkMode={setDarkMode} onExport={handleExport} onImport={handleImport} />

      <div className="stat-grid" style={{ marginBottom: '24px' }}>
        <ProStatCard label="Net Summary" value={balance} isFull icon={Wallet} />
        <ProStatCard label="You Will Pay" value={totalUdhar} colorClass="text-udhar" icon={TrendingUp} />
        <ProStatCard label="You Will Get" value={totalVasuli} colorClass="text-vasuli" icon={Receipt} />
      </div>

      <div className="no-print" style={{ position: 'sticky', top: '16px', zIndex: 50, marginBottom: '24px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input-pro" style={{ paddingLeft: '48px', boxShadow: 'var(--shadow-lg)', border: 'none', background: 'var(--surface)' }} placeholder="Search customers..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <SortingTabs active={sortBy} onChange={setSortBy} />

      <div style={{ paddingBottom: '40px' }}>
        {sortedAndFilteredCustomers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--surface)', borderRadius: '24px' }}>
            <Users size={48} style={{ color: 'var(--border)', marginBottom: '16px' }} />
            <h3 style={{ fontWeight: '800' }}>{searchTerm ? 'No matches' : 'Start your Ledger'}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>{searchTerm ? 'Try a different search term' : 'Add your first customer to track debts'}</p>
          </div>
        ) : (
          sortedAndFilteredCustomers.map(c => <CustomerListItem key={c.id} customer={c} onClick={setActiveCustomer} />)
        )}
      </div>

      <div className="fab-container no-print">
        <button className="fab-main" onClick={() => setIsAddCustomerOpen(true)}><Plus size={32} /></button>
      </div>

      {isAddCustomerOpen && (
        <div className="modal-overlay" onClick={e => e.target.className === 'modal-overlay' && setIsAddCustomerOpen(false)}>
          <div className="modal-content animate-slide-up">
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontWeight: '800', fontSize: '1.4rem' }}>Add New Customer</h3>
                <button className="btn-icon" style={{ border: 'none' }} onClick={() => setIsAddCustomerOpen(false)}><X size={20} /></button>
             </div>
             <form onSubmit={e => {
               e.preventDefault();
               const d = new FormData(e.target);
               addCustomer(d.get('name'), d.get('phone'));
               setIsAddCustomerOpen(false);
             }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)' }}>Customer Name</label>
                  <input className="input-pro" name="name" required autoFocus placeholder="e.g. Rajesh Kumar" />
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)' }}>Phone Number</label>
                  <input className="input-pro" name="phone" type="tel" required placeholder="e.g. 9876543210" />
                </div>
                <button className="btn-pro btn-primary" style={{ width: '100%' }}>CREATE CUSTOMER PROFILE</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
