import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { getImageBuffer } from '../utils/ImageHandler';

export default class ImageSlider extends Component {
    constructor(props) {
        super(props);

        this.state = {
            imagePosition: 0,
            backgroundColor: "rgba(52, 52, 52, 0.0)"
        };
    }

    onLeftArrowClick = () => {
        let { imagePosition } = this.state;
        const totalImages = this.props.images.length;
        if (totalImages > 0) {
            if (imagePosition === 0) {
                imagePosition = totalImages - 1;
            } else {
                imagePosition--;
            }
            for (let i = 0; i <= 100; i = i + 5) {
                const iOpacity = i / 100;
                setTimeout(() => {
                    this.setState({ backgroundColor: `rgba(52, 52, 52, ${iOpacity})` });
                    if (i === 100) {
                        for (let j = 100; j >= 0; j = j - 5) {
                            const jOpacity = j / 100;
                            setTimeout(() => {
                                this.setState({ backgroundColor: `rgba(52, 52, 52, ${jOpacity})` });
                            }, 100 - j);
                            if (j === 0) {
                                this.setState({ imagePosition });
                            }
                        }
                    }
                }, i);
            }

        }
    };

    onRightArrowClick = () => {
        let { imagePosition } = this.state;
        const totalImages = this.props.images.length;
        if (totalImages > 0) {
            if (imagePosition === (totalImages - 1)) {
                imagePosition = 0;
            } else {
                imagePosition++;
            }
            for (let i = 0; i <= 100; i = i + 100) {
                const iOpacity = i / 100;
                setTimeout(() => {
                    this.setState({ backgroundColor: `rgba(52, 52, 52, ${iOpacity})` });
                    if (i === 100) {
                        for (let j = 100; j >= 0; j = j - 100) {
                            const jOpacity = j / 100;
                            setTimeout(() => {
                                this.setState({ backgroundColor: `rgba(52, 52, 52, ${jOpacity})` });
                            }, 100 - j);
                            if (j === 0) {
                                this.setState({ imagePosition });
                            }
                        }
                    }
                }, i);
            }
        }
    };

    render() {
        const { imagePosition, backgroundColor } = this.state;
        const { images } = this.props;
        return (
            <div className="col-12 p-0 mt-3" style={{ width: "100%", height: "74vh", position: "relative" }}>
                <img src={`data:${images[imagePosition].mimetype};base64,${getImageBuffer(images[imagePosition])}`} alt={`news cover at position ${imagePosition}`} className="img-thumbnail img-fluid rounded-0" style={{ width: "100%", height: "100%", zIndex: "99!important" }} />
                <div style={{ width: "100%", height: "100%", position: "absolute", top: "0", bottom: "0", left: "0", right: "0", zIndex: "999!important", backgroundColor }}></div>
                <FontAwesomeIcon onClick={this.onLeftArrowClick} icon={faAngleLeft} style={{ height: "6vh", width: "6vh", position: "absolute", left: "0", top: "34vh", color: "red", cursor: "pointer", zIndex: "999!important" }} />
                <FontAwesomeIcon onClick={this.onRightArrowClick} icon={faAngleRight} style={{ height: "6vh", width: "6vh", position: "absolute", right: "0", top: "34vh", color: "red", cursor: "pointer", zIndex: "999!important" }} />
            </div>
        );
    }
}
