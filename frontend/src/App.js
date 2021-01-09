import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'jquery/dist/jquery.min.js';
import 'bootstrap/dist/js/bootstrap.min.js';
import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import UserProvider from './components/context/UserContext';
import Dashboard from './components/dashboard/Dashboard';
import Categories from './components/categories/Categories';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AddNews from './components/news/AddNews';
import AdminRoute from './components/routes/AdminRoute';
import AdminOrAuthorRoute from './components/routes/AdminOrAuthorRoute';
import News from './components/news/News';
import MyNews from './components/news/MyNews';
import AddCategory from './components/categories/AddCategory';
import UpdateCategory from './components/categories/UpdateCategory';
import UpdateNews from './components/news/UpdateNews';
import ViewNews from './components/news/ViewNews';
import Users from './components/users/Users';
import AddUser from './components/users/AddUser';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Profile from './components/profile/Profile';
import EditProfile from './components/profile/EditProfile';

function App() {
  return (
    <UserProvider>
      <Router>
        <ToastContainer />
        <Switch>
          <Route exact path="/login" component={Login} />
          <Route exact path="/register" component={Register} />
          <AdminOrAuthorRoute exact path="/user/profile" component={Profile} />
          <AdminOrAuthorRoute exact path="/user/profile/edit" component={EditProfile} />
          <AdminOrAuthorRoute exact path="/" component={Dashboard} />
          <AdminRoute exact path="/categories" component={Categories} />
          <AdminRoute exact path="/news" component={News} />
          <AdminOrAuthorRoute exact path="/news/my" component={MyNews} />
          <AdminOrAuthorRoute exact path="/news/add" component={AddNews} />
          <AdminOrAuthorRoute exact path="/news/view/:newsID" component={ViewNews} />
          <AdminOrAuthorRoute exact path="/news/update/:newsID" component={UpdateNews} />
          <AdminRoute exact path="/category/add" component={AddCategory} />
          <AdminRoute exact path="/category/update/:categoryID" component={UpdateCategory} />
          <AdminRoute exact path="/users" component={Users} />
          <AdminRoute exact path="/users/add" component={AddUser} />
        </Switch>
      </Router>
    </UserProvider>
  );
}
export default App;