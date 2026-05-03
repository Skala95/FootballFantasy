import RegisterUser from './pages/registerPage';
import LoginUser from './pages/loginPage';
import DashboardPage from './pages/dashboardPage'; 
import HomePage from './pages/homePage';
import LeaderboardPage from './pages/leaderboardPage';
import StatisticsPage from './pages/statisticsPage';
import FantasyTeamPage from './pages/fantasyTeamPage';
import ResultPage from './pages/resultPage';
import AdminPage from './pages/adminPage';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <div className="bg-green-600 min-h-screen w-full flex flex-col items-center justify-center">
            <h1 className="text-white text-4xl font-bold mb-8">Dobrodošli u Football Fantasy!</h1>
            <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col">
              <h2 className="text-2xl font-bold mb-4 text-center">Prijava</h2>
              <LoginUser />
              <p className="text-sm text-gray-600 mt-4 text-center">
                Nemate nalog? 
                <Link to="/register" className="text-blue-600 hover:underline ml-1">
                  Registrujte se ovde
                </Link>
              </p>
            </div>
          </div>
        } />

        <Route path="/register" element={
          <div className="bg-green-600 min-h-screen w-full flex flex-col items-center justify-center">
            <h1 className="text-white text-4xl font-bold mb-8">Dobrodošli u Football Fantasy!</h1>
            <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col">
              <h2 className="text-2xl font-bold mb-4 text-center">Registracija</h2>
              <RegisterUser />
              <p className="text-sm text-gray-600 mt-4 text-center">
                Već imate nalog? 
                <Link to="/" className="text-blue-600 hover:underline ml-1">
                  Prijavite se
                </Link>
              </p>
            </div>
          </div>
        } />

        <Route path="/dashboard" element={<DashboardPage />}>
          <Route index element={<HomePage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="statistics" element={<StatisticsPage />} />
          <Route path="fantasy-team" element={<FantasyTeamPage />} />
          <Route path="results" element={<ResultPage />} />
          <Route path="admin" element={<AdminPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App
