const useToast = () => {
  const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      background: ${type === 'success' ? '#059669' : type === 'error' ? '#dc2626' : '#1b4332'};
      color: white; padding: 12px 24px; border-radius: 8px; font-weight: 600;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-size: 0.9rem;
      animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  return showToast;
};

export default useToast;
