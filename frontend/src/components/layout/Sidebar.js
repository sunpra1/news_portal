import { Link } from 'react-router-dom';
import React, { Component } from 'react'
import { UserContext } from '../context/UserContext';

export default class Sidebar extends Component {
    static contextType = UserContext;
    render() {
        const { user } = this.context;
        return (
            <div className="col p-0 sidebar hide-scrollbar">
                <ul className="list-group p-4 rounded-0 d-flex justify-content-center">
                    <li className="list-group-item border-0 box-shadow mb-3"><Link className="text-light d-block" to="/" id="viewDashboardSection" >DASHBOARD</Link></li>
                    {
                        user && user.role === "ADMIN" && <li className="list-group-item border-0 box-shadow mb-3" id="viewCategorySection"><Link className="text-light d-block" to="/categories" >CATEGORY</Link></li>
                    } 
                    {
                        user && user.role === "ADMIN" && <li className="list-group-item border-0 box-shadow mb-3"><Link className="text-light d-block" to="/news" id="viewAllNewsSection">ALL NEWS</Link></li>
                    }
                    {
                        user && user.role === "AUTHOR" && <li className="list-group-item border-0 box-shadow mb-3"><Link className="text-light d-block" to="/news/my" id="viewMyNewsSection">MY NEWS</Link></li>
                    }                    
                    {
                        user && user.role === "ADMIN" && <li className="list-group-item border-0 box-shadow mb-3"><Link className="text-light d-block" to="/users" id="viewUserSection">USERS</Link></li>
                    }
                    {
                        user && user.role === "ADMIN" && <li className="list-group-item border-0 box-shadow mb-3"><Link className="text-light d-block" to="/sliderImages" id="viewAllNewsSection">SLIDER IMAGES</Link></li>
                    }
                    {
                        user && user.role === "ADMIN" && <li className="list-group-item border-0 box-shadow mb-3"><Link className="text-light d-block" to="/messages" id="viewAllNewsSection">MESSAGES</Link></li>
                    }

                    <li className="list-group-item border-0 box-shadow"><Link className="text-light d-block" to="/user/profile" id="viewProfileSection">PROFILE</Link></li>
                </ul>
            </div>
        )
    }
}