import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle, FaMoneyCheckAlt, FaPiggyBank } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faMapMarkerAlt, faEnvelope, faPhoneAlt } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faTwitter, faTelegram, faInstagram } from '@fortawesome/free-brands-svg-icons';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import '../styles/Homepage.css';
import 'animate.css';
import heroImage from '../assets/images/hero-image.png';

function Homepage() {
  useEffect(() => {
    const textElements = document.querySelectorAll('.text-animate');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate__animated', entry.target.dataset.animation || 'animate__fadeIn');
            entry.target.style.opacity = '1';
          } else {
            entry.target.classList.remove('animate__animated', entry.target.dataset.animation || 'animate__fadeIn');
            entry.target.style.opacity = '0';
          }
        });
      },
      { threshold: 0.1 }
    );

    textElements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="homepage">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link className="navbar-brand" to="/">SMU Credit & Savings</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className="nav-link" href="#features">Services</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#faq">FAQ</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#contact">Contact</a>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/login">Login</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section text-center">
        <div className="hero-overlay">
          <h1 className="display-4 text-animate" data-animation="animate__fadeInDown">SMU Employee’s Credit and Saving System</h1>
          <h2 className="lead text-animate" data-animation="animate__fadeIn">Empowering employees to manage their savings and loans efficiently.</h2>
          <Link to="/register" className="btn btn-light btn-lg get-started-btn text-animate" data-animation="animate__fadeInUp">
            <span className="button-text">Get Started</span>
            <FontAwesomeIcon icon={faArrowRight} className="arrow-icon d-none d-lg-inline" />
          </Link>
        </div>
      </header>

      {/* Services Section */}
      <section id="features" className="features-section py-5">
        <div className="container text-center">
          <h2 className="mb-5 text-animate" data-animation="animate__fadeInUp">Services</h2>
          <div className="row">
            <div className="col-md-4">
              <div className="feature-item text-animate" data-animation="animate__fadeInUp">
                <FaUserCircle size={50} className="text-primary mb-3" />
                <h4>Personalized Member Profiles</h4>
                <p>Manage your profile and access your savings and loan details anytime.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-item text-animate" data-animation="animate__fadeInUp">
                <FaMoneyCheckAlt size={50} className="text-primary mb-3" />
                <h4>Comprehensive Credit Management</h4>
                <p>Apply for loans, manage repayments, and track interest easily.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-item text-animate" data-animation="animate__fadeInUp">
                <FaPiggyBank size={50} className="text-primary mb-3" />
                <h4>Secure Savings Management</h4>
                <p>Securely manage your savings with up-to-date account information.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="about-section text-center py-5">
        <div className="container">
          <h2 className="text-animate" data-animation="animate__fadeInUp">About Us</h2>
          <p className="lead text-animate" data-animation="animate__fadeInUp">
            Our mission is to empower employees through financial management tools designed to improve credit and savings habits. We are committed to providing user-friendly, secure, and efficient services for all members.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="faq-section py-5">
        <div className="container">
          <h2 className="text-center mb-5 text-animate" data-animation="animate__fadeInUp">Frequently Asked Questions</h2>
          <div className="accordion" id="faqAccordion">
            <div className="accordion-item text-animate" data-animation="animate__fadeInUp">
              <h3 className="accordion-header">
                <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                  How can I apply for a loan?
                </button>
              </h3>
              <div id="faq1" className="accordion-collapse collapse show">
                <div className="accordion-body">
                  You can apply for a loan by logging into your account, navigating to the credit section, and submitting a loan application.
                </div>
              </div>
            </div>
            <div className="accordion-item text-animate" data-animation="animate__fadeInUp">
              <h3 className="accordion-header">
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                  How do I view my savings?
                </button>
              </h3>
              <div id="faq2" className="accordion-collapse collapse">
                <div className="accordion-body">
                  You can view your savings by accessing your profile page, where all savings details are available.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <section id="feedback" className="feedback-section py-5">
        <div className="container">
          <h2 className="text-center mb-5 text-animate" data-animation="animate__fadeInUp">Feedback</h2>
          <p className="text-animate" data-animation="animate__fadeInUp">We’d love to hear from you! Please share your feedback to help us improve our services.</p>
          <form className="feedback-form text-animate" data-animation="animate__fadeInUp">
            <textarea className="form-control mb-3" rows="4" placeholder="Write your feedback here..."></textarea>
            <button type="submit" className="btn btn-primary">Submit</button>
          </form>
        </div>
      </section>

     {/* Contact Section */}
<section id="contact" className="contact-section text-center py-5">
  <div className="container">
    <h2 className="text-animate" data-animation="animate__fadeInUp">Contact Us</h2>
    <p className="text-animate" data-animation="animate__fadeIn">Reach out to us via the following methods:</p>
    <div className="row contact-info justify-content-center">
      <div className="col-md-4">
        <FontAwesomeIcon icon={faMapMarkerAlt} size="2x" />
        <p><strong>Address:</strong> Mexico, SMU Main Campus, Addis Ababa, Ethiopia</p>
      </div>
      <div className="col-md-4">
        <FontAwesomeIcon icon={faEnvelope} size="2x" />
        <p><strong>Email:</strong> <a href="mailto:info@smucreditandsaving.com">info@smucreditandsaving.com</a></p>
      </div>
      <div className="col-md-4">
        <FontAwesomeIcon icon={faPhoneAlt} size="2x" />
        <p><strong>Phone:</strong> +251 123 456 789</p>
      </div>
    </div>

    {/* Social Media Links */}
    <div className="social-media text-center mt-4">
      <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
        <FontAwesomeIcon icon={faFacebook} size="2x" />
      </a>
      <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">
        <FontAwesomeIcon icon={faTwitter} size="2x" />
      </a>
      <a href="https://telegram.org" target="_blank" rel="noopener noreferrer" className="social-icon">
        <FontAwesomeIcon icon={faTelegram} size="2x" />
      </a>
      <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
        <FontAwesomeIcon icon={faInstagram} size="2x" />
      </a>
    </div>
  </div>
</section>


      {/* Footer */}
      <footer className="bg-dark text-light py-3 text-center">
        <p>© 2024 SMU Credit & Saving System. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Homepage;
