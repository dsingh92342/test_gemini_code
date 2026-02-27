import { useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';

export function useUdharData() {
  const [customers, setCustomers] = useLocalStorage('udhar-khata-customers', []);

  const addCustomer = (name, phone) => {
    const newCustomer = {
      id: crypto.randomUUID(),
      name,
      phone,
      transactions: [],
      createdAt: new Date().toISOString(),
    };
    setCustomers((prev) => [...prev, newCustomer]);
    return newCustomer;
  };

  const deleteCustomer = (id) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  const addTransaction = (customerId, type, amount, description) => {
    setCustomers((prev) =>
      prev.map((customer) => {
        if (customer.id === customerId) {
          const newTransaction = {
            id: crypto.randomUUID(),
            type, // 'udhar' or 'vasuli'
            amount: parseFloat(amount),
            description,
            date: new Date().toISOString(),
          };
          return {
            ...customer,
            transactions: [...customer.transactions, newTransaction],
          };
        }
        return customer;
      })
    );
  };

  const totals = useMemo(() => {
    let totalUdhar = 0;
    let totalVasuli = 0;

    customers.forEach((customer) => {
      customer.transactions.forEach((tx) => {
        if (tx.type === 'udhar') {
          totalUdhar += tx.amount;
        } else {
          totalVasuli += tx.amount;
        }
      });
    });

    return { totalUdhar, totalVasuli, balance: totalUdhar - totalVasuli };
  }, [customers]);

  return {
    customers,
    addCustomer,
    deleteCustomer,
    addTransaction,
    ...totals,
  };
}
