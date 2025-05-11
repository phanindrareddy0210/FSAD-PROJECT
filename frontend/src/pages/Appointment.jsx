import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays, isBefore } from 'date-fns';
import '../styles/appointment.css';

// Mock API service (replace with actual API calls)
const apiService = {
  fetchDoctors: async () => {
    return new Promise(resolve => setTimeout(() => resolve({
      data: [
        {
          id: 1,
          name: 'Dr. Smith',
          specialization: 'Cardiologist',
          experience: '10 years',
          image: '/doc1.png',
          rating: 4.8,
          availableDays: [1, 3, 5],
          consultationFee: 1500,
          languages: ['English', 'Spanish'],
          hospital: 'City Medical Center'
        },
        {
          id: 2,
          name: 'Dr. Johnson',
          specialization: 'Dermatologist',
          experience: '8 years',
          image: '/doc2.png',
          rating: 4.6,
          availableDays: [2, 4, 6],
          consultationFee: 1200,
          languages: ['English', 'French'],
          hospital: 'Metro Skin Clinic'
        },
        {
          id: 3,
          name: 'Dr. Patel',
          specialization: 'Neurologist',
          experience: '12 years',
          image: '/doc3.png',
          rating: 4.9,
          availableDays: [1, 4, 5],
          consultationFee: 1800,
          languages: ['English', 'Hindi'],
          hospital: 'NeuroCare Hospital'
        },
        {
          id: 4,
          name: 'Dr. Lee',
          specialization: 'Pediatrician',
          experience: '7 years',
          image: '/doc4.png',
          rating: 4.7,
          availableDays: [2, 3, 5],
          consultationFee: 1000,
          languages: ['English', 'Mandarin'],
          hospital: 'Kids Health Center'
        },
        {
          id: 5,
          name: 'Dr. Garcia',
          specialization: 'Orthopedic Surgeon',
          experience: '15 years',
          image: '/doc5.png',
          rating: 4.8,
          availableDays: [1, 2, 4],
          consultationFee: 2000,
          languages: ['English', 'Spanish'],
          hospital: 'Bone & Joint Institute'
        },
        {
          id: 6,
          name: 'Dr. Sharma',
          specialization: 'Endocrinologist',
          experience: '9 years',
          image: '/doc6.png',
          rating: 4.5,
          availableDays: [3, 4, 6],
          consultationFee: 1400,
          languages: ['English', 'Hindi'],
          hospital: 'Metro Endocrine Clinic'
        },
        {
          id: 7,
          name: 'Dr. Nguyen',
          specialization: 'Ophthalmologist',
          experience: '11 years',
          image: '/doc7.png',
          rating: 4.7,
          availableDays: [2, 5, 6],
          consultationFee: 1600,
          languages: ['English', 'Vietnamese'],
          hospital: 'Vision Care Center'
        },
        {
          id: 8,
          name: 'Dr. Brown',
          specialization: 'Psychiatrist',
          experience: '13 years',
          image: '/doc8.png',
          rating: 4.6,
          availableDays: [1, 3, 4],
          consultationFee: 1700,
          languages: ['English'],
          hospital: 'MindWell Clinic'
        }
      ]
    }), 500));
  },

  fetchTimeSlots: async (doctorId, date) => {
    return new Promise(resolve => setTimeout(() => resolve({
      data: [
        '09:00 AM', '10:00 AM', '11:00 AM', 
        '02:00 PM', '03:00 PM', '04:00 PM'
      ]
    }), 500));
  },

  bookAppointment: async (appointmentData) => {
    return new Promise(resolve => setTimeout(() => resolve({
      data: {
        ...appointmentData,
        id: Math.floor(Math.random() * 10000),
        confirmationCode: `APP-${Math.random().toString(36).substr(2, 8).toUpperCase()}`
      }
    }), 1000));
  }
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Appointment = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [prescriptionDetails, setPrescriptionDetails] = useState({
    hasPrescription: 'no',
    prescriptionDetails: ''
  });
  const [patientDetails, setPatientDetails] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    symptoms: '',
    previousConditions: '',
    medications: ''
  });
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [loading, setLoading] = useState({ doctors: false, slots: false, booking: false });
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [user, setUser] = useState(null);

  // Check authentication and pre-fill patient details
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role.toLowerCase() !== "patient") {
        navigate("/signin", { replace: true });
      } else {
        setUser(parsedUser);
        setPatientDetails(prev => ({
          ...prev,
          name: parsedUser.username || '',
          email: parsedUser.email || '',
          phone: parsedUser.phone || '',
        }));
      }
    } else {
      navigate("/signin", { replace: true });
    }
  }, [navigate]);

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, doctors: true }));
      setError('');
      const response = await apiService.fetchDoctors();
      setDoctors(response.data);
    } catch (err) {
      setError('Failed to fetch doctors. Please try again later.');
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(prev => ({ ...prev, doctors: false }));
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  useEffect(() => {
    if (selectedDoctor) {
      const dates = [];
      const today = new Date();
      for (let i = 0; i < 14; i++) {
        const date = addDays(today, i);
        if (selectedDoctor.availableDays.includes(date.getDay())) {
          dates.push(date);
        }
      }
      setAvailableDates(dates);
    }
  }, [selectedDoctor]);

  const fetchTimeSlots = useCallback(async () => {
    if (!selectedDoctor || !selectedDate) return;
    try {
      setLoading(prev => ({ ...prev, slots: true }));
      setError('');
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const response = await apiService.fetchTimeSlots(selectedDoctor.id, formattedDate);
      setAvailableSlots(response.data);
    } catch (err) {
      setError('Failed to fetch available time slots. Please try again.');
      console.error('Error fetching time slots:', err);
    } finally {
      setLoading(prev => ({ ...prev, slots: false }));
    }
  }, [selectedDoctor, selectedDate]);

  useEffect(() => {
    fetchTimeSlots();
  }, [fetchTimeSlots]);

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = !specializationFilter || 
                                 doctor.specialization === specializationFilter;
    return matchesSearch && matchesSpecialization;
  });

  const specializations = [...new Set(doctors.map(doctor => doctor.specialization))];

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setStep(2);
    setError('');
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setStep(3);
    setError('');
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setStep(4);
    setError('');
  };

  const handlePrescriptionInputChange = (e) => {
    const { name, value } = e.target;
    setPrescriptionDetails(prev => ({
      ...prev,
      [name]: value
    }));
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePatientInputChange = (e) => {
    const { name, value } = e.target;
    setPatientDetails(prev => ({
      ...prev,
      [name]: value
    }));
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validatePrescriptionForm = () => {
    const errors = {};
    if (prescriptionDetails.hasPrescription === 'yes' && !prescriptionDetails.prescriptionDetails.trim()) {
      errors.prescriptionDetails = 'Prescription details are required if you have a prescription';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePatientForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!patientDetails.name.trim()) errors.name = 'Name is required';
    if (!emailRegex.test(patientDetails.email)) errors.email = 'Valid email is required';
    if (!phoneRegex.test(patientDetails.phone)) errors.phone = 'Valid phone number is required';
    if (!patientDetails.age || patientDetails.age < 1 || patientDetails.age > 120) errors.age = 'Valid age is required';
    if (!patientDetails.gender) errors.gender = 'Gender is required';
    if (!patientDetails.symptoms.trim()) errors.symptoms = 'Symptoms description is required';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePrescriptionSubmit = (e) => {
    e.preventDefault();
    if (!validatePrescriptionForm()) return;
    setStep(5);
    setError('');
  };

  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted, validating...');
    if (!validatePatientForm()) {
      console.log('Validation failed:', validationErrors);
      return;
    }
    try {
      console.log('Setting loading state...');
      setLoading(prev => ({ ...prev, booking: true }));
      const appointmentData = {
        doctor: {
          id: selectedDoctor.id,
          name: selectedDoctor.name,
          specialization: selectedDoctor.specialization,
          hospital: selectedDoctor.hospital,
          image: selectedDoctor.image,
          consultationFee: selectedDoctor.consultationFee
        },
        date: selectedDate.toISOString(),
        time: selectedTime,
        patient: {
          name: patientDetails.name,
          email: patientDetails.email,
          phone: patientDetails.phone,
          age: patientDetails.age,
          gender: patientDetails.gender,
          symptoms: patientDetails.symptoms,
          previousConditions: patientDetails.previousConditions,
          medications: patientDetails.medications,
          hasPrescription: prescriptionDetails.hasPrescription,
          prescriptionDetails: prescriptionDetails.prescriptionDetails
        },
        createdAt: new Date().toISOString()
      };
      console.log('Appointment data:', appointmentData);
      const response = await apiService.bookAppointment(appointmentData);
      console.log('API response:', response);

      // Retrieve existing appointments from localStorage, or initialize an empty array
      const existingAppointments = JSON.parse(localStorage.getItem('appointments')) || [];
      // Append the new appointment to the array
      const updatedAppointments = [...existingAppointments, response.data];
      // Store the updated appointments array back in localStorage
      localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
      // Also store the latest appointment for AppointmentConfirmation.jsx
      localStorage.setItem('appointmentData', JSON.stringify(response.data));
      
      console.log('Navigating to /appointment/confirmation with state:', response.data);
      navigate('/appointment/confirmation', { state: response.data });
    } catch (err) {
      console.error('Error booking appointment:', err);
      setError('Failed to book appointment. Please try again.');
    } finally {
      console.log('Resetting loading state...');
      setLoading(prev => ({ ...prev, booking: false }));
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="step-container">
            <h2>Select a Doctor</h2>
            <div className="filters">
              <input
                type="text"
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <select
                value={specializationFilter}
                onChange={(e) => setSpecializationFilter(e.target.value)}
                className="specialization-filter"
              >
                <option value="">All Specializations</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
            {loading.doctors ? (
              <div className="loading-spinner">Loading doctors...</div>
            ) : error ? (
              <div className="error-message">
                {error}
                <button onClick={fetchDoctors} className="retry-button">Retry</button>
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="no-results">No doctors found matching your criteria</div>
            ) : (
              <div className="doctors-grid">
                {filteredDoctors.map(doctor => (
                  <div 
                    key={doctor.id} 
                    className={`doctor-card ${selectedDoctor?.id === doctor.id ? 'selected' : ''}`}
                    onClick={() => handleDoctorSelect(doctor)}
                  >
                    <div className="doctor-image-container">
                      <img 
                        src={doctor.image} 
                        alt={`Profile of Dr. ${doctor.name}`}
                        className="doctor-image" 
                        loading="lazy"
                        onError={(e) => (e.target.src = '/doc1.png')}
                      />
                      <div className="doctor-badge">⭐ {doctor.rating}</div>
                    </div>
                    <div className="doctor-details">
                      <h3>{doctor.name}</h3>
                      <p className="specialization">{doctor.specialization}</p>
                      <p className="experience">{doctor.experience} experience</p>
                      <p className="hospital">{doctor.hospital}</p>
                      <div className="languages">
                        {doctor.languages.map(lang => (
                          <span key={lang} className="language-tag">{lang}</span>
                        ))}
                      </div>
                      <div className="fee">Consultation Fee: ₹{doctor.consultationFee}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div className="step-container">
            <div className="doctor-selection-info">
              <h2>Select a Date</h2>
              <div className="selected-doctor">
                <img 
                  src={selectedDoctor.image} 
                  alt={`Profile of Dr. ${selectedDoctor.name}`} 
                  className="doctor-thumbnail" 
                  loading="lazy"
                  onError={(e) => (e.target.src = '/doc1.png')}
                />
                <div>
                  <h3>{selectedDoctor.name}</h3>
                  <p>{selectedDoctor.specialization}</p>
                </div>
              </div>
            </div>
            <div className="calendar-container">
              {availableDates.map((date, index) => {
                const isPastDate = isBefore(date, new Date());
                const dayName = DAY_NAMES[date.getDay()];
                return (
                  <button
                    key={index}
                    className={`date-button ${isPastDate ? 'disabled' : ''} ${selectedDate && date.toDateString() === selectedDate.toDateString() ? 'selected' : ''}`}
                    onClick={() => !isPastDate && handleDateSelect(date)}
                    disabled={isPastDate}
                  >
                    <div className="day-name">{dayName}</div>
                    <div className="date-number">{format(date, 'd')}</div>
                    <div className="month">{format(date, 'MMM')}</div>
                    {isPastDate && <div className="past-label">Past</div>}
                  </button>
                );
              })}
            </div>
            <div className="navigation-buttons">
              <button className="back-button" onClick={() => setStep(1)}>
                <i className="fas fa-arrow-left"></i> Back
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="step-container">
            <div className="appointment-info">
              <h2>Select a Time Slot</h2>
              <div className="selected-details">
                <div className="selected-doctor">
                  <img 
                    src={selectedDoctor.image} 
                    alt={`Profile of Dr. ${selectedDoctor.name}`} 
                    className="doctor-thumbnail" 
                    loading="lazy"
                    onError={(e) => (e.target.src = '/doc1.png')}
                  />
                  <div>
                    <h3>{selectedDoctor.name}</h3>
                    <p>{selectedDoctor.specialization}</p>
                  </div>
                </div>
                <div className="selected-date">
                  <i className="far fa-calendar-alt"></i>
                  {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </div>
              </div>
            </div>
            {loading.slots ? (
              <div className="loading-spinner">Loading available time slots...</div>
            ) : error ? (
              <div className="error-message">
                {error}
                <button onClick={fetchTimeSlots} className="retry-button">Retry</button>
              </div>
            ) : (
              <div className="time-slots-container">
                <h3>Available Time Slots</h3>
                <div className="time-slots">
                  {availableSlots.map((slot, index) => (
                    <button
                      key={index}
                      className={`time-slot ${selectedTime === slot ? 'selected' : ''}`}
                      onClick={() => handleTimeSelect(slot)}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="navigation-buttons">
              <button className="back-button" onClick={() => setStep(2)}>
                <i className="fas fa-arrow-left"></i> Back
              </button>
              {selectedTime && (
                <button className="next-button" onClick={() => setStep(4)}>
                  Next <i className="fas fa-arrow-right"></i>
                </button>
              )}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="step-container">
            <div className="appointment-summary">
              <h2>Prescription Details</h2>
              <div className="summary-card">
                <div className="doctor-info">
                  <img 
                    src={selectedDoctor.image} 
                    alt={`Profile of Dr. ${selectedDoctor.name}`} 
                    loading="lazy"
                    onError={(e) => (e.target.src = '/doc1.png')}
                  />
                  <div>
                    <h3>{selectedDoctor.name}</h3>
                    <p>{selectedDoctor.specialization}</p>
                  </div>
                </div>
                <div className="appointment-time">
                  <div>
                    <i className="far fa-calendar-alt"></i>
                    <span>{selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                  <div>
                    <i className="far fa-clock"></i>
                    <span>{selectedTime}</span>
                  </div>
                </div>
              </div>
            </div>
            <form onSubmit={handlePrescriptionSubmit} className="prescription-form">
              <div className="form-section">
                <h3>Prescription Information</h3>
                <div className="form-group">
                  <label>Do you have a prescription?</label>
                  <select
                    name="hasPrescription"
                    value={prescriptionDetails.hasPrescription}
                    onChange={handlePrescriptionInputChange}
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
                {prescriptionDetails.hasPrescription === 'yes' && (
                  <div className={`form-group ${validationErrors.prescriptionDetails ? 'error' : ''}`}>
                    <label>Prescription Details *</label>
                    <textarea
                      name="prescriptionDetails"
                      value={prescriptionDetails.prescriptionDetails}
                      onChange={handlePrescriptionInputChange}
                      placeholder="Enter prescription details (e.g., medications prescribed, dosage, doctor's name)"
                      rows="4"
                    />
                    {validationErrors.prescriptionDetails && (
                      <span className="error-message">{validationErrors.prescriptionDetails}</span>
                    )}
                  </div>
                )}
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="back-button"
                  onClick={() => setStep(3)}
                >
                  <i className="fas fa-arrow-left"></i> Back
                </button>
                <button
                  type="submit"
                  className="next-button"
                >
                  Next <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </form>
          </div>
        );
      case 5:
        return (
          <div className="step-container">
            <div className="appointment-summary">
              <h2>Enter Your Details</h2>
              <div className="summary-card">
                <div className="doctor-info">
                  <img 
                    src={selectedDoctor.image} 
                    alt={`Profile of Dr. ${selectedDoctor.name}`} 
                    loading="lazy"
                    onError={(e) => (e.target.src = '/doc1.png')}
                  />
                  <div>
                    <h3>{selectedDoctor.name}</h3>
                    <p>{selectedDoctor.specialization}</p>
                  </div>
                </div>
                <div className="appointment-time">
                  <div>
                    <i className="far fa-calendar-alt"></i>
                    <span>{selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                  <div>
                    <i className="far fa-clock"></i>
                    <span>{selectedTime}</span>
                  </div>
                </div>
              </div>
            </div>
            <form onSubmit={handlePatientSubmit} className="patient-form">
              <div className="form-section">
                <h3>Personal Information</h3>
                <div className="form-row">
                  <div className={`form-group ${validationErrors.name ? 'error' : ''}`}>
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={patientDetails.name}
                      onChange={handlePatientInputChange}
                      placeholder="Enter your full name"
                    />
                    {validationErrors.name && <span className="error-message">{validationErrors.name}</span>}
                  </div>
                  <div className={`form-group ${validationErrors.email ? 'error' : ''}`}>
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={patientDetails.email}
                      onChange={handlePatientInputChange}
                      placeholder="Enter your email"
                    />
                    {validationErrors.email && <span className="error-message">{validationErrors.email}</span>}
                  </div>
                </div>
                <div className="form-row">
                  <div className={`form-group ${validationErrors.phone ? 'error' : ''}`}>
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={patientDetails.phone}
                      onChange={handlePatientInputChange}
                      placeholder="Enter your phone number"
                    />
                    {validationErrors.phone && <span className="error-message">{validationErrors.phone}</span>}
                  </div>
                  <div className={`form-group ${validationErrors.age ? 'error' : ''}`}>
                    <label>Age *</label>
                    <input
                      type="number"
                      name="age"
                      value={patientDetails.age}
                      onChange={handlePatientInputChange}
                      placeholder="Enter your age"
                      min="1"
                      max="120"
                    />
                    {validationErrors.age && <span className="error-message">{validationErrors.age}</span>}
                  </div>
                  <div className={`form-group ${validationErrors.gender ? 'error' : ''}`}>
                    <label>Gender *</label>
                    <select
                      name="gender"
                      value={patientDetails.gender}
                      onChange={handlePatientInputChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                    {validationErrors.gender && <span className="error-message">{validationErrors.gender}</span>}
                  </div>
                </div>
              </div>
              <div className="form-section">
                <h3>Medical Information</h3>
                <div className={`form-group ${validationErrors.symptoms ? 'error' : ''}`}>
                  <label>Symptoms/Reason for Visit *</label>
                  <textarea
                    name="symptoms"
                    value={patientDetails.symptoms}
                    onChange={handlePatientInputChange}
                    placeholder="Describe your symptoms or reason for visit"
                    rows="4"
                  />
                  {validationErrors.symptoms && <span className="error-message">{validationErrors.symptoms}</span>}
                </div>
                <div className="form-group">
                  <label>Previous Medical Conditions (if any)</label>
                  <textarea
                    name="previousConditions"
                    value={patientDetails.previousConditions}
                    onChange={handlePatientInputChange}
                    placeholder="List any previous medical conditions"
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label>Current Medications (if any)</label>
                  <textarea
                    name="medications"
                    value={patientDetails.medications}
                    onChange={handlePatientInputChange}
                    placeholder="List any current medications"
                    rows="3"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="back-button"
                  onClick={() => setStep(4)}
                  disabled={loading.booking}
                >
                  <i className="fas fa-arrow-left"></i> Back
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={loading.booking}
                >
                  {loading.booking ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Booking...
                    </>
                  ) : (
                    'Confirm Appointment'
                  )}
                </button>
              </div>
            </form>
          </div>
        );
      default:
        return null;
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="appointment-container">
      <div className="appointment-header">
        <h1>Book an Appointment</h1>
        <div className="progress-tracker">
          <div className="progress-bar">
            <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-label">Select Doctor</div>
            </div>
            <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-label">Select Date</div>
            </div>
            <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <div className="step-label">Select Time</div>
            </div>
            <div className={`progress-step ${step >= 4 ? 'active' : ''}`}>
              <div className="step-number">4</div>
              <div className="step-label">Prescription</div>
            </div>
            <div className={`progress-step ${step >= 5 ? 'active' : ''}`}>
              <div className="step-number">5</div>
              <div className="step-label">Your Details</div>
            </div>
          </div>
        </div>
      </div>
      {error && !loading.doctors && !loading.slots && !loading.booking && (
        <div className="global-error-message">
          {error}
        </div>
      )}
      {renderStep()}
    </div>
  );
};

export default Appointment;