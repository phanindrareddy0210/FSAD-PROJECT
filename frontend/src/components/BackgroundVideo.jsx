// src/components/BackgroundVideo.jsx
import "./../styles/home.css";

const BackgroundVideo = () => {
  return (
    <div className="video-container">
      <video autoPlay loop muted className="background-video">
        <source src="/demo.mp4" type="video/mp4" />
      </video>
      <div className="overlay-text">
        <h1 className="overlay-title">Empowering Your Digital Journey</h1>
        <p className="overlay-subtitle">
          Discover innovative solutions tailored to your needs.
        </p>
        <button className="explore-button">Explore Services</button>
      </div>
    </div>
  );
};

export default BackgroundVideo;