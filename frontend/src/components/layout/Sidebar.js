import { Link } from 'react-router-dom';
import React, { Component } from 'react'
import { UserContext } from '../context/UserContext';

export default class Sidebar extends Component {
    static contextType = UserContext;
    render() {
        const { user } = this.context;
        return (
            <div className="col p-0 sidebar hide-scrollbar">
                <ul className="list-group py-2 pr-4 pl-2 rounded-0">
                    <li className="list-group-item border-0 box-shadow mb-3"><Link className="text-light d-block" to="/" >DASHBOARD</Link></li>
                    {
                        user && user.role === "ADMIN" && <li className="list-group-item border-0 box-shadow mb-3"><Link className="text-light d-block" to="/categories" >CATEGORY</Link></li>
                    } 
                    {
                        user && user.role === "ADMIN" && <li className="list-group-item border-0 box-shadow mb-3"><Link className="text-light d-block" to="/news" >ALL NEWS</Link></li>
                    }

                    {
                        user && user.role === "AUTHOR" && <li className="list-group-item border-0 box-shadow mb-3"><Link className="text-light d-block" to="/news/my" >MY NEWS</Link></li>
                    }
                    
                    {
                        user && user.role === "ADMIN" && <li className="list-group-item border-0 box-shadow mb-3"><Link className="text-light d-block" to="/users" >USERS</Link></li>
                    }                    
                    <li className="list-group-item border-0 box-shadow"><Link className="text-light d-block" to="/user/profile" >PROFILE</Link></li>
                </ul>
            </div>
        )
    }
}
