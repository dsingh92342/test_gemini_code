import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, Search, ArrowLeft, Trash2, Phone, Calendar, User, 
  DollarSign, Receipt, TrendingUp, Download, Upload, 
  MessageCircle, MoreVertical, Edit2, ChevronRight, X, UserPlus, Info
} from 'lucide-react';
import { useUdharData } from './hooks/useUdharData';
import { formatCurrency, formatDate } from './utils/formatters';
import { generateWhatsAppLink } from './utils/whatsapp';

// --- Sub-components ---

const Dashboard = ({ totalUdhar, totalVasuli, balance }) => (
  <div className="dashboard">
    <div className="card balance-card">
      <div className="stat-label">Total Outstanding</div>
      <div className="stat-value">{formatCurrency(Math.abs(balance))}</div>
      <div style={{ fontSize: '0.8rem', marginTop: '8px', opacity: 0.9 }}>
        {balance >= 0 ? 'You are in Net Debt' : 'You are in Net Credit'}
      </div>
    </div>
    <div className="stat-card">
      <div className="stat-label">To Pay (Udhar)</div>
      <div className="stat-value udhar">{formatCurrency(totalUdhar)}</div>
    </div>
    <div className="stat-card">
      <div className="stat-label">To Get (Vasuli)</div>
      <div className="stat-value vasuli">{formatCurrency(totalVasuli)}</div>
    </div>
  </div>
);

const CustomerCard = ({ customer, onClick }) => {
  const balance = useMemo(() => {
    let bal = 0;
    customer.transactions.forEach(tx => {
      if (tx.type === 'udhar') bal += tx.amount;
      else bal -= tx.amount;
    });
    return bal;
  }, [customer]);

  return (
    <div className="card customer-card" onClick={() => onClick(customer)}>
      <div className="customer-info">
        <h4>{customer.name}</h4>
        <p><Phone size={12} style={{ marginRight: '4px' }} /> {customer.phone}</p>
      </div>
      <div className="customer-balance">
        <div className={`amount ${balance >= 0 ? 'udhar' : 'vasuli'}`}>
          {formatCurrency(Math.abs(balance))}
        </div>
        <div className={`badge ${balance >= 0 ? 'udhar' : 'vasuli'}`}>
          {balance >= 0 ? 'GIVE' : 'GET'}
        </div>
      </div>
    </div>
  );
};

const Modal = ({ title, onClose, children }) => (
  <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && onClose()}>
    <div className="modal-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.25rem' }}>{title}</h3>
        <button onClick={onClose} style={{ padding: '4px', background: 'transparent' }}><X size={24} /></button>
      </div>
      {children}
    </div>
  </div>
);

// --- Main App Component ---

function App() {
  const { 
    customers, addCustomer, deleteCustomer, addTransaction, 
    deleteTransaction, editTransaction, totalUdhar, totalVasuli, balance 
  } = useUdharData();

  const [activeCustomer, setActiveCustomer] = useState(null);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [txMode, setTxMode] = useState({ type: 'udhar', mode: 'add', tx: null });

  // Sync active customer if it's open and data changes
  const currentCustomer = useMemo(() => 
    activeCustomer ? customers.find(c => c.id === activeCustomer.id) : null
  , [customers, activeCustomer]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.phone.includes(searchTerm)
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [customers, searchTerm]);

  const customerBalance = useMemo(() => {
    if (!currentCustomer) return 0;
    let bal = 0;
    currentCustomer.transactions.forEach(tx => {
      if (tx.type === 'udhar') bal += tx.amount;
      else bal -= tx.amount;
    });
    return bal;
  }, [currentCustomer]);

  const handleAddCustomer = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    addCustomer(formData.get('name'), formData.get('phone'));
    setIsAddCustomerOpen(false);
  };

  const handleTransactionSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const amount = formData.get('amount');
    const description = formData.get('description');

    if (txMode.mode === 'add') {
      addTransaction(currentCustomer.id, txMode.type, amount, description);
    } else {
      editTransaction(currentCustomer.id, txMode.tx.id, { amount, description });
    }
    setIsTxModalOpen(false);
  };

  const handleWhatsApp = () => {
    const link = generateWhatsAppLink(currentCustomer.phone, currentCustomer.name, customerBalance);
    window.open(link, '_blank');
  };

  const exportData = () => {
    const dataStr = JSON.stringify(customers, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `khata-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          localStorage.setItem('udhar-khata-customers', JSON.stringify(data));
          window.location.reload();
        } catch (err) { alert('Invalid backup file'); }
      };
      reader.readAsText(file);
    }
  };

  // --- Views ---

  if (currentCustomer) {
    return (
      <div className="container">
        <header style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="outline" onClick={() => setActiveCustomer(null)} style={{ padding: '8px', borderRadius: '50%' }}>
            <ArrowLeft size={20} />
          </button>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1.2rem' }}>{currentCustomer.name}</h2>
            <div style={{ display: 'flex', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <span><Phone size={12} /> {currentCustomer.phone}</span>
            </div>
          </div>
          <button className="danger" onClick={() => {
            if (confirm('Delete this customer and all history?')) {
              deleteCustomer(currentCustomer.id);
              setActiveCustomer(null);
            }
          }}><Trash2 size={20} /></button>
        </header>

        <div className="card" style={{ background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <div className="stat-label">Net Balance</div>
            <div className={`amount ${customerBalance >= 0 ? 'udhar' : 'vasuli'}`} style={{ fontSize: '1.5rem', fontWeight: '800' }}>
              {formatCurrency(Math.abs(customerBalance))}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {customerBalance >= 0 ? 'You will Pay' : 'You will Get'}
            </div>
          </div>
          <button className="whatsapp-btn" onClick={handleWhatsApp}>
            <MessageCircle size={18} /> Remind
          </button>
        </div>

        <div className="action-bar">
          <button className="primary" style={{ background: 'var(--udhar-color)' }} 
                  onClick={() => { setTxMode({ type: 'udhar', mode: 'add', tx: null }); setIsTxModalOpen(true); }}>
            <TrendingUp size={18} /> GAVE MONEY
          </button>
          <button className="primary" style={{ background: 'var(--vasuli-color)' }}
                  onClick={() => { setTxMode({ type: 'vasuli', mode: 'add', tx: null }); setIsTxModalOpen(true); }}>
            <Receipt size={18} /> GOT MONEY
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>History</h3>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{currentCustomer.transactions.length} entries</div>
        </div>

        <div className="transaction-list">
          {currentCustomer.transactions.length === 0 ? (
            <div className="empty-state">
              <Info size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <p>No transactions recorded yet.</p>
            </div>
          ) : (
            [...currentCustomer.transactions].reverse().map(tx => (
              <div key={tx.id} className="transaction-item">
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600' }}>{tx.description}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={10} /> {formatDate(tx.date)}
                  </div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div>
                    <div className={tx.type === 'udhar' ? 'udhar' : 'vasuli'} style={{ fontWeight: '800' }}>
                      {tx.type === 'udhar' ? '-' : '+'}{formatCurrency(tx.amount)}
                    </div>
                    <span className={`badge ${tx.type}`}>{tx.type}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="outline" style={{ padding: '6px' }} onClick={() => {
                      setTxMode({ type: tx.type, mode: 'edit', tx });
                      setIsTxModalOpen(true);
                    }}>
                      <Edit2 size={14} />
                    </button>
                    <button className="danger" style={{ padding: '6px' }} onClick={() => {
                      if (confirm('Delete this entry?')) deleteTransaction(currentCustomer.id, tx.id);
                    }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {isTxModalOpen && (
          <Modal title={txMode.mode === 'add' ? (txMode.type === 'udhar' ? 'Money Given' : 'Money Received') : 'Edit Transaction'} 
                 onClose={() => setIsTxModalOpen(false)}>
            <form onSubmit={handleTransactionSubmit}>
              <div className="input-group">
                <label>Amount (₹)</label>
                <input type="number" name="amount" defaultValue={txMode.tx?.amount || ''} required autoFocus />
              </div>
              <div className="input-group">
                <label>Description (Note)</label>
                <input type="text" name="description" defaultValue={txMode.tx?.description || ''} placeholder="e.g. For dinner" />
              </div>
              <button type="submit" className="primary" style={{ width: '100%', background: txMode.type === 'udhar' ? 'var(--udhar-color)' : 'var(--vasuli-color)' }}>
                {txMode.mode === 'add' ? 'SAVE TRANSACTION' : 'UPDATE TRANSACTION'}
              </button>
            </form>
          </Modal>
        )}
      </div>
    );
  }

  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em' }}>Udhar Khata</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Smart Credit Management</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
           <button className="outline" style={{ padding: '10px' }} onClick={exportData} title="Export Data"><Download size={18} /></button>
           <label className="outline" style={{ display: 'flex', cursor: 'pointer', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
             <Upload size={18} />
             <input type="file" hidden onChange={importData} accept=".json" />
           </label>
        </div>
      </header>

      <Dashboard totalUdhar={totalUdhar} totalVasuli={totalVasuli} balance={balance} />

      <div className="search-container">
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="search-input"
            placeholder="Search name or phone..." 
            style={{ paddingLeft: '48px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {filteredCustomers.length} Customers
        </h3>
      </div>

      <div className="customer-list">
        {filteredCustomers.length === 0 ? (
          <div className="empty-state card">
            <UserPlus size={40} style={{ marginBottom: '12px', opacity: 0.2 }} />
            <p>No customers found.</p>
            <button className="primary" onClick={() => setIsAddCustomerOpen(true)} style={{ marginTop: '16px', marginInline: 'auto' }}>
              Add Your First Customer
            </button>
          </div>
        ) : (
          filteredCustomers.map(customer => (
            <CustomerCard key={customer.id} customer={customer} onClick={setActiveCustomer} />
          ))
        )}
      </div>

      <button className="fab" onClick={() => setIsAddCustomerOpen(true)}>
        <Plus size={32} />
      </button>

      {isAddCustomerOpen && (
        <Modal title="New Customer" onClose={() => setIsAddCustomerOpen(false)}>
          <form onSubmit={handleAddCustomer}>
            <div className="input-group">
              <label>Name</label>
              <input type="text" name="name" required autoFocus placeholder="Rajesh Kumar" />
            </div>
            <div className="input-group">
              <label>Phone Number</label>
              <input type="tel" name="phone" required placeholder="9876543210" />
            </div>
            <button type="submit" className="primary" style={{ width: '100%' }}>
              ADD CUSTOMER
            </button>
          </form>
        </Modal>
      )}

      <footer style={{ marginTop: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '4px' }}>
          <Info size={12} /> Local storage used for data privacy
        </div>
        <p>© {new Date().getFullYear()} Udhar Khata Pro</p>
      </footer>
    </div>
  );
}

export default App;
