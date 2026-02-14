import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Quiz from './pages/Quiz';
import DailyMCQ from './pages/DailyMCQ';
import BiasOfTheDay from './pages/BiasOfTheDay';
import Story from './pages/Story';
import Profile from './pages/Profile';
import Contact from './pages/Contact';
import About from './pages/About';
import Verified from './pages/Verified';
import PasswordReset from './pages/PasswordReset';

// Static Content Pages
import WhatAreCognitiveBiases from './pages/WhatAreCognitiveBiases';
import WhatArePersonalityTraits from './pages/WhatArePersonalityTraits';
import PersonalityBiasLink from './pages/PersonalityBiasLink';
import HowQuizWorks from './pages/HowQuizWorks';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';

import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-layout">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/bias-of-the-day" element={<BiasOfTheDay />} />
              <Route path="/story" element={<Story />} />
              <Route path="/verified" element={<Verified />} />
              <Route path="/password-reset" element={<PasswordReset />} />
              <Route path="/reset-password/:userId/:resetString" element={<PasswordReset />} />

              {/* Static Content Routes */}
              <Route path="/what-are-cognitive-biases" element={<WhatAreCognitiveBiases />} />
              <Route path="/what-are-personality-traits" element={<WhatArePersonalityTraits />} />
              <Route path="/how-are-personality-and-bias-linked" element={<PersonalityBiasLink />} />
              <Route path="/how-the-unbiasme-quiz-works" element={<HowQuizWorks />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<Terms />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
              <Route path="/daily-mcq" element={<ProtectedRoute><DailyMCQ /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
