import { Suspense, lazy } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import './App.css';

const Home = lazy(() => import('./pages/Home/Home'));

const App = () => {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route exact path="/" element={ <Home /> } />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;