import React, { useState, useEffect, useRef } from 'react';
import './AppointmentCard.css';

const AppointmentCard = ({ appointment, onUpdate, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState(appointment.date);
  const [newTime, setNewTime] = useState(appointment.time);
  const [status, setStatus] = useState(appointment.status || 'Pending');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const modalRef = useRef(null);
  const cardRef = useRef(null);

  // Status simulation effect
  useEffect(() => {
    let timer;
    if (status === 'Pending') {
      timer = setTimeout(() => {
        updateStatus('Confirmed');
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [status]);

  // Click outside handler for modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsRescheduling(false);
      }
    };

    if (isRescheduling) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isRescheduling]);

  const updateStatus = (newStatus) => {
    setStatus(newStatus);
    onUpdate({ ...appointment, status: newStatus });
  };

  const handleReschedule = () => {
    setIsRescheduling(true);
    setIsExpanded(false);
  };

  const confirmReschedule = () => {
    if (!newDate || !newTime) {
      alert('Please select both date and time');
      return;
    }
    
    const updatedAppointment = {
      ...appointment,
      date: newDate,
      time: newTime,
      status: 'Rescheduled',
      previousDate: appointment.date,
      previousTime: appointment.time
    };
    
    onUpdate(updatedAppointment);
    setIsRescheduling(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleCancel = () => {
    setShowConfirmation(true);
  };

  const confirmCancel = () => {
    setIsCancelled(true);
    onUpdate({ ...appointment, status: 'Cancelled' });
    setShowConfirmation(false);
    
    // Optional: Call delete API after delay for better UX
    setTimeout(() => {
      onDelete(appointment.id);
    }, 2000);
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  if (isCancelled) {
    return (
      <div className="appointment-card cancelled" ref={cardRef}>
        <div className="cancelled-content">
          <p>Appointment Cancelled</p>
          <button 
            className="undo-button"
            onClick={() => {
              setIsCancelled(false);
              onUpdate({ ...appointment, status: 'Confirmed' });
            }}
          >
            Undo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      className={`appointment-card ${status.toLowerCase()} ${isExpanded ? 'expanded' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-expanded={isExpanded}
    >
      <div className="card-header" onClick={toggleExpand}>
        <img
          src={appointment.image || '/doc1.png'}
          alt={`Dr. ${appointment.doctorName}`}
          className="doctor-image"
          loading="lazy"
        />
        <div className="header-content">
          <h3>{appointment.doctorName}</h3>
          <p className="speciality">{appointment.speciality}</p>
          <div className="status-indicator" data-status={status}>
            {status}
          </div>
        </div>
        <button className="expand-button">
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      <div className="card-details">
        <div className="detail-row">
          <span className="detail-label">Date:</span>
          <span className="detail-value">{formatDate(appointment.date)}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Time:</span>
          <span className="detail-value">{appointment.time}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Location:</span>
          <span className="detail-value">{appointment.location}</span>
        </div>

        {appointment.notes && (
          <div className="notes-section">
            <p className="notes-label">Notes:</p>
            <p className="notes-content">{appointment.notes}</p>
          </div>
        )}

        <div className="action-buttons">
          <button 
            onClick={handleReschedule} 
            className="action-button reschedule"
            aria-label="Reschedule appointment"
          >
            Reschedule
          </button>
          <button 
            onClick={handleCancel} 
            className="action-button cancel"
            aria-label="Cancel appointment"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Reschedule Modal */}
      {isRescheduling && (
        <div className="modal-overlay">
          <div className="modal-content" ref={modalRef}>
            <h3>Reschedule Appointment</h3>
            <p className="modal-subtitle">Current: {formatDate(appointment.date)} at {appointment.time}</p>
            
            <div className="form-group">
              <label htmlFor="reschedule-date">New Date:</label>
              <input
                id="reschedule-date"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="appointment-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="reschedule-time">New Time:</label>
              <input
                id="reschedule-time"
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="appointment-input"
              />
            </div>

            <div className="modal-actions">
              <button 
                onClick={confirmReschedule} 
                className="action-button confirm"
              >
                Confirm Changes
              </button>
              <button
                onClick={() => setIsRescheduling(false)}
                className="action-button secondary"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showConfirmation && (
        <div className="modal-overlay">
          <div className="confirmation-modal" ref={modalRef}>
            <h3>Confirm Cancellation</h3>
            <p>Are you sure you want to cancel your appointment with {appointment.doctorName}?</p>
            <div className="modal-actions">
              <button 
                onClick={confirmCancel} 
                className="action-button cancel"
              >
                Yes, Cancel
              </button>
              <button
                onClick={() => setShowConfirmation(false)}
                className="action-button secondary"
              >
                No, Keep It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {showSuccess && (
        <div className="notification success">
          Appointment rescheduled successfully!
        </div>
      )}
    </div>
  );
};

export default AppointmentCard;