import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, ArrowLeft, Trash2, Phone, Calendar, 
  Receipt, TrendingUp, Download, Upload, 
  MessageCircle, Edit2, X, Users, Wallet
} from 'lucide-react';
import { useUdharData } from './hooks/useUdharData';
import { formatCurrency, formatDate } from './utils/formatters';
import { generateWhatsAppLink } from './utils/whatsapp';

// --- Sub-components ---

const Dashboard = ({ totalUdhar, totalVasuli, balance }) => (
  <div className="dashboard-grid animate-fade-in">
    <div className="card balance-card">
      <div className="label-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>Net Balance</div>
      <div className="value-lg">{formatCurrency(Math.abs(balance))}</div>
      <div style={{ fontSize: '0.85rem', marginTop: '8px', fontWeight: '500', background: 'rgba(0,0,0,0.2)', padding: '4px 12px', borderRadius: '20px' }}>
        {balance >= 0 ? 'Overall Debt' : 'Overall Credit'}
      </div>
    </div>
    <div className="stat-box">
      <div className="label-sm">To Pay</div>
      <div className="value-md text-udhar">{formatCurrency(totalUdhar)}</div>
    </div>
    <div className="stat-box">
      <div className="label-sm">To Get</div>
      <div className="value-md text-vasuli">{formatCurrency(totalVasuli)}</div>
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

  const initials = customer.name.substring(0, 2).toUpperCase();

  return (
    <div className="customer-card" onClick={() => onClick(customer)}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div className="avatar">{initials}</div>
        <div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '2px' }}>{customer.name}</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Phone size={12} /> {customer.phone}
          </p>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div className={`value-md ${balance >= 0 ? 'text-udhar' : 'text-vasuli'}`} style={{ fontSize: '1.1rem' }}>
          {formatCurrency(Math.abs(balance))}
        </div>
        <div className={`badge ${balance >= 0 ? 'badge-udhar' : 'badge-vasuli'}`} style={{ marginTop: '4px', display: 'inline-block' }}>
          {balance >= 0 ? 'PAY' : 'GET'}
        </div>
      </div>
    </div>
  );
};

const Modal = ({ title, onClose, children }) => (
  <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && onClose()}>
    <div className="modal-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: '800' }}>{title}</h3>
        <button onClick={onClose} className="icon-btn" style={{ width: '36px', height: '36px', border: 'none', background: 'var(--bg-main)' }}><X size={20} /></button>
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

  // --- Views ---

  if (currentCustomer) {
    const initials = currentCustomer.name.substring(0, 2).toUpperCase();
    
    return (
      <div className="app-container animate-fade-in">
        <header className="app-header">
          <button className="icon-btn" onClick={() => setActiveCustomer(null)}>
            <ArrowLeft size={20} />
          </button>
          <div style={{ flex: 1, marginLeft: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
             <div className="avatar" style={{ width: '40px', height: '40px', fontSize: '1rem', margin: 0 }}>{initials}</div>
             <div>
               <h2 style={{ fontSize: '1.2rem', fontWeight: '800' }}>{currentCustomer.name}</h2>
               <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                 <Phone size={12} /> {currentCustomer.phone}
               </div>
             </div>
          </div>
          <button className="icon-btn" style={{ color: 'var(--udhar)' }} onClick={() => {
            if (confirm('Delete this customer and all history?')) {
              deleteCustomer(currentCustomer.id);
              setActiveCustomer(null);
            }
          }}><Trash2 size={20} /></button>
        </header>

        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="label-sm">Net Balance</div>
            <div className={`value-lg ${customerBalance >= 0 ? 'text-udhar' : 'text-vasuli'}`}>
              {formatCurrency(Math.abs(customerBalance))}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>
              {customerBalance >= 0 ? 'You will Pay' : 'You will Get'}
            </div>
          </div>
          <button className="btn btn-whatsapp" style={{ padding: '10px 16px', borderRadius: '16px' }} onClick={handleWhatsApp}>
            <MessageCircle size={18} /> Remind
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <button className="btn btn-udhar" onClick={() => { setTxMode({ type: 'udhar', mode: 'add', tx: null }); setIsTxModalOpen(true); }}>
            <TrendingUp size={18} /> GAVE
          </button>
          <button className="btn btn-vasuli" onClick={() => { setTxMode({ type: 'vasuli', mode: 'add', tx: null }); setIsTxModalOpen(true); }}>
            <Receipt size={18} /> GOT
          </button>
        </div>

        <div>
          <div className="list-header" style={{ marginTop: '12px' }}>
            <h3 className="label-sm" style={{ margin: 0 }}>History</h3>
            <span className="badge" style={{ background: 'var(--border)', color: 'var(--text-muted)' }}>{currentCustomer.transactions.length} entries</span>
          </div>

          {currentCustomer.transactions.length === 0 ? (
            <div className="empty-state">
              <Wallet size={48} style={{ color: 'var(--border)', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px' }}>No Transactions</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Record a payment to get started.</p>
            </div>
          ) : (
            <div className="tx-list">
              {[...currentCustomer.transactions].reverse().map(tx => (
                <div key={tx.id} className="tx-item">
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--text-main)' }}>{tx.description}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <Calendar size={12} /> {formatDate(tx.date)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div>
                      <div className={tx.type === 'udhar' ? 'text-udhar' : 'text-vasuli'} style={{ fontWeight: '800', fontSize: '1.1rem' }}>
                        {tx.type === 'udhar' ? '-' : '+'}{formatCurrency(tx.amount)}
                      </div>
                      <span className={`badge ${tx.type === 'udhar' ? 'badge-udhar' : 'badge-vasuli'}`}>{tx.type}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <button style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => {
                        setTxMode({ type: tx.type, mode: 'edit', tx });
                        setIsTxModalOpen(true);
                      }}><Edit2 size={16} /></button>
                      <button style={{ border: 'none', background: 'transparent', color: 'var(--udhar)', cursor: 'pointer' }} onClick={() => {
                        if (confirm('Delete this entry?')) deleteTransaction(currentCustomer.id, tx.id);
                      }}><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isTxModalOpen && (
          <Modal title={txMode.mode === 'add' ? (txMode.type === 'udhar' ? 'Money Given' : 'Money Received') : 'Edit Entry'} 
                 onClose={() => setIsTxModalOpen(false)}>
            <form onSubmit={handleTransactionSubmit}>
              <div className="form-group">
                <label className="form-label">Amount (₹)</label>
                <input type="number" className="form-input" name="amount" defaultValue={txMode.tx?.amount || ''} required autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Note</label>
                <input type="text" className="form-input" name="description" defaultValue={txMode.tx?.description || ''} placeholder="e.g. Groceries" />
              </div>
              <button type="submit" className={`btn ${txMode.type === 'udhar' ? 'btn-udhar' : 'btn-vasuli'}`} style={{ width: '100%', marginTop: '8px' }}>
                {txMode.mode === 'add' ? 'SAVE' : 'UPDATE'}
              </button>
            </form>
          </Modal>
        )}
      </div>
    );
  }

  // --- Main View ---

  return (
    <div className="app-container">
      <header className="app-header animate-fade-in">
        <div>
          <h1 className="app-title">Udhar Khata</h1>
          <p className="app-subtitle">Smart Credit Management</p>
        </div>
      </header>

      <Dashboard totalUdhar={totalUdhar} totalVasuli={totalVasuli} balance={balance} />

      <div className="search-wrapper animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <Search size={20} className="search-icon" />
        <input 
          type="text" 
          className="search-input"
          placeholder="Search by name or phone..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="list-header">
          <h3 className="label-sm" style={{ margin: 0 }}>{filteredCustomers.length} Customers</h3>
        </div>

        <div style={{ marginTop: '8px' }}>
          {filteredCustomers.length === 0 ? (
            <div className="empty-state">
              <Users size={48} style={{ color: 'var(--border)', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px' }}>No Customers Yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>Add a customer to start tracking your khata.</p>
              <button className="btn btn-primary" onClick={() => setIsAddCustomerOpen(true)}>
                <Plus size={18} /> Add Customer
              </button>
            </div>
          ) : (
            filteredCustomers.map((customer, index) => (
              <div key={customer.id} style={{ animationDelay: `${0.05 * index}s` }}>
                <CustomerCard customer={customer} onClick={setActiveCustomer} />
              </div>
            ))
          )}
        </div>
      </div>

      <button className="fab animate-fade-in" style={{ animationDelay: '0.4s' }} onClick={() => setIsAddCustomerOpen(true)}>
        <Plus size={28} />
      </button>

      {isAddCustomerOpen && (
        <Modal title="New Customer" onClose={() => setIsAddCustomerOpen(false)}>
          <form onSubmit={handleAddCustomer}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" name="name" required autoFocus placeholder="Rajesh Kumar" />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input type="tel" className="form-input" name="phone" required placeholder="9876543210" />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
              Create Customer
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default App;
