import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/QuizListing.css";

function QuizListing() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/quizzes")
      .then((r) => setQuizzes(r.data))
      .catch((err) => {
        console.error("Error fetching quizzes:", err);
        setError("Failed to load quizzes. Please try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading quizzes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>⚠️ Oops!</h2>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-listing-container">
      <div className="header-section">
        <h1>Quiz Platform</h1>
        <p className="subtitle">Challenge yourself with our collection of quizzes</p>
        <div className="accent-line"></div>
      </div>

      <div className="stats-section">
        <div className="stat-card">
          <span className="stat-number">{quizzes.length}</span>
          <span className="stat-label">Total Quizzes</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{quizzes.reduce((sum, q) => sum + q.questionCount, 0)}</span>
          <span className="stat-label">Questions</span>
        </div>
      </div>

      <div className="quizzes-grid">
        {quizzes.map((q, index) => (
          <div
            key={q.id}
            className="quiz-card"
            style={{
              animation: `slideInUp 0.6s ease-out ${index * 0.1}s both`,
            }}
          >
            <div className="quiz-card-header">
              <div className="quiz-icon">📚</div>
              <h2>{q.title}</h2>
            </div>

            <p className="quiz-description">{q.description}</p>

            <div className="quiz-meta">
              <div className="meta-item">
                <span className="meta-icon">⏱️</span>
                <span>{q.duration} min</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">❓</span>
                <span>{q.questionCount} Q</span>
              </div>
            </div>

            <div className="difficulty-indicator">
              <div
                className="difficulty-bar"
                style={{
                  width: `${(q.questionCount / 4) * 100}%`,
                }}
              ></div>
            </div>

            <button
              className="btn btn-primary quiz-btn"
              onClick={() => navigate(`/quiz/${q.id}`)}
            >
              <span>Start Quiz</span>
              <span className="arrow">→</span>
            </button>
          </div>
        ))}
      </div>

      <div className="motivational-section">
        <p>✨ Select a quiz to begin your learning journey!</p>
      </div>
    </div>
  );
}

export default QuizListing;