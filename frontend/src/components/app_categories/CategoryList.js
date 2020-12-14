import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import Axios from 'axios';
import Loading from '../layout/Loading';
import { notify } from '../layout/Notification';
import UpdateCategory from './UpdateCategory';
import { BaseURL } from '../utils/constant';

class CategoryList extends Component {
    constructor(props) { 
        super(props);
        this.state = {
            categories : []
        }
    }

    onDeleteClick = categoryID => {
        if (window.confirm("Please confirm to delete this category")) {
            Axios({
                method: "delete",
                url: `${BaseURL}categories/${categoryID}`,
                headers: {
                    authorization: localStorage.getItem("token")
                }
            })
                .then(result => {
                    this.context.deleteCategory(result.data._id);
                    notify("success", "Category deleted successfully");
                })
                .catch(e => {
                    if (e.response && e.response.data.message) {
                        notify("danger", e.response.data.message);
                    } else {
                        notify("danger", "Unable to delete your category");
                    }
                });
        }
    }

    render() {
        const { categories } = this.state;

        if (!categories) {
            return <Loading />
        }

        else if (categories.length === 0) {
            return (

                <div className="col-md-12">
                    <div className="table-responsive">
                        <table className="table table-stripped table-bordered table-hover">
                            <thead>
                                <tr className="bg-info text-light">
                                    <th>CATEGORIES</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colSpan="2" className="text-danger text-center">No Categories Found</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )
        }

        else {
            return (
                <div className="table-responsive">
                    <table className="table table-stripped table-bordered table-hover">
                        <thead>
                            <tr className="bg-info text-light">
                                <th>CATEGORIES</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                categories.map(cat => {
                                    return (
                                        <tr key={cat._id}>
                                            <td>{cat.category}</td>
                                            <td>
                                                <UpdateCategory category={cat} />

                                                <button onClick={() => this.onDeleteClick(cat._id)} className="btn btn-sm rounded-0 btn-danger mx-1"><FontAwesomeIcon icon={faTrash} /></button>
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                </div>
            )
        }
    }
}

export default CategoryList;