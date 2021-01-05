import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'jquery/dist/jquery.min.js';
import 'bootstrap/dist/js/bootstrap.min.js';
import './App.css';
import Notification from './components/layout/Notification';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import UserProvider from './components/context/UserContext';
import Dashboard from './components/dashboard/Dashboard';
import Categories from './components/categories/Categories';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AddNews from './components/news/AddNews';
import AdminRoute from './components/routes/AdminRoute';
import News from './components/news/News';
import AddCategory from './components/categories/AddCategory';
import UpdateCategory from './components/categories/UpdateCategory';
import UpdateNews from './components/news/UpdateNews';
import ViewNews from './components/news/ViewNews';

function App() {
  return (
    <UserProvider>
      <Router>
        <Notification />
        <Route exact path="/login" component={Login} />
        <Route exact path="/register" component={Register} />
        <AdminRoute exact path="/" component={Dashboard} />
        <AdminRoute exact path="/categories" component={Categories} />
        <AdminRoute exact path="/news" component={News} />
        <AdminRoute exact path="/news/add" component={AddNews} />
        <AdminRoute exact path="/news/view/:newsID" component={ViewNews} />
        <AdminRoute exact path="/news/update/:newsID" component={UpdateNews} />
        <AdminRoute exact path="/category/add" component={AddCategory} />
        <AdminRoute exact path="/category/update/:categoryID" component={UpdateCategory} />
        {/* <AuthRoute exact path="/user/profile" component={Profile} /> */}
      </Router>
      
    </UserProvider>
  );
}
export default App;