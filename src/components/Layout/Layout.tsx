import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import ToastContainer from '@/components/common/ToastContainer';
import Modal from '@/components/common/Modal';
import { useUIStore } from '@/stores/uiStore';

export default function Layout() {
  const { isSidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main
          className="flex-1 overflow-auto"
          role="main"
          aria-label="Main content"
        >
          <Outlet />
        </main>
      </div>
      <ToastContainer />
      <Modal />
    </div>
  );
}
