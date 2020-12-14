import React, { Component } from 'react';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenAlt } from '@fortawesome/free-solid-svg-icons';
import { UserContext } from '../context/UserContext';
import { notify } from '../layout/Notification';
import { Redirect } from 'react-router-dom';
import Modal from 'react-modal';
import { BaseURL } from '../utils/constant';
import DefaultImage from './user.png';
Modal.setAppElement('body');

class EditProfile extends Component {
    static contextType = UserContext;
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            email: "",
            gender: "0",
            dob: "",
            address: "",
            password: "",
            cpassword: "",
            image: null,
            newImage: null,
            errors: {},
            modalIsOpen: false
        }

        this.customStyles = {
            content: {
                height: '80vh',
                top: '50%',
                left: '50%',
                right: 'auto',
                bottom: 'auto',
                marginRight: '-50%',
                transform: 'translate(-50%, -50%)',
                overflowY: 'scroll'
            }
        };
    }

    openModal = () => this.setState({ modalIsOpen: true });
    closeModal = () => this.setState({ modalIsOpen: false });


    onChange = e => {
        const name = e.target.name;
        const value = e.target.value;
        this.setState({ [name]: value });
    }

    onImageSelected = e => {
        const file = e.target.files[0];
        const validImageTypes = ["image/png", "image/jpeg", "image/jpg"];
        if (file) {
            if ((file.size / (1024 * 1024)) < 2) {
                let { errors } = this.state;
                delete errors.newImage;
                if (!validImageTypes.includes(file.type.toLowerCase())) {
                    errors.newImage = "JPG, JPEG and PNG file format is only supported";
                }               
                this.setState({ newImage: file, errors });
            } else {
                this.setState({ errors: { newImage: "File size cannot be more then 2 MB" } });
            }
        }
    }

    onSubmit = e => {
        e.preventDefault();
        let stateValues = this.state;
        if (this.validate(stateValues)) {
            let data = new FormData();
            if (stateValues.name) {
                data.append("name", stateValues.name);
            }

            if (stateValues.gender && stateValues.gender !== "0") {
                data.append("gender", stateValues.gender);
            }

            if (stateValues.dob) {
                data.append("dob", stateValues.dob);
            }

            if (stateValues.address) {
                data.append("address", stateValues.address);
            }

            if (stateValues.email) {
                data.append("email", stateValues.email);
            }

            if (stateValues.password) {
                data.append("password", stateValues.password)
            }

            if (stateValues.newImage) {
                data.append("image", stateValues.newImage)
            }

            Axios({
                method: "put",
                url: `${BaseURL}users/profile`,
                data,
                headers: {
                    "content-type": "multipart/form-data",
                    authorization: localStorage.getItem("token")
                }
            }).then(result => {
                if (result.data) {
                    notify("info", result.data.name + " profile updated successfully");
                    this.context.setUser(result.data);
                }
            }).catch(e => {
                if (e.response && e.response.data.message) {
                    notify("danger", e.response.data.message);
                } else {
                    notify("danger", "Unable to update profile");
                }
            });
        }
    }

    onPasswordFocus = () => {
        let { errors } = this.state;
        delete errors.password;
        this.setState({ errors });
    }

    onPasswordBlur = () => {
        let { errors, password, cpassword } = this.state;

        if (!password) {
            if (cpassword) {
                errors.password = "Password is required";
            }
        } else if (password.length < 6) {
            errors.password = "Password must be 6 characters long";
        } else if (cpassword.length >= 6) {
            if (cpassword !== password) {
                errors.cpassword = "Password doesn't match";
            } else {
                delete errors.cpassword;
            }
        }
        this.setState({ errors });
    }

    onConfirmPasswordFocus = () => {
        let { errors } = this.state;
        delete errors.cpassword;
        this.setState({ errors });
    }

    onConfirmPasswordBlur = () => {
        let { errors, password, cpassword } = this.state;
        if (!cpassword) {
            if (password) {
                errors.cpassword = "Confirm password is required";
            }
        } else if (cpassword.length < 6) {
            errors.cpassword = "Password must be 6 characters long";
        } else if (cpassword.length > 6) {
            if (cpassword !== password) {
                errors.cpassword = "Confirm password doesn't match";
            } else {
                delete errors.password;
            }
        }
        this.setState({ errors });

    }

    validate = (data) => {
        let errors = {};

        if (data.newImage) {
            const validImageTypes = ["image/png", "image/jpeg", "image/jpg"]
            if (!validImageTypes.includes(data.newImage.type.toLowerCase())) {
                errors.newImage = "JPG, JPEG and PNG file format is only supported";
            } else if ((data.newImage.size / (1024 * 1024)) > 2) {
                errors.newImage = "File size cannot be more then 2 MB"
            }
        }

        if (data.password && !data.cpassword) {
            errors.cpassword = "Please confirm your password";
        }

        if (data.cpassword && !data.password)
            errors.password = "This field cannot be empty to change password";

        if (data.password && data.cpassword) {
            if (data.password.length < 6)
                errors.password = "Password must be 6 characters long";

            if (data.cpassword.length < 6)
                errors.cpassword = "Confirm password must be 6 characters long";

            if (data.password !== data.cpassword)
                errors.cpassword = "Conform password dosen't match";
        }
        this.setState({ errors });
        return Object.keys(errors).length === 0;
    }

    componentDidMount = () => {
        let { name, gender, email, address, dob } = this.context.user;
        name = name ? name : "";
        gender = gender ? gender : "0";
        email = email ? email : "";
        address = address ? address : "";
        dob = dob ? dob.substring(0, 10) : "";
        this.setState({ name, gender, dob, email, address });
    }

    render() {

        const { user } = this.context;

        const { name, email, gender, dob, address, errors } = this.state;

        if (!user) {
            return <Redirect to="/" />
        }

        return (
            <React.Fragment>
                <button type="button" onClick={this.openModal} className="btn btn-primary rounded-0">
                    <FontAwesomeIcon className="mr-2" icon={faPenAlt} /> EDIT PROFILE
        </button>
                <Modal
                    isOpen={this.state.modalIsOpen}
                    onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    style={this.customStyles}
                >
                    <div className="row m-0 p-4 dami-bg d-flex justify-content-around">
                        <div className="col-md-12 mx-auto card rounded-0">
                            <div className="card-header">
                                <button type="button" onClick={this.closeModal} className="close ml-3" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                                <h4 className="text-center text-info">{user.name.toUpperCase()} PROFILE</h4>
                            </div>

                            <div className="card-body">
                                {
                                    user.image ?
                                        <img style={{ height: "100px", width: "100px" }} className="rounded-circle d-flex mx-auto" src={`${BaseURL}${user.image}`} alt={`Avatar of ${user.name}`} />
                                        :
                                        <img style={{ height: "100px", width: "100px" }} className="rounded-circle d-flex mx-auto" src={DefaultImage} alt={`App default avatar of ${user.name}`} />
                                }
                                <form method="post" onSubmit={this.onSubmit} encType="multipart/form-data">
                                    <div className="form-group">
                                        <label htmlFor="name"> NAME</label>
                                        <input type="text" name="name" onChange={this.onChange} placeholder="YOUR NAME" value={name} className={"form-control rounded-0 " + (errors.name ? "is-invalid" : "")} />
                                        <div className="invalid-feedback">
                                            <span>{errors.name}</span>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="email">EMAIL</label>
                                        <input type="email" name="email" onChange={this.onChange} value={email} placeholder="YOUR EMAIL" className={"form-control rounded-0 " + (errors.email ? "is-invalid" : "")} />
                                        <div className="invalid-feedback">
                                            <span>{errors.email}</span>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="gender">GENDER</label>
                                        <select value={gender} className={"form-control rounded-0 " + (errors.gender ? "is-invalid" : "")} onChange={this.onChange} name="gender">
                                            <option key="0" value="0"> SELECT GENDER </option>
                                            <option key="1" value="male"> MALE </option>
                                            <option key="2" value="female"> FEMALE </option>
                                        </select>
                                        <div className="invalid-feedback">
                                            <span>{errors.category}</span>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="dob">DOB</label>
                                        <input type="date" name="dob" onChange={this.onChange} value={dob} placeholder={user.dob} className={"form-control rounded-0 " + (errors.dob ? "is-invalid" : "")} />
                                        <div className="invalid-feedback">
                                            <span>{errors.dob}</span>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="address">ADDRESS</label>
                                        <input type="text" name="address" onChange={this.onChange} value={address} placeholder="YOUR ADDRESS" className={"form-control rounded-0 " + (errors.address ? "is-invalid" : "")} />
                                        <div className="invalid-feedback">
                                            <span>{errors.address}</span>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="newImage">NEW IMAGE</label>
                                        <input type="file" name="newImage" onChange={this.onImageSelected} className={"form-control rounded-0 " + (errors.newImage ? "is-invalid" : "")} />
                                        <div className="invalid-feedback">
                                            <span>{errors.newImage}</span>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="password">NEW PASSWORD</label>
                                        <input type="password" name="password" onChange={this.onChange} onFocus={this.onPasswordFocus} onBlur={this.onPasswordBlur} placeholder="YOUR NEW PASSWORD" className={"form-control rounded-0 " + (errors.password ? "is-invalid" : "")} autoComplete="false" />
                                        <div className="invalid-feedback">
                                            <span>{errors.password}</span>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="cpassword">CONFIRM PASSWORD</label>
                                        <input type="password" name="cpassword" onChange={this.onChange} onFocus={this.onConfirmPasswordFocus} onBlur={this.onConfirmPasswordBlur} placeholder="CONFIRM YOUR PASSWORD" className={"form-control rounded-0 " + (errors.cpassword ? "is-invalid" : "")} autoComplete="false" />
                                        <div className="invalid-feedback">
                                            <span>{errors.cpassword}</span>
                                        </div>
                                    </div>

                                    <div className="form-group text-center">
                                        <button className="btn btn-success rounded-0" name="update_profile" type="submit">UPDATE PROFILE</button>
                                    </div>
                                </form>
                            </div>
                        </div>

                    </div>

                </Modal>
            </React.Fragment>
        )
    }
}


export default EditProfile;
