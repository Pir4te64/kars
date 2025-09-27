import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import CarQuote from './components/CarQuote'
import Benefits from './components/Benefits'
import StockSection from './components/StockSection'
import WhyChooseUs from './components/WhyChooseUs'
import Testimonials from './components/Testimonials'
import CallToAction from './components/CallToAction'
import Footer from './components/Footer'
import CarDetail from './components/CarDetail'
import VendeTuAuto from './components/VendeTuAuto'
import QuoteResult from './components/QuoteResult'
import { useAuth } from './hooks/useAuth'

function App() {
  const {login} = useAuth()
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={
            <main>
              <Hero />
              <CarQuote />
              <Benefits />
              <StockSection />
              <WhyChooseUs />
              <Testimonials />
              <CallToAction />
            </main>
          } />
          <Route path="/auto/:id" element={<CarDetail />} />
          <Route path="/vende-tu-auto" element={<VendeTuAuto />} />
          <Route path="/quote-result" element={<QuoteResult />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  )
}

export default App
