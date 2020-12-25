import React from 'react';
import { Link } from 'react-router-dom';

export default function Sidebar() {
    return (
        <div className="col p-0 sidebar">
            <ul className="list-group py-2 pr-4 pl-2 rounded-0">
                <li className="list-group-item border-0 box-shadow mb-3"><Link className="text-light d-block" to="/" >DASHBOARD</Link></li>
                <li className="list-group-item border-0 box-shadow mb-3"><Link className="text-light d-block" to="/categories" >CATEGORY</Link></li>
                <li className="list-group-item border-0 box-shadow mb-3"><Link className="text-light d-block" to="/news" >NEWS</Link></li>
            </ul>
        </div>
    );
}
