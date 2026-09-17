import React, { useState, useRef, useCallback, useEffect } from 'react';

const DashboardLayout = ({ 
  sidebarTitle, 
  sidebarIcon, 
  sidebarSubtitle, 
  mobileSidebarOpen, 
  setMobileSidebarOpen, 
  sidebarMenu, 
  children 
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const isResizing = useRef(false);

  const handleResizeStart = useCallback((e) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const handleResizeMove = useCallback((e) => {
    if (!isResizing.current) return;
    const newWidth = Math.max(180, Math.min(400, e.clientX));
    setSidebarWidth(newWidth);
  }, []);

  const handleResizeEnd = useCallback(() => {
    isResizing.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => handleResizeMove(e);
    const handleMouseUp = () => handleResizeEnd();
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleResizeMove]);

  return (
    <div 
      className={`admin-layout ${isSidebarCollapsed ? 'collapsed' : ''} animated-view`}
      style={isSidebarCollapsed ? {} : { gridTemplateColumns: `${sidebarWidth}px 1fr` }}
    >
      <aside 
        className={`admin-sidebar ${isSidebarCollapsed ? 'collapsed' : ''} ${mobileSidebarOpen ? 'mobile-open' : ''}`}
        style={{ width: isSidebarCollapsed ? undefined : `${sidebarWidth}px` }}
      >
        <button 
          className="sidebar-toggle-btn" 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? '▶' : '◀'}
        </button>

        <div className="admin-sidebar-header">
          <h3 className="admin-sidebar-title">
            <span className="sidebar-icon">{sidebarIcon}</span>
            <span>{sidebarTitle}</span>
          </h3>
          {sidebarSubtitle && (
            <p className="admin-sidebar-subtitle">{sidebarSubtitle}</p>
          )}
        </div>

        <div className="admin-tab-list">
          {sidebarMenu}
        </div>

        {!isSidebarCollapsed && (
          <div 
            className="sidebar-resizer"
            onMouseDown={handleResizeStart}
          />
        )}
      </aside>

      <main className="admin-content">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
