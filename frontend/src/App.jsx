import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Home from './pages/Home';
import Campaigns from './pages/Campaigns';
import CampaignDetail from './pages/CampaignDetail';
import FundraiserRequest from './pages/FundraiserRequest';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="donate" element={<Campaigns />} />
          <Route path="campaign/:id" element={<CampaignDetail />} />
          <Route path="start-fundraiser" element={<FundraiserRequest />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin-access-portal" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
