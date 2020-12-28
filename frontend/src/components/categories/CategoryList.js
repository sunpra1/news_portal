import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faInfo, faPenAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
import Axios from 'axios';
import Loading from '../layout/Loading';
import { notify } from '../layout/Notification';
import { BaseURL } from '../utils/constant';
import Dialog from '../layout/Dialog';

class CategoryList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dialog: null
        };
    }

    onCategoryEditClicked = (category, position) => {
        if (category.news.length > 0) {
            const deleteDialog = <Dialog headerText="INFORMATION" bodyText={`The category has been already refrenced ${category.news.length} times to create the news. Updating of news is prohibited.`} positiveButton={{ text: "OK" }} clearDialog={() => this.setState({ dialog: null })} icon={<FontAwesomeIcon icon={faInfo} />} />;
            this.setState({ dialog: deleteDialog });
        } else {
            this.props.history.push({
                pathname: `/category/update/${category._id}`,
                category
            });
        }
    };

    onCategoryDeleteClicked = (category, position) => {
        if (category.news.length > 0) {
            const deleteDialog = <Dialog headerText="INFORMATION" bodyText={`The category has been already refrenced ${category.news.length} times to create the news. Deletion of news is prohibited.`} positiveButton={{ text: "OK" }} clearDialog={() => this.setState({ dialog: null })} icon={<FontAwesomeIcon icon={faInfo} />} />;
            this.setState({ dialog: deleteDialog });
        } else {
            const deleteDialog = <Dialog headerText="Are you sure?" bodyText="Please confirm to delete the category." positiveButton={{ text: "OK", handler: () => this.deleteHandler(category, position) }} negativeButton={{ text: "Cancel" }} clearDialog={() => this.setState({ dialog: null })} icon={<FontAwesomeIcon icon={faExclamationTriangle} />} />;
            this.setState({ dialog: deleteDialog });
        }
    };

    deleteHandler = (category, position) => {
        const token = localStorage.getItem("token");
        Axios({
            method: "delete",
            url: `${BaseURL}categories/${category._id}`,
            headers: {
                authorization: token
            }
        }).then(_ => {
            this.props.deleteCategory(position);
            notify("success", "Category deleted successfully");
        }).catch(e => {
            if (e.response && e.response.data.message) {
                if (Object.keys(e.response.data.message).length > 0) {
                    this.setState({ errors: e.response.data.message });
                } else {
                    this.setState({ errors: { error: e.response.data.message } });
                }
            } else {
                this.setState({ errors: { error: "Unable to delete your category" } });
            }
        });
    };

    render() {
        const { categories } = this.props;
        const { dialog } = this.state;

        if (!categories) {
            return <Loading />;
        }

        else if (categories.length === 0) {
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
                            <tr>
                                <td colSpan="2" className="text-danger text-center">No Categories Found</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            );
        }

        else {
            return (
                <>
                    { dialog}

                    <div className="table-responsive">
                        <table className="table table-stripped table-bordered table-hover">
                            <thead>
                                <tr className="bg-info text-light">
                                    <th>CATEGORIES</th>
                                    <th>NEWS COUNT</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    categories.map((cat, position) => {
                                        return (
                                            <tr key={cat._id}>
                                                <td>{cat.category}</td>
                                                <td>{cat.news.length}</td>
                                                <td>
                                                    <button onClick={() => this.onCategoryEditClicked(cat, position)} className="btn btn-info btn-sm rounded-0"><FontAwesomeIcon icon={faPenAlt} /></button>

                                                    <button onClick={() => this.onCategoryDeleteClicked(cat, position)} className="btn btn-sm rounded-0 btn-danger mx-1"><FontAwesomeIcon icon={faTrash} /></button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                </>
            );
        }
    }
}

export default CategoryList;