import React, { Component } from 'react';
import { faExclamationTriangle, faTachometerAlt, faImages, faPlus, faAsterisk, faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Axios from 'axios';
import { BaseURL } from '../utils/Constant';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import Sidebar from '../layout/Sidebar';
import { simplifiedError } from '../utils/SimplifiedError';
import Dialog from '../layout/Dialog';
import Loading from '../layout/Loading';
import { toast } from 'react-toastify';

export default class AddSliderImage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            image: null,
            visibility: false,
            imageDataURI: null,
            errors: {},
            dialog: null,
            isRequestComplete: true
        };
    }

    onChangeHandler = (e) => {
        const name = e.target.name;
        let value = e.target.value;
        if (name === "visibility") value = value !== "true";
        this.setState({ [name]: value });
    };

    onFormSubmit = e => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const stateValues = this.state;
        if (this.validate(stateValues) && token) {
            this.setState({ isRequestComplete: false });
            const data = new FormData();
            data.append("image", stateValues.image);
            data.append("visibility", stateValues.visibility);

            Axios({
                method: "post",
                data,
                url: `${BaseURL}sliderImages`,
                headers: {
                    authorization: token
                }
            }).then(result => {
                this.setState({ image: null, imageDataURI: null, errors: {}, isRequestComplete: true });
                toast.success("Slider image added successfully");
                this.props.history.goBack();
            }).catch(error => {
                let { errors } = this.state;
                if (error.response && error.response.data.message) {
                    if (typeof error.response.data.message === "object" && Object.keys(error.response.data.message).length > 0) {
                        errors = error.response.data.message;
                    } else {
                        errors.error = error.response.data.message;
                    }
                } else {
                    errors.error = "Unable to add slider image";
                }
                this.setState({ errors, isRequestComplete: true }, () => this.setUpErrorDialog());
            });
        }
    };

    validate = data => {
        let errors = {};
        if (data.image) {
            const validImageTypes = ["image/png", "image/jpeg", "image/jpg"];
            if (!validImageTypes.includes(data.image.type.toLowerCase())) {
                errors.image = "JPG, JPEG and PNG file format is only supported";
            } else if ((data.image.size / (1024 * 1024)) > 2) {
                errors.image = "File size cannot be more then 2 MB";
            }
        }
        this.setState({ errors });
        return Object.keys(errors).length === 0;
    }

    onImageSelected = async e => {
        const file = e.target.files[0];
        const validImageTypes = ["image/png", "image/jpeg", "image/jpg"];
        if (file) {
            if ((file.size / (1024 * 1024)) < 2) {
                let { errors } = this.state;
                delete errors.image;
                if (!validImageTypes.includes(file.type.toLowerCase())) {
                    errors.image = "JPG, JPEG and PNG file format is only supported";
                }
                this.setState({ image: file, imageDataURI: await this.getImageDataURI(file), errors });
            } else {
                this.setState({ image: null, imageDataURI: null, errors: { image: "File size cannot be more then 2 MB" } });
            }
        } else {
            const { errors } = this.state;
            errors.image = "No image selected";
            this.setState({ image: null, imageDataURI: null, errors });
        }
    };

    setUpErrorDialog = () => {
        const { errors } = this.state;
        const keysToBeIgnored = [];
        const errorMessage = simplifiedError(errors, keysToBeIgnored);
        if (errorMessage.errorString) {
            const errorDialog = <Dialog type="danger" headerText="SOMETHING WENT WRONG" bodyText={errorMessage.errorString} positiveButton={{ text: "OK" }} clearDialog={() => this.setState({ dialog: null })} icon={<FontAwesomeIcon icon={faExclamationTriangle} />} />;
            this.setState({ dialog: errorDialog, errors: errorMessage.errorObject });
        }
    };

    getImageDataURI = async imageFile => {
        return new Promise((resolve, reject) => {
            try {
                let reader = new FileReader();
                reader.readAsDataURL(imageFile);
                reader.onload = e => {
                    resolve(e.target.result);
                };
            } catch (error) {
                reject(error.message);
            }
        });
    };

    render() {
        const { errors, image, visibility, imageDataURI, dialog, isRequestComplete } = this.state;

        return (
            <>
                {
                    dialog
                }
                <Navbar />
                <div className="container-fluid content-height">
                    <div className="row">
                        <div className="col-md-2 col-sm-3 p-0">
                            <Sidebar />
                        </div>
                        <div className="col-md-10 col-sm-9 p-0">
                            <div className="card box-shadow rounded-0 m-4 p-3">
                                <div className="card-header">
                                    <h4 className="text-danger"><FontAwesomeIcon icon={faPlus} /> Add Slider Image</h4>
                                    <p className="mt-3 text-secondary font-italic"><FontAwesomeIcon icon={faTachometerAlt} /> Dashboard / <FontAwesomeIcon icon={faImages} /> Slider Images / <FontAwesomeIcon icon={faPlus} /> Add Slider Image</p>
                                </div>

                                {
                                    isRequestComplete ? (

                                        <div className="card-body">
                                            <div className="row d-flex justify-content-around">
                                                <div className="col-12">
                                                    <form onSubmit={this.onFormSubmit}>
                                                        <div className="form-group">
                                                                <label className="m-1 text-info" htmlFor="image">SELECT NEW IMAGE <span className="text-danger asterisk-info"><FontAwesomeIcon className="text-danger m-1 asterisk" icon={faAsterisk} />Required</span></label>
                                                                <div className="m-1">

                                                                    {
                                                                        image &&
                                                                        (
                                                                            <img style={{ height: "150px", width: "150px" }} src={imageDataURI} alt="" className="img-thumbnail m-2" />
                                                                        )
                                                                    }

                                                                    <input type="file" id="image" name="image" onChange={this.onImageSelected} className={"form-control rounded-0 " + (errors.image ? "is-invalid" : "")} />
                                                                    <div className="invalid-feedback" autoComplete="off">
                                                                        <span>{errors.image}</span>
                                                                    </div>
                                                                </div>
                                                        </div>
                                                        <div className="form-group d-flex justify-content-start">
                                                            <label className="my-1 mr-2 text-info" htmlFor="visibility">VISIBILITY</label>
                                                            <input type="checkbox" name="visibility" value={visibility} checked={visibility} onChange={this.onChangeHandler} className="form-control-sm rounded-0 cursor-pointer" style={{ width: "20px" }} />
                                                        </div>

                                                        <div className="card-footer form-group text-center rounded-0">
                                                            <button id="addCategoryBtn" type="submit" className="btn btn-success rounded-0 m-1 text-center">ADD SLIDER IMAGE <FontAwesomeIcon icon={faPlusSquare} /> </button>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    ) : <Loading />
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }
}
