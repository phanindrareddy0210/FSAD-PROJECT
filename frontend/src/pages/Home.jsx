import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useInView, useAnimation, useScroll, useTransform, AnimatePresence, color } from 'framer-motion';
import BackgroundVideo from '../components/BackgroundVideo';

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeAchievement, setActiveAchievement] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Refs for sections
  const aboutRef = useRef(null);
  const achievementsRef = useRef(null);
  const galleryRef = useRef(null);
  const heroRef = useRef(null);
  const containerRef = useRef(null);

  // Scroll animations
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Parallax effects
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.2], [1, 1, 0]);

  // Viewport detection
  const aboutInView = useInView(aboutRef, { once: true, margin: '-100px 0px' });
  const achievementsInView = useInView(achievementsRef, { once: true, margin: '-100px 0px' });
  const galleryInView = useInView(galleryRef, { once: true, margin: '-100px 0px' });

  // Animation controls
  const aboutAnimation = useAnimation();
  const achievementsAnimation = useAnimation();
  const galleryAnimation = useAnimation();
  const heroAnimation = useAnimation();

  // Loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Scroll progress tracking
  useEffect(() => {
    const updateScrollProgress = () => {
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      setScrollProgress((window.scrollY / totalHeight) * 100);
    };
    window.addEventListener('scroll', updateScrollProgress);
    return () => window.removeEventListener('scroll', updateScrollProgress);
  }, []);

  // Viewport animations
  useEffect(() => {
    if (aboutInView) {
      aboutAnimation.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
      });
    }
  }, [aboutInView, aboutAnimation]);

  useEffect(() => {
    if (achievementsInView) {
      achievementsAnimation.start('visible');
    }
  }, [achievementsInView, achievementsAnimation]);

  useEffect(() => {
    if (galleryInView) {
      galleryAnimation.start('visible');
    }
  }, [galleryInView, galleryAnimation]);

  // Hero animation sequence
  useEffect(() => {
    const sequence = async () => {
      await heroAnimation.start({ opacity: 1, transition: { duration: 0.8 } });
      await heroAnimation.start({
        y: 0,
        transition: { type: 'spring', damping: 10, stiffness: 100 },
      });
    };
    sequence();
  }, [heroAnimation]);

  // Dynamic data
  const achievements = [
    {
      id: 1,
      title: 'Seamless Appointment Booking',
      description: 'Over 50,000 appointments scheduled effortlessly in 2024, connecting patients with doctors instantly.',
      image: '/',
      stats: '50,000+ appointments',
      icon: '📅',
    },
    {
      id: 2,
      title: 'Prescription Management',
      description: 'Processed 100,000+ prescriptions, accessible anytime via our secure platform.',
      image: '/jam.jpg',
      stats: '100,000+ prescriptions',
      icon: '💊',
    },
    {
      id: 3,
      title: 'Secure User Authentication',
      description: 'ISO 27001 certified for robust data security, protecting patient and doctor profiles.',
      image: '/jam.jpg',
      stats: '100% data compliance',
      icon: '🔒',
    },
    {
      id: 4,
      title: 'Doctor Directory',
      description: 'Browse 10,000+ doctor profiles by specialty and location for informed care choices.',
      image: '/doctor-directory.png',
      stats: '10,000+ doctors',
      icon: '👨‍⚕️',
    },
    {
      id: 5,
      title: 'Razorpay Integration',
      description: 'Secure payments for appointments with 99.9% transaction success rate.',
      image: '/payment.png',
      stats: '99.9% success rate',
      icon: '💳',
    },
    {
      id: 6,
      title: 'User Dashboard',
      description: 'Personalized dashboards for 20,000+ patients to manage health records and appointments.',
      image: '/dashboard.png',
      stats: '20,000+ users',
      icon: '📊',
    },
  ];

  const services = [
    { title: 'Online Consultations', icon: '🩺', description: 'Connect with doctors via video calls.' },
    { title: 'Prescription Refills', icon: '💊', description: 'Request and manage prescriptions online.' },
    { title: 'Health Records', icon: '📋', description: 'Securely store and access medical history.' },
  ];

  const galleryItems = [
    { title: 'Patient Portal', description: 'Manage your health with ease.', image: '/patient.jpg' },
    { title: 'Doctor Profiles', description: 'Find the right specialist.', image: '/doc9.png' },
    { title: 'Appointment Booking', description: 'Schedule visits in seconds.', image: '/booking.jpg' },
  ];

  const testimonials = [
    {
      quote: 'MediCare made booking my appointments so easy and secure!',
      author: 'Jane Doe',
      title: 'Patient',
      avatar: '/pa.png',
    },
    {
      quote: 'The platform’s prescription management is a game-changer.',
      author: 'Dr. John Smith',
      title: 'Physician',
      avatar: '/doc1.png',
    },
  ];

  // Animation variants
  const achievementVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: (index) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', damping: 12, stiffness: 100, delay: index * 0.15 },
    }),
    hover: { y: -10, scale: 1.03, transition: { duration: 0.3 } },
  };

  const galleryVariants = {
    hidden: { opacity: 0, scale: 0.9, rotate: -2 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
    },
    hover: { scale: 1.05, zIndex: 10 },
  };

  // Handlers
  const handleAchievementClick = useCallback(
    (id) => {
      setActiveAchievement(achievements.find((item) => item.id === id));
    },
    [achievements]
  );

  const closeModal = useCallback(() => {
    setActiveAchievement(null);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* Hero Section */}
      <section ref={heroRef} className="video-container">
        <BackgroundVideo className="background-video" />
        <div className="video-overlay">
          <motion.div
            className="hero-section"
            initial={{ opacity: 0, y: 50 }}
            animate={heroAnimation}
          >
            <div className="hero-content">
              <h1 className="hero-title">
                Empowering <span>Healthcare</span> Access
              </h1>
              <p className="hero-subtitle">
                Book appointments, manage prescriptions, and connect with doctors seamlessly.
              </p>
              <div className="hero-buttons">
                <button className="cta-button primary">
                  Book Now <span className="icon">→</span>
                </button>
                <button className="cta-button secondary">
                  Learn More <span className="icon">→</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="main-content">
        {/* About Section */}
        <section ref={aboutRef} className="section about-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">About MediCare</h2>
              <p className="section-subtitle">
                Transforming healthcare with innovative technology and patient-centered care.
              </p>
            </div>
            <motion.div
              className="about-grid grid md:grid-cols-2 gap-8"
              initial={{ opacity: 0, y: 50 }}
              animate={aboutAnimation}
            >
              <div className="about-content">
                <p>
                  MediCare connects patients with healthcare providers through a secure, user-friendly platform.
                </p>
                <p>
                  Our mission is to make healthcare accessible, efficient, and personalized for everyone.
                </p>
                <div className="stats-container grid grid-cols-2 gap-4">
                  <div className="stat-item">
                    <div className="stat-number">50K+ <span className="icon">📅</span></div>
                    <div className="stat-label">Appointments</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">10K+ <span className="icon">👨‍⚕️</span></div>
                    <div className="stat-label">Doctors</div>
                  </div>
                </div>
              </div>
              <div className="about-image">
                <img src="/plat1.jpg" alt="Platform" className="platform-image" />
                <img src="/pla4.jpg" alt="Platform" className="platform-image" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Services Section */}
        <section className="section services-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Our Services</h2>
              <p className="section-subtitle">Comprehensive healthcare solutions at your fingertips.</p>
            </div>
            <div className="services-grid grid grid-cols-1 md:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <div key={index} className="service-card">
                  <div className="service-icon-container">{service.icon}</div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <button className="service-learn-more">
                    Learn More <span className="icon">→</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Achievements Section */}
        <section ref={achievementsRef} className="section achievements-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Our Achievements</h2>
              <p className="section-subtitle">Milestones in revolutionizing healthcare delivery.</p>
            </div>
            <div className="achievements-grid grid grid-cols-1 md:grid-cols-3 gap-8">
              {achievements.map((item, index) => (
                <motion.div
                  key={item.id}
                  className="achievement-card"
                  custom={index}
                  initial="hidden"
                  animate={achievementsAnimation}
                  variants={achievementVariants}
                  whileHover="hover"
                  onClick={() => handleAchievementClick(item.id)}
                >
                  <div className="achievement-icon-container">{item.icon}</div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <div className="achievement-stats">{item.stats}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section ref={galleryRef} className="section gallery-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Explore MediCare</h2>
              <p className="section-subtitle">Discover our platform’s powerful features.</p>
            </div>
            <div className="gallery-grid grid grid-cols-1 md:grid-cols-3 gap-6">
              {galleryItems.map((item, index) => (
                <motion.div
                  key={index}
                  className="gallery-item"
                  initial="hidden"
                  animate={galleryAnimation}
                  variants={galleryVariants}
                  whileHover="hover"
                >
                  <img src={item.image} alt={item.title} className="gallery-image" />
                  <div className="gallery-overlay">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="section testimonials-section section--dark">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">What Our Users Say</h2>
              <p className="section-subtitle">Hear from patients and doctors who trust MediCare.</p>
            </div>
            <div className="testimonial-slider flex flex-col md:flex-row gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="testimonial-card">
                  <div className="testimonial-quote">{testimonial.quote}</div>
                  <div className="testimonial-author">
                    <img src={testimonial.avatar} alt={testimonial.author} className="testimonial-avatar" />
                    <div className="testimonial-author-info">
                      <div className="testimonial-author-name">{testimonial.author}</div>
                      <div className="testimonial-author-title">{testimonial.title}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="section contact-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Get in Touch</h2>
              <p className="section-subtitle">We’re here to assist you with your healthcare needs.</p>
            </div>
            <div className="contact-container grid md:grid-cols-2 gap-8">
              <div className="contact-info">
                <div className="contact-method">
                  <span className="contact-icon">📧</span>
                  <div className="contact-details">
                    <h3>Email</h3>
                    <a href="mailto:support@medicare.com">support@medicare.com</a>
                  </div>
                </div>
                <div className="contact-method">
                  <span className="contact-icon">📞</span>
                  <div className="contact-details">
                    <h3>Phone</h3>
                    <p>+1 (800) 123-4567</p>
                  </div>
                </div>
              </div>
              <form className="contact-form">
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Name</label>
                  <input type="text" id="name" className="form-control" required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="email">Email</label>
                  <input type="email" id="email" className="form-control" required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="message">Message</label>
                  <textarea id="message" className="form-control" required></textarea>
                </div>
                <button type="submit" className="submit-button">
                  Send Message <span className="icon">→</span>
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="main-footer">
        <div className="footer-content">
          <div className="footer-column footer-about">
            <img src="/logo-png.png" alt="MediCare Logo" className="footer-logo" />
            <p>MediCare is dedicated to making healthcare accessible and efficient for all.</p>
            <div className="footer-social">
              <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
              <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
              <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
            </div>
          </div>
          <div className="footer-column footer-links">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="#">Home</a></li>
              <li><a href="#">Services</a></li>
              <li><a href="#">About</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
          <div className="footer-column footer-newsletter">
            <h3>Newsletter</h3>
            <p style={{ color: '#b5f5ec' }}>Discover expert healthcare insights and updates tailored for you.</p>
            <form>
              <input type="email" placeholder="Your Email" required />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 MediCare. All rights reserved.</p>
        </div>
      </footer>

      {/* Back to Top Button */}
      <button className="back-to-top" aria-label="Back to top">
        <i className="fas fa-chevron-up"></i>
      </button>

      {/* Modal for Achievements */}
      <AnimatePresence>
        {activeAchievement && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[var(--z-index-modal)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[var(--white)] p-[var(--spacing-xxl)] rounded-[var(--border-radius)] max-w-lg"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h3 className="text-[var(--font-size-xl)] mb-[var(--spacing-base)]">{activeAchievement.title}</h3>
              <img src={activeAchievement.image} alt={activeAchievement.title} className="w-full rounded-[var(--border-radius)] mb-[var(--spacing-base)]" />
              <p className="mb-[var(--spacing-base)]">{activeAchievement.description}</p>
              <div className="text-[var(--secondary)] font-medium">{activeAchievement.stats}</div>
              <button
                className="cta-button outline mt-[var(--spacing-lg)]"
                onClick={closeModal}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;