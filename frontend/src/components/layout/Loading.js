import React from 'react';
export default function Loading() {
    const style = {
        height: "100vh",
        width: "100vw",
        position: "fixed",
        lineHeight: "100vh",
        top: 0,
        botton: 0,
        left: 0,
        right: 0,
        zIndex: 9999

    }

    return (
        <div className="bg-dark d-flex justify-content-around" style={style}>
            <p className="spinner-grow bg-info my-auto" style={{ width: "5vh", height: "5vh", lineHeight: "100vh" }} role="status">
                <span className="sr-only">Loading...</span>
            </p>
        </div>
    )
}
