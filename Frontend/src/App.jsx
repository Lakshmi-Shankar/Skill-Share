import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from './UserComponents/signup';
import Signin from './UserComponents/signin';
import Dashboard from './UserInterface/dashboard';
import Profile from './UserInterface/profile';

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element = { <Signup />} />
          <Route path='/sign-in' element = { <Signin />} />

          {/* Interface */}
          <Route path='/dashboard' element = { <Dashboard />} />
          <Route path='/profile' element = { <Profile />} />
        </Routes>
      </Router>
    
    </>
  );
}

export default App;
