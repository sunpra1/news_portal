import React, { Component } from 'react';
import Modal from 'react-modal';
Modal.setAppElement('body');

class Dialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modalIsOpen: true
        };
        this.customStyles = {
            content: {
                top: '50%',
                left: '50%',
                right: 'auto',
                bottom: 'auto',
                padding: '4px',
                borderRadius: '0px',
                transform: 'translate(-50%, -50%)'
            }
        };
    }

    openModal = () => {
        this.setState({ modalIsOpen: true });
    };

    closeModal = () => {
        this.setState({ modalIsOpen: false });
    };

    onPositiveButtonClick = () => {
        const { positiveButton } = this.props;
        if (positiveButton && positiveButton.handler) {
            positiveButton.handler();
        }
        this.closeModal();
    };

    onNegativeButtonClicked = () => {
        const { negativeButton } = this.props;
        if (negativeButton && negativeButton.handler) {
            negativeButton.handler();
        }
        this.closeModal();
    };

    onAfterClose = () => {
        if (this.props.clearDialog)
            this.props.clearDialog();
    };

    render() {
        const { type, icon, headerText, bodyText, positiveButton, negativeButton } = this.props;
        return (
            <Modal
                isOpen={this.state.modalIsOpen}
                onRequestClose={this.closeModal}
                style={this.customStyles}
                onAfterClose={this.onAfterClose}>
                <div className="col mx-auto card rounded-0 p-0" style={{minWidth: "300px"}}>
                    <div className={`card-header text-light rounded-0 ${type ? `bg-${type}` : "bg-info"}`}>
                        <h6 className="modal-title" id="exampleModalLabel">
                            <span className="mr-2">{icon ? icon : ""}</span>
                            {headerText ? headerText.toUpperCase() : "DIALOG"}
                        </h6>
                    </div>
                    <div className="card-body">
                        <p style={{ maxWidth: "40vh" }}> {bodyText ? bodyText : ""} </p>
                    </div>
                    <div className="card-footer d-flex justify-content-end">
                        {
                            negativeButton && negativeButton.text && <button onClick={this.onNegativeButtonClicked} className="btn btn-danger btn-sm rounded-0 mr-2" style={{ minWidth: "100px" }}>{negativeButton.text}</button>
                        }
                        {
                            (positiveButton && positiveButton.text)
                                ?
                                <button onClick={this.onPositiveButtonClick} className="btn btn-success btn-sm rounded-0" style={{ minWidth: "100px" }}> {positiveButton.text} </button>
                                :
                                <button onClick={this.onPositiveButtonClick} className="btn btn-success btn-sm rounded-0" style={{ minWidth: "100px" }}>OK</button>
                        }
                    </div>
                </div>
            </Modal>
        );
    }
}

export default Dialog;