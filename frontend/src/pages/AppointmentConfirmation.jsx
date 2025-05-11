import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import '../styles/appointmentConfirmation.css';

const AppointmentConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [appointmentData, setAppointmentData] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolderName: ''
  });
  const [paymentStatus, setPaymentStatus] = useState('pending'); // 'pending', 'processing', 'success', 'failed'
  const [paymentError, setPaymentError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
    console.log('Location state in AppointmentConfirmation:', location.state);
    if (location.state) {
      setAppointmentData(location.state);
    } else {
      setAppointmentData(null);
    }
  }, [location.state]);

  const formatCardNumber = (value) => {
    // Remove all non-digits and trim to 16 digits
    const cleaned = value.replace(/\D/g, '').slice(0, 16);
    // Add space every 4 digits
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
  };

  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;

    let formattedValue = value;
    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4); // Only digits, max 4
    } else if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4); // Only digits for MMYY
      if (formattedValue.length >= 2) {
        formattedValue = `${formattedValue.slice(0, 2)}/${formattedValue.slice(2)}`;
      }
    } else if (name === 'cardHolderName') {
      formattedValue = value.replace(/[^a-zA-Z\s]/g, ''); // Only letters and spaces
    }

    setPaymentDetails(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validatePaymentForm = () => {
    const errors = {};
    const cleanedCardNumber = paymentDetails.cardNumber.replace(/\s/g, '');
    const expiryDateRegex = /^(0[1-9]|1[0-2])\/[0-9]{2}$/;
    const cvvRegex = /^[0-9]{3,4}$/;

    if (!cleanedCardNumber || cleanedCardNumber.length !== 16) {
      errors.cardNumber = 'Card number must be exactly 16 digits';
    }
    if (!expiryDateRegex.test(paymentDetails.expiryDate)) {
      errors.expiryDate = 'Valid expiry date (MM/YY) is required';
    }
    if (!cvvRegex.test(paymentDetails.cvv)) {
      errors.cvv = 'Valid CVV (3-4 digits) is required';
    }
    if (!paymentDetails.cardHolderName.trim()) {
      errors.cardHolderName = 'Cardholder name is required';
    } else if (paymentDetails.cardHolderName.trim().length < 2) {
      errors.cardHolderName = 'Cardholder name must be at least 2 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!validatePaymentForm()) return;

    setPaymentStatus('processing');
    setPaymentError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const paymentSuccessful = Math.random() > 0.1;
      if (paymentSuccessful) {
        setPaymentStatus('success');
      } else {
        throw new Error('Payment declined. Please try another card.');
      }
    } catch (err) {
      setPaymentStatus('failed');
      setPaymentError(err.message || 'Payment processing failed. Please try again.');
    }
  };

  if (!appointmentData) {
    return (
      <div className="confirmation-container error-state">
        <div className="step-container">
          <div className="confirmation-header">
            <div className="confirmation-icon error">
              <i className="fas fa-exclamation-circle"></i>
            </div>
            <h2>Appointment Not Found</h2>
          </div>
          <div className="confirmation-content">
            <p>We couldn't retrieve your appointment details. This might be because:</p>
            <ul className="error-reasons">
              <li>You refreshed the confirmation page</li>
              <li>The session expired</li>
              <li>There was an error processing your appointment</li>
            </ul>
            <div className="form-actions">
              <button onClick={() => navigate('/appointment')} className="submit-button">
                <i className="fas fa-calendar-plus"></i> Book New Appointment
              </button>
              <button onClick={() => navigate('/contact')} className="back-button">
                <i className="fas fa-headset"></i> Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { doctor, date, time, patient, id: appointmentId, confirmationCode } = appointmentData;
  const formattedDate = date ? format(parseISO(date), 'EEEE, MMMM d, yyyy') : 'N/A';

  return (
    <div className="confirmation-container">
      <div className="step-container">
        <div className="confirmation-header success">
          <div className="confirmation-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <h2>Appointment Scheduled!</h2>
          <p className="confirmation-subtitle">Please complete the payment to confirm your booking.</p>
        </div>

        <div className="confirmation-content">
          <div className="detail-section">
            <h3>
              <i className="fas fa-user-md"></i> Doctor Information
            </h3>
            <div className="doctor-info">
              <img
                src={doctor.image || '/doc1.png'}
                alt={`Profile of Dr. ${doctor.name}`}
                className="doctor-thumbnail"
                onError={(e) => (e.target.src = '/doc1.png')}
              />
              <div>
                <div className="detail-row">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{doctor.name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Specialization:</span>
                  <span className="detail-value">{doctor.specialization}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Hospital:</span>
                  <span className="detail-value">{doctor.hospital || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>
              <i className="fas fa-calendar-check"></i> Appointment Details
            </h3>
            <div className="detail-row">
              <span className="detail-label">Date:</span>
              <span className="detail-value">{formattedDate}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Time:</span>
              <span className="detail-value">{time || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Confirmation Code:</span>
              <span className="detail-value highlight">{confirmationCode || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Consultation Fee:</span>
              <span className="detail-value">₹{doctor.consultationFee || 'N/A'}</span>
            </div>
          </div>

          <div className="detail-section">
            <h3>
              <i className="fas fa-user"></i> Patient Information
            </h3>
            <div className="detail-row">
              <span className="detail-label">Name:</span>
              <span className="detail-value">{patient.name || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{patient.email || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Phone:</span>
              <span className="detail-value">{patient.phone || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Age/Gender:</span>
              <span className="detail-value">
                {patient.age ? `${patient.age} years` : 'N/A'} / {patient.gender || 'Not specified'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Symptoms:</span>
              <span className="detail-value">{patient.symptoms || 'N/A'}</span>
            </div>
            {patient.previousConditions && (
              <div className="detail-row">
                <span className="detail-label">Previous Conditions:</span>
                <span className="detail-value">{patient.previousConditions}</span>
              </div>
            )}
            {patient.medications && (
              <div className="detail-row">
                <span className="detail-label">Medications:</span>
                <span className="detail-value">{patient.medications}</span>
              </div>
            )}
          </div>

          <div className="payment-section">
            <h3>
              <i className="fas fa-credit-card"></i> Payment
            </h3>
            {paymentStatus === 'success' ? (
              <div className="payment-success">
                <i className="fas fa-check-circle"></i> Payment Successful!
                <p>Your appointment is now fully confirmed.</p>
              </div>
            ) : (
              <div className="payment-form">
                <div className={`form-group ${validationErrors.cardNumber ? 'error' : ''}`}>
                  <label>Card Number *</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={paymentDetails.cardNumber}
                    onChange={handlePaymentInputChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength="19" // 16 digits + 3 spaces
                  />
                  {validationErrors.cardNumber && (
                    <span className="error-message">{validationErrors.cardNumber}</span>
                  )}
                </div>
                <div className="form-row">
                  <div className={`form-group ${validationErrors.expiryDate ? 'error' : ''}`}>
                    <label>Expiry Date *</label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={paymentDetails.expiryDate}
                      onChange={handlePaymentInputChange}
                      placeholder="MM/YY"
                      maxLength="5"
                    />
                    {validationErrors.expiryDate && (
                      <span className="error-message">{validationErrors.expiryDate}</span>
                    )}
                  </div>
                  <div className={`form-group ${validationErrors.cvv ? 'error' : ''}`}>
                    <label>CVV *</label>
                    <input
                      type="text"
                      name="cvv"
                      value={paymentDetails.cvv}
                      onChange={handlePaymentInputChange}
                      placeholder="123"
                      maxLength="4"
                    />
                    {validationErrors.cvv && (
                      <span className="error-message">{validationErrors.cvv}</span>
                    )}
                  </div>
                </div>
                <div className={`form-group ${validationErrors.cardHolderName ? 'error' : ''}`}>
                  <label>Cardholder Name *</label>
                  <input
                    type="text"
                    name="cardHolderName"
                    value={paymentDetails.cardHolderName}
                    onChange={handlePaymentInputChange}
                    placeholder="John Doe"
                    maxLength="50"
                  />
                  {validationErrors.cardHolderName && (
                    <span className="error-message">{validationErrors.cardHolderName}</span>
                  )}
                </div>
                {paymentError && (
                  <div className="error-message">
                    {paymentError}
                  </div>
                )}
                <button
                  onClick={handlePaymentSubmit}
                  className="submit-button"
                  disabled={paymentStatus === 'processing'}
                >
                  {paymentStatus === 'processing' ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Processing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-credit-card"></i> Pay Now
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {paymentStatus === 'success' && (
            <div className="confirmation-actions">
              <button
                onClick={() => window.print()}
                className="submit-button"
              >
                <i className="fas fa-print"></i> Print Appointment
              </button>
              <button
                onClick={() => navigate('/')}
                className="back-button"
              >
                <i className="fas fa-home"></i> Back to Home
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentConfirmation;