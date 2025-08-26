import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SubscriptionCard from "./components/SubscriptionCard";
import PaymentSuccess from "./components/PaymentSuccess";
import PaymentFailure from "./components/PaymentFailure";

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
        <Routes>
          <Route path="/" element={<SubscriptionCard />} />
          <Route path="/success" element={<PaymentSuccess />} />
          <Route path="/fail" element={<PaymentFailure />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
