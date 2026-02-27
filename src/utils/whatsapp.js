export const generateWhatsAppLink = (phone, name, balance) => {
  const formattedPhone = phone.replace(/\D/g, '');
  const message = balance > 0 
    ? `Hello ${name}, this is a reminder regarding your outstanding balance of ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(balance)}. Please settle it at your earliest convenience. Thank you!`
    : `Hello ${name}, thank you for your recent payment. Your current balance is ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Math.abs(balance))}. Have a great day!`;
  
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
};
