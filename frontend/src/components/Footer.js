// src/components/Footer.jsx
import React from 'react';
import { faFacebook, faTwitter, faTelegram, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../styles/Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="contact-info">
                <p>Address: Mexico, SMU Main Campus, Addis Ababa, Ethiopia</p>
                <p>Email: info@smucreditandsaving.com</p>
                <p>Phone: +251 123 456 789</p>
            </div>
            <div className="social-media">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                    <FontAwesomeIcon icon={faFacebook} />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                    <FontAwesomeIcon icon={faTwitter} />
                </a>
                <a href="https://telegram.org" target="_blank" rel="noopener noreferrer">
                    <FontAwesomeIcon icon={faTelegram} />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                    <FontAwesomeIcon icon={faInstagram} />
                </a>
            </div>
            <p className="copyright">© 2025 SMU Credit & Saving System. All rights reserved.</p>
        </footer>
    );
};

export default Footer;