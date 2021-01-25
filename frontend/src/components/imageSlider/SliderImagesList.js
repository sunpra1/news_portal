import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faCheck, faTimes, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { BaseURL } from '../utils/Constant';
import Axios from 'axios';
import { simplifiedError } from '../utils/SimplifiedError';
import Dialog from '../layout/Dialog';
import { toast } from 'react-toastify';

export default class SliderImagesList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            errors: {},
            dialog: null,
            isRequestComplete: true
        };
    }

    setUpErrorDialog = () => {
        const { errors } = this.state;
        const keysToBeIgnored = [];
        const errorMessage = simplifiedError(errors, keysToBeIgnored);
        if (errorMessage.errorString) {
            const errorDialog = <Dialog type="danger" headerText="SOMETHING WENT WRONG" bodyText={errorMessage.errorString} positiveButton={{ text: "OK" }} clearDialog={() => this.setState({ dialog: null })} icon={<FontAwesomeIcon icon={faExclamationTriangle} />} />;
            this.setState({ dialog: errorDialog, errors: errorMessage.errorObject });
        }
    };

    toggleSliderImageVisibility = (image, position) => {
        const token = localStorage.getItem("token");
        if (token) {
            Axios({
                method: 'put',
                url: `${BaseURL}sliderImages/${image._id}/toggleVisibility`,
                headers: {
                    authorization: token
                }
            }).then(result => {
                this.setState({ isRequestComplete: true });
                this.props.toggleSliderImageVisibility(position);
                toast.success(`Slider image has been made ${result.data.visibility ? "visible": "invisible"}`);
            }).catch(error => {
                let { errors } = this.state;
                if (error.response && error.response.data.message) {
                    if (typeof error.response.data.message === "object" && Object.keys(error.response.data.message).length > 0) {
                        errors = error.response.data.message;
                    } else {
                        errors.error = error.response.data.message;
                    }
                } else {
                    errors.error = "Unable to change the image visibility";
                }
                this.setState({ errors, isRequestComplete: true }, () => this.setUpErrorDialog());
            });
        }
    }

    deleteSliderImage  = (image, position) => {
        const token = localStorage.getItem("token");
        if (token) {
            Axios({
                method: 'delete',
                url: `${BaseURL}sliderImages/${image._id}`,
                headers: {
                    authorization: token
                }
            }).then(result => {
                this.setState({ isRequestComplete: true });
                this.props.deleteSliderImage(position);
                toast.success("Slider image has been deleted successfully");
            }).catch(error => {
                let { errors } = this.state;
                if (error.response && error.response.data.message) {
                    if (typeof error.response.data.message === "object" && Object.keys(error.response.data.message).length > 0) {
                        errors = error.response.data.message;
                    } else {
                        errors.error = error.response.data.message;
                    }
                } else {
                    errors.error = "Unable to delete slider image";
                }
                this.setState({ errors, isRequestComplete: true }, () => this.setUpErrorDialog());
            });
        }
    }

    render() {
        const { sliderImages } = this.props;
        return (
            <div className="col-12 table-responsive">
                <table className="table table-hover table-striped table-bordered">
                    <thead className="bg-info text-light">
                        <tr>
                            <th>S.N.</th>
                            <th>IMAGE</th>
                            <th>STATUS</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            sliderImages && sliderImages.length > 0 ?
                                (
                                    sliderImages.map((image, index) => {
                                        return (
                                            <tr>
                                                <td>{index + 1}</td>
                                                <td><img style={{ height: "150px", width: "200px" }} src={`data:${image.image.mimetype};base64,${image.image.buffer}`} alt={`Slider ${index}`} /></td>
                                                <td><p className={`text-center ${image.visibility ? "text-success" : "text-danger"}`}>{image.visibility ? "VISIBLE" : "NOT VISIBLE"}</p></td>
                                                <td>
                                                    <button onClick={() => this.toggleSliderImageVisibility(image, index)} className={`btn ${image.visibility ? "btn-danger" : "btn-success"} rounded-0 btn-sm m-1`}><FontAwesomeIcon icon={image.visibility ? faTimes : faCheck} /> </button>
                                                    <button onClick={() => this.deleteSliderImage(image, index)} className="btn btn-danger btn-sm rounded-0 m-1"><FontAwesomeIcon icon={faTrashAlt} /> </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )
                                :
                                (
                                    <tr>
                                        <td colSpan="4" className="text-center text-danger">
                                            NO SLIDER IMAGES
                                            </td>
                                    </tr>
                                )
                        }
                    </tbody>
                </table>
            </div>
        );
    }
}
