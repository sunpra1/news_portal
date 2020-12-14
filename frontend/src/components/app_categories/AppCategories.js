import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faBars } from '@fortawesome/free-solid-svg-icons';
import { UserContext } from '../context/UserContext';
import { Redirect } from 'react-router-dom';
import CategoryList from './CategoryList';
import AddCategory from './AddCategory';

export default class AppCategories extends Component {
    static contextType = UserContext;
    render() {
        // if (this.context.user && this.context.user.role !== "admin") {
        //     return <Redirect to="/user/dashboard" />
        // } else if (this.context.user) {
            return (
                <div className="container-fluid content-height bg-grey">
                    <div className="row">
                        <div className="col-md-10 mx-auto my-4">
                            <div className="card box-shadow">
                                <div className="card-header">
                                    <h4 className="text-danger"><FontAwesomeIcon icon={faBars} /> App Categories</h4>
                                    <p className="mt-3 text-secondary font-italic"><FontAwesomeIcon icon={faTachometerAlt} /> Dashboard / <FontAwesomeIcon icon={faBars} /> Categories</p>
                                </div>

                                <div className="card-body">
                                    <div className="row d-flex justify-content-around">

                                        <div className="col-md-12">
                                            <AddCategory />
                                        </div>

                                        <div className="col-md-12">
                                            <CategoryList />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        // }
    }
}