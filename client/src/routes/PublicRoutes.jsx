import { Route, Routes } from 'react-router-dom';
import Login from '../pages/Login';
import LandingPage from '../pages/LandingPage';

const PublicRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<LandingPage />} />
    </Routes>
  );
};

export default PublicRoutes;
