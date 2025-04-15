import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/molecules/ProtectedRoute';
// Import the new pages
import PortfoliosPage from './pages/PortfoliosPage';
import StocksPage from './pages/StocksPage';
import OrdersPage from './pages/OrdersPage';
import WatchlistsPage from './pages/WatchlistsPage';
import SettingsPage from './pages/SettingsPage';
import StockDetailPage from './pages/StockDetailPage';
// Import other pages as they are created

function App() {
  return (
    <Routes>
      {/* Routes within the main layout - PROTECTED */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<MainLayout />}>
          {/* Default route within layout */}
          <Route index element={<DashboardPage />} />
          {/* Add other authenticated routes here inside MainLayout */}
          <Route path="portfolios" element={<PortfoliosPage />} />
          <Route path="stocks" element={<StocksPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="watchlists" element={<WatchlistsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="stocks/:exchange/:symbol" element={<StockDetailPage />} />
          {/* Example: <Route path="profile" element={<ProfilePage />} /> */}
        </Route>
      </Route>

      {/* Standalone routes (no main layout) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Add a 404 Not Found route later */}
      {/* <Route path="*" element={<NotFoundPage />} /> */}
    </Routes>
  );
}

export default App;
