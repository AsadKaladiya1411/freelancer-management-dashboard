import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../features/auth/authSlice';
import { FiHome, FiUsers, FiFolder, FiDollarSign, FiLogOut, FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: FiHome },
  { name: 'Clients', path: '/clients', icon: FiUsers },
  { name: 'Projects', path: '/projects', icon: FiFolder },
  { name: 'Payments', path: '/payments', icon: FiDollarSign },
];

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <aside className="w-[260px] bg-gray-900 dark:bg-black flex flex-col h-screen shrink-0">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <FiZap className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">FreelanceFlow</h1>
            <p className="text-gray-500 text-xs">Management Suite</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-primary-500/20 to-accent-500/10 text-primary-400 shadow-lg shadow-primary-500/5'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`
            }
          >
            <item.icon className="text-lg group-hover:scale-110 transition-transform" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-4 border-t border-gray-800 pt-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all w-full"
        >
          <FiLogOut className="text-lg" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
