import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenAlt } from '@fortawesome/free-solid-svg-icons';
import Axios from 'axios';
import { notify } from '../layout/Notification';
import { BaseURL } from '../utils/constant';
import Modal from 'react-modal';
Modal.setAppElement('body');

class UpdateCategoryModel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            categoryDetails: this.props.category,
            category: this.props.category.category,
            errors: {},
            modalIsOpen: false
        };

        this.customStyles = {
            content: {
                top: '50%',
                left: '50%',
                right: 'auto',
                bottom: 'auto',
                marginRight: '-50%',
                transform: 'translate(-50%, -50%)'
            }
        };
    }

    openModal = () => this.setState({ modalIsOpen: true });
    closeModal = () => this.setState({ modalIsOpen: false });

    onChange = e => {
        const name = e.target.name;
        const value = e.target.value;

        this.setState({ [name]: value });
    };

    onSubmit = e => {
        e.preventDefault();
        if (this.validate()) {
            Axios({
                method: "put",
                data: { category: this.state.category },
                url: `${BaseURL}categories/${this.state.categoryDetails._id}`,
                headers: {
                    authorization: localStorage.getItem("token")
                }
            })
                .then(result => {
                    // this.context.updateCategory(result.data);

                    this.closeModal();
                    notify("success", "Category updated successfully");

                })
                .catch(e => {
                    if (e.response && e.response.data.message) {
                        this.setState({ errors: e.response.data.message });
                    } else {
                        notify("danger", "Unable to update your category");
                    }
                });
        }
    };

    validate = () => {
        const { category } = this.state;
        if (!category) {
            this.setState({ errors: { category: "Category field is left empty" } });
            return false;
        }

        return true;
    };

    render() {
        const { errors, category, categoryDetails } = this.state;

        return (
            <React.Fragment>
                <button type="button" onClick={this.openModal} className="btn btn-sm btn-primary mx-1 rounded-0">
                    <FontAwesomeIcon icon={faPenAlt} />
                </button>
                <Modal
                    isOpen={this.state.modalIsOpen}
                    onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    style={this.customStyles} >
                    <div className="row m-0 p-4 dami-bg">
                        <div className="col-md-12 mx-auto card">
                            <div className="card-header bg-info text-light">
                                <button type="button" onClick={this.closeModal} className="close" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                                <h5 className="modal-title" id="exampleModalLabel">EDIT CATEGORY</h5>
                            </div>
                            <div className="card-body">
                                {
                                    (categoryDetails && categoryDetails.discussions.length > 0)
                                        ?
                                        <p><span className="text-danger text-center">ERROR: </span><br />
                                            <span className="text-info">Discussion Count: {categoryDetails.discussions.length}</span>
                                            <br />
                                            This category has been already been refrenced to start discussion. So, update of the category is prohibited.
                                        </p>
                                        :
                                        <form action="post" onSubmit={this.onSubmit} className="form-inline">
                                            <div className="form-row">
                                                <label className="m-1" htmlFor="email">CATEGORY</label>
                                                <div className="m-1">
                                                    <input name="category" onChange={this.onChange} value={category} className={"form-control rounded-0 " + (errors.category ? "is-invalid" : "")} />
                                                    <div className="invalid-feedback">
                                                        <span>{errors.category}</span>
                                                    </div>
                                                </div>
                                                <button type="submit" name="login" className="btn btn-success rounded-0 m-1 d-flex mx-auto">UPDATE</button>
                                            </div>
                                        </form>
                                }
                            </div>
                        </div>
                    </div>
                </Modal>
            </React.Fragment>
        );
    }
}

export default UpdateCategoryModel;