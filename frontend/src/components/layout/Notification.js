import React, { Component } from 'react';
import EventEmitter from 'event-emitter';

function NotificationMessage(props) {
    const styles = {
        notification: {
            position: "fixed",
            top: props.margin_top ? props.margin_top : "-100px",
            right: "10px",
            zIndex: "9999",
            transition: "top 0.5s ease"
        }
    };
    return (
        <div style={styles.notification} className={"alert rounded-0 bg-" + props.message_type + " fade show notification text-light"} role="alert">
            <span>{props.message}</span>
        </div>
    )
}

const NOTIFICATION = "NOTIFICATION";
const emitter = new EventEmitter();

export const notify = (type, message) => {
    emitter.emit(NOTIFICATION, type, message);
}

export default class Notification extends Component {

    constructor(props) {
        super(props);

        this.state = {
            margin_top: "",
            message_type: "",
            message: ""
        }

        this.timeOut = null;
    }


    componentDidMount() {
        emitter.on(NOTIFICATION, (type, message) => {
            this.triggerNotification(type, message);
        });
    }


    triggerNotification = (type, message) => {
        if (this.timeOut) {
            clearTimeout(this.timeOut);
            this.setState({ margin_top: "-100px" }, () => {
                this.timeOut = setTimeout(() => {
                    this.showNotification(type, message);
                }, 500);
            });
        } else {
            this.showNotification(type, message);
        }
    }

    showNotification = (type, message) => {
        this.setState({ margin_top: "10px", message_type: type, message }, () => {
            this.timeOut = setTimeout(() => {
                this.setState({ margin_top: "-100px", message_type: "", message: "" });
            }, 4000);
        });
    }

    render() {
        return (

            <NotificationMessage margin_top={this.state.margin_top} message_type={this.state.message_type} message={this.state.message} />

        )
    }
}
