import React from 'react';

export default function Footer() {
    return (
        <footer className="bg-footer fixed-bottom">
            <h6 className="text-center text-light py-3">Copyright &copy; The Achievers {new Date().getFullYear()}</h6>
        </footer>
    )
}
