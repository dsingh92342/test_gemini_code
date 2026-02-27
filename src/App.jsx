import React, { useState, useMemo } from 'react';
import { Plus, Search, ArrowLeft, Trash2, Phone, Calendar, User, DollarSign, Receipt, TrendingUp, Download, Upload } from 'lucide-react';
import { useUdharData } from './hooks/useUdharData';
import { formatCurrency, formatDate } from './utils/formatters';

// --- Sub-components ---

const Dashboard = ({ totalUdhar, totalVasuli, balance }) => (
  <div className="dashboard">
    <div className="stat-card">
      <span className="stat-label">You Will Give (Udhar)</span>
      <span className="stat-value udhar">{formatCurrency(totalUdhar)}</span>
    </div>
    <div className="stat-card">
      <span className="stat-label">You Will Get (Vasuli)</span>
      <span className="stat-value vasuli">{formatCurrency(totalVasuli)}</span>
    </div>
    <div className="stat-card" style={{ gridColumn: 'span 2' }}>
      <span className="stat-label">Net Balance</span>
      <span className={`stat-value ${balance >= 0 ? 'udhar' : 'vasuli'}`}>
        {formatCurrency(Math.abs(balance))} {balance >= 0 ? 'to pay' : 'to receive'}
      </span>
    </div>
  </div>
);

const CustomerCard = ({ customer, onClick }) => {
  const customerBalance = useMemo(() => {
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
        <strong style={{ fontSize: '1.1rem' }}>{customer.name}</strong>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{customer.phone}</span>
      </div>
      <div className="customer-balance">
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Balance</div>
        <div className={customerBalance >= 0 ? 'udhar' : 'vasuli'}>
          {formatCurrency(Math.abs(customerBalance))}
          <span style={{ fontSize: '0.7rem', marginLeft: '4px' }}>{customerBalance >= 0 ? 'Pay' : 'Get'}</span>
        </div>
      </div>
    </div>
  );
};

const Modal = ({ title, onClose, children }) => (
  <div className="modal-overlay">
    <div className="modal-content">
      <div className="modal-header">
        <h3>{title}</h3>
        <button onClick={onClose} className="danger">✕</button>
      </div>
      {children}
    </div>
  </div>
);

// --- Main App Component ---

function App() {
  const { customers, addCustomer, deleteCustomer, addTransaction, totalUdhar, totalVasuli, balance } = useUdharData();
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [txType, setTxType] = useState('udhar');

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.phone.includes(searchTerm)
    );
  }, [customers, searchTerm]);

  const handleAddCustomer = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    addCustomer(formData.get('name'), formData.get('phone'));
    setIsAddCustomerOpen(false);
  };

  const handleAddTransaction = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    addTransaction(
      activeCustomer.id,
      txType,
      formData.get('amount'),
      formData.get('description') || (txType === 'udhar' ? 'Money Given' : 'Money Received')
    );
    setIsAddTransactionOpen(false);
    // Update the active customer to show new transaction
    const updated = customers.find(c => c.id === activeCustomer.id);
    setActiveCustomer(updated);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(customers, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `udhar-khata-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
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
        } catch (err) {
          alert('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    }
  };

  if (activeCustomer) {
    const currentCustomer = customers.find(c => c.id === activeCustomer.id);
    if (!currentCustomer) {
      setActiveCustomer(null);
      return null;
    }

    return (
      <div className="container">
        <header style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="outline" onClick={() => setActiveCustomer(null)} style={{ padding: '0.5rem' }}>
            <ArrowLeft size={20} />
          </button>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1.25rem' }}>{currentCustomer.name}</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{currentCustomer.phone}</p>
          </div>
          <button className="danger" onClick={() => {
            if (confirm('Delete this customer and all transactions?')) {
              deleteCustomer(currentCustomer.id);
              setActiveCustomer(null);
            }
          }}>
            <Trash2 size={20} />
          </button>
        </header>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <button className="primary" style={{ flex: 1, backgroundColor: 'var(--udhar-color)' }} 
                  onClick={() => { setTxType('udhar'); setIsAddTransactionOpen(true); }}>
            <TrendingUp size={18} /> GAVE MONEY
          </button>
          <button className="primary" style={{ flex: 1, backgroundColor: 'var(--vasuli-color)' }}
                  onClick={() => { setTxType('vasuli'); setIsAddTransactionOpen(true); }}>
            <Receipt size={18} /> GOT MONEY
          </button>
        </div>

        <h3>Transaction History</h3>
        <div style={{ marginTop: '1rem' }}>
          {currentCustomer.transactions.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>No transactions yet.</p>
          ) : (
            [...currentCustomer.transactions].reverse().map(tx => (
              <div key={tx.id} className="transaction-item">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <strong>{tx.description}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(tx.date)}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className={tx.type === 'udhar' ? 'udhar' : 'vasuli'} style={{ fontWeight: '700' }}>
                    {tx.type === 'udhar' ? '-' : '+'}{formatCurrency(tx.amount)}
                  </div>
                  <span className={`badge ${tx.type}`}>{tx.type}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {isAddTransactionOpen && (
          <Modal title={txType === 'udhar' ? 'Record Udhar' : 'Record Vasuli'} onClose={() => setIsAddTransactionOpen(false)}>
            <form onSubmit={handleAddTransaction}>
              <div className="input-group">
                <label>Amount (₹)</label>
                <input type="number" name="amount" required autoFocus placeholder="Enter amount" />
              </div>
              <div className="input-group">
                <label>Description</label>
                <textarea name="description" rows="2" placeholder="e.g. For Groceries"></textarea>
              </div>
              <button type="submit" className="primary" style={{ width: '100%', backgroundColor: txType === 'udhar' ? 'var(--udhar-color)' : 'var(--vasuli-color)' }}>
                SAVE TRANSACTION
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
          <h1 style={{ fontSize: '1.5rem' }}>Udhar Khata</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Digital Credit Management</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
           <button className="outline" onClick={exportData} title="Export Data"><Download size={20} /></button>
           <label className="outline" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
             <Upload size={20} />
             <input type="file" hidden onChange={importData} accept=".json" />
           </label>
        </div>
      </header>

      <Dashboard totalUdhar={totalUdhar} totalVasuli={totalVasuli} balance={balance} />

      <div style={{ position: 'sticky', top: '0', background: 'var(--bg-color)', padding: '0.5rem 0', zIndex: 10 }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by name or phone..." 
            style={{ width: '100%', paddingLeft: '40px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1.5rem 0 1rem' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>{filteredCustomers.length} CUSTOMERS</h3>
        <button className="primary" onClick={() => setIsAddCustomerOpen(true)}>
          <Plus size={20} /> ADD CUSTOMER
        </button>
      </div>

      <div className="customer-list">
        {filteredCustomers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'white', borderRadius: 'var(--radius)' }}>
            <p style={{ color: 'var(--text-muted)' }}>No customers found.</p>
          </div>
        ) : (
          filteredCustomers.map(customer => (
            <CustomerCard key={customer.id} customer={customer} onClick={setActiveCustomer} />
          ))
        )}
      </div>

      {isAddCustomerOpen && (
        <Modal title="Add New Customer" onClose={() => setIsAddCustomerOpen(false)}>
          <form onSubmit={handleAddCustomer}>
            <div className="input-group">
              <label>Name</label>
              <input type="text" name="name" required autoFocus placeholder="e.g. Rajesh Kumar" />
            </div>
            <div className="input-group">
              <label>Phone Number</label>
              <input type="tel" name="phone" required placeholder="e.g. 9876543210" />
            </div>
            <button type="submit" className="primary" style={{ width: '100%' }}>
              ADD CUSTOMER
            </button>
          </form>
        </Modal>
      )}

      <footer style={{ marginTop: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        <p>Your data is stored locally in your browser.</p>
      </footer>
    </div>
  );
}

export default App;
