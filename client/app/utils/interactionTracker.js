export const trackInteraction = (productId, action) => {
  const interactions =
    JSON.parse(localStorage.getItem('productInteractions')) || [];
  interactions.push({
    productId,
    action,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem('productInteractions', JSON.stringify(interactions));
};

export const sendInteractionsToBackend = async () => {
  const interactions =
    JSON.parse(localStorage.getItem('productInteractions')) || [];
  if (interactions.length > 0) {
    try {
      await fetch('http://localhost:3000/api/admin/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interactions })
      });
      localStorage.setItem('productInteractions', JSON.stringify([])); // Clear sent data
    } catch (error) {
      console.error('Failed to send interactions:', error);
    }
  }
};
