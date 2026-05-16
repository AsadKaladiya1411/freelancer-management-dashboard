import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import Clients from "./Clients";
import Projects from "./Projects";
import Payments from "./Payments";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login Page */}
        <Route path="/" element={<Login />} />

        {/* Register Page */}
        <Route path="/register" element={<Register />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Clients Management */}
        <Route path="/clients" element={<Clients />} />

        {/* Projects Management */}
        <Route path="/projects" element={<Projects />} />

        {/* Payments Management */}
        <Route path="/payments" element={<Payments />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
