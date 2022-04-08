import { LoadingOverlay } from '@mantine/core';
import { Suspense, lazy } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import './App.css';

import ApplicationContainer from './components/ApplicationContainer/ApplicationContainer';

const Home = lazy(() => import('./pages/Home/Home'));
const SearchFlight = lazy(() => import('./pages/SearchFlight/SearchFlight'));
const Checkout = lazy(() => import('./pages/Checkout/Checkout'));

const App = () => {
  return (
    <Router>
      <ApplicationContainer>
        <Suspense fallback={<LoadingOverlay visible={true} />}>
          <Routes>
            <Route exact path="/" element={ <Home /> } />
            <Route path="/searchflight" element={ <SearchFlight /> } />
            <Route path="/checkout" element={ <Checkout /> } />
          </Routes>
        </Suspense>
      </ApplicationContainer>
    </Router>
  );
}

export default App;
