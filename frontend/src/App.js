import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'jquery/dist/jquery.min.js';
import 'bootstrap/dist/js/bootstrap.min.js';
import './App.css';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Notification from './components/layout/Notification';
import Profile from './components/profile/Profile';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import UserProvider from './components/context/UserContext';
import Dashboard from './components/dashboard/Dashboard';
import AppCategories from './components/app_categories/AppCategories';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AddNews from './components/add_news/AddNews';
import AuthRoute from './components/routes/AuthRoute';
import AdminRoute from './components/routes/AdminRoute';

function App() {
  return (
    <UserProvider>
      <Router>
        <Navbar />
        <Notification />
        <Route exact path="/login" component={Login} />
        <Route exact path="/register" component={Register} />
        <Route exact path="/categories" component={AppCategories} />
        <Route exact path="/" component={Login} />
        {/* <AuthRoute exact path="/add_news" component={AddNews} /> */}
        {/* <AuthRoute exact path="/user/profile" component={Profile} /> */}
        {/* <AuthRoute exact path="/user/dashboard" component={Dashboard} /> */}
        {/* <AdminRoute exact path="/app/categories" component={AppCategories} /> */}
        <Footer />
      </Router>
    </UserProvider>
  );
}
export default App;