import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import MobileNav from './MobileNav.jsx';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import ToastHost from '../common/Toast.jsx';

export default function Layout() {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 md:ml-[260px]">
        <Navbar />
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
          <Outlet />
        </main>
        <Footer />
      </div>
      <MobileNav />
      <ToastHost />
    </div>
  );
}
