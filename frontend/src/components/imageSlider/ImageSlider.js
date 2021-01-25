import { faExclamationTriangle, faTachometerAlt, faImages, faPlus } from '@fortawesome/free-solid-svg-icons';
import React, { Component } from 'react';
import SliderImagesList from './SliderImagesList';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Axios from 'axios';
import { BaseURL } from '../utils/Constant';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import Sidebar from '../layout/Sidebar';
import { simplifiedError } from '../utils/SimplifiedError';
import Dialog from '../layout/Dialog';
import Loading from '../layout/Loading';
import { Link } from 'react-router-dom';

export default class ImageSlider extends Component {
    constructor(props) {
        super(props);

        this.state = {
            sliderImages: [],
            errors: {},
            dialog: null,
            isRequestComplete: false
        };
    }

    toggleSliderImageVisibility = (position) => {
        const { sliderImages } = this.state;
        sliderImages[position].visibility = !sliderImages[position].visibility
        this.setState({ sliderImages });
    }

    deleteSliderImage = (position) => {
        const { sliderImages } = this.state;
        sliderImages.splice(position, 1);
        this.setState({ sliderImages });
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

    componentDidMount = async () => {
        const token = localStorage.getItem("token");
        if (token) {
            Axios({
                method: 'get',
                url: `${BaseURL}sliderImages`
            }).then(result => {
                this.setState({ sliderImages: result.data, isRequestComplete: true });
            }).catch(error => {
                let { errors } = this.state;
                if (error.response && error.response.data.message) {
                    if (typeof error.response.data.message === "object" && Object.keys(error.response.data.message).length > 0) {
                        errors = error.response.data.message;
                    } else {
                        errors.error = error.response.data.message;
                    }
                } else {
                    errors.error = "Unable to fetch slider images";
                }
                this.setState({ errors, isRequestComplete: true }, () => this.setUpErrorDialog());
            });
        }
    };

    render() {
        const { sliderImages, dialog, isRequestComplete } = this.state;

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
                                    <h4 className="text-danger"><FontAwesomeIcon icon={faImages} /> Slider Images</h4>
                                    <p className="mt-3 text-secondary font-italic"><FontAwesomeIcon icon={faTachometerAlt} /> Dashboard / <FontAwesomeIcon icon={faImages} /> Slider Images</p>
                                </div>

                                {
                                    isRequestComplete ? (

                                        <div className="card-body">
                                            <div className="row d-flex justify-content-around">
                                                <div className="col-12">
                                                    <Link className="btn btn-success rounded-0 float-right mb-3" to="/sliderImages/add">
                                                        <FontAwesomeIcon icon={faPlus} /> ADD NEW IMAGE
                                                    </Link>
                                                </div>
                                                <SliderImagesList sliderImages={sliderImages} toggleSliderImageVisibility={this.toggleSliderImageVisibility} deleteSliderImage={this.deleteSliderImage} />
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
