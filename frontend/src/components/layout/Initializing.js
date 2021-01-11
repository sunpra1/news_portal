import React from 'react';
import LoadingGif from './loadingGif.gif';

export default function Initializing() {
    const style = {
        height: "100vh",
        width: "100vw",
        position: "fixed",
        lineHeight: "100vh",
        top: 0,
        botton: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: "rgb(31, 31, 31)"
    };

    return (
        <div style={style} className="container-fluid m-0 p-0 d-flex justify-content-center flex-column">            
            <img src={LoadingGif} alt="Loading application state" style={{ height: "60vh", width: "60vh" }} className="mx-auto" />
        </div>
    );
}
