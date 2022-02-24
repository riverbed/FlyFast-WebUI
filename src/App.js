import { LoadingOverlay } from '@mantine/core';
import { Suspense, lazy } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import './App.css';

import ApplicationContainer from './components/ApplicationContainer/ApplicationContiner';
const Home = lazy(() => import('./pages/Home/Home'));

const App = () => {
  return (
    <ApplicationContainer>
      <Router>
        <Suspense fallback={<LoadingOverlay visible={true} />}>
          <Routes>
            <Route exact path="/" element={ <Home /> } />
          </Routes>
        </Suspense>
      </Router>
    </ApplicationContainer>
  );
}

export default App;
