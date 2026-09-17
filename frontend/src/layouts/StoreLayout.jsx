import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const StoreLayout = ({ 
  children, 
  view, 
  setView, 
  mobileSidebarOpen, 
  setMobileSidebarOpen, 
  user
}) => {
  return (
    <div className="app-container">
      <Navbar 
        view={view} 
        setView={setView} 
        mobileSidebarOpen={mobileSidebarOpen}
        setMobileSidebarOpen={setMobileSidebarOpen}
      />
      <main className="app-main">
        {children}
      </main>
    </div>
  );
};

export default StoreLayout;
