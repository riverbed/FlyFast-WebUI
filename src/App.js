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
const HomeAlternative = lazy(() => import('./pages/HomeAlternative/HomeAlternative'));

const App = () => {
  return (
    <ApplicationContainer>
      <Router>
        <Suspense fallback={<LoadingOverlay visible={true} />}>
          <Routes>
            <Route exact path="/" element={ <Home /> } />
            <Route exact path="/HomeAlternative" element={ <HomeAlternative /> } />
          </Routes>
        </Suspense>
      </Router>
    </ApplicationContainer>
  );
}

export default App;
