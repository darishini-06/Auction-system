import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Layout Components
import Navbar from './components/Navbar';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import AuctionListPage from './features/auctions/AuctionListPage';
import AuctionDetailPage from './features/auctions/AuctionDetailPage';
import CreateAuctionPage from './features/auctions/CreateAuctionPage';
import useNotifications from './hooks/useNotifications';
// Placeholder component for the profile page
const ProfilePage = () => <h2 style={{ textAlign: 'center', padding: '2rem' }}>Your Profile Page</h2>;

function App() {
  useNotifications(); // Custom hook to manage WebSocket notifications
  return (
    <Router>
      {/* The Navbar is placed outside the Routes to be visible on every page */}
      <Navbar />
      
      {/* The 'main' tag can be used for semantic HTML and styling */}
      <main>
        <Routes>
          {/* --- Auction Routes --- */}
          <Route path="/" element={<AuctionListPage />} />
          <Route path="/auctions/:id" element={<AuctionDetailPage />} />
          <Route path="/create-auction" element={<CreateAuctionPage />} />

          {/* --- Authentication Routes --- */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* --- User Profile Route --- */}
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;