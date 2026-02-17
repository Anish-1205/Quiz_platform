import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/ResultPage.css";

function ResultPage({ attemptId }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/quizzes/attempt/${attemptId}/result`)
      .then((r) => setResult(r.data))
      .catch((err) => {
        console.error("Error fetching results:", err);
        alert("Failed to load results. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading || !result) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your results...</p>
      </div>
    );
  }

  const getGrade = (score) => {
    if (score >= 90) return { grade: "A+", emoji: "🌟", color: "excellent" };
    if (score >= 80) return { grade: "A", emoji: "⭐", color: "great" };
    if (score >= 70) return { grade: "B", emoji: "👏", color: "good" };
    if (score >= 60) return { grade: "C", emoji: "✓", color: "okay" };
    return { grade: "D", emoji: "💪", color: "poor" };
  };

  const gradeInfo = getGrade(result.score);
  const accuracy = result.totalQuestions > 0 
    ? Math.round((result.correctAnswers / result.totalQuestions) * 100) 
    : 0;

  return (
    <div className="result-page-container">
      {/* Confetti effect for high scores */}
      {result.score >= 80 && (
        <div className="confetti">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="confetti-piece"></div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="results-wrapper">
        {/* Header Section */}
        <div className="results-header">
          <h1 className="results-title">Quiz Complete!</h1>
          <p className="results-subtitle">Here's how you performed:</p>
        </div>

        {/* Grade Section - Center Focused */}
        <div className={`grade-section ${gradeInfo.color}`}>
          <div className="grade-circle">
            <span className="grade-emoji">{gradeInfo.emoji}</span>
            <span className="grade-label">{gradeInfo.grade}</span>
            <span className="grade-score">{result.score}%</span>
          </div>

          <div className="grade-message">
            {result.score >= 90
              ? "Outstanding! You've mastered this quiz! 🎉"
              : result.score >= 80
              ? "Excellent work! You're doing great!"
              : result.score >= 70
              ? "Good job! Keep practicing to improve."
              : "Keep learning! Every attempt helps you grow."}
          </div>
        </div>

        {/* Stats Section */}
        <div className="stats-section">
          <div className="stat-card correct">
            <div className="stat-icon">✓</div>
            <div className="stat-info">
              <div className="stat-value">{result.correctAnswers}</div>
              <div className="stat-label">Correct Answers</div>
            </div>
          </div>

          <div className="stat-card incorrect">
            <div className="stat-icon">✗</div>
            <div className="stat-info">
              <div className="stat-value">{result.incorrectAnswers}</div>
              <div className="stat-label">Incorrect Answers</div>
            </div>
          </div>

          <div className="stat-card accuracy">
            <div className="stat-icon">🎯</div>
            <div className="stat-info">
              <div className="stat-value">{accuracy}%</div>
              <div className="stat-label">Accuracy Rate</div>
            </div>
          </div>

          <div className="stat-card total">
            <div className="stat-icon">📝</div>
            <div className="stat-info">
              <div className="stat-value">{result.totalQuestions}</div>
              <div className="stat-label">Total Questions</div>
            </div>
          </div>
        </div>

        {/* Progress Visualization */}
        <div className="progress-visualization">
          <div className="progress-item">
            <div className="progress-label">Your Performance</div>
            <div className="progress-bar-large">
              <div
                className="progress-fill"
                style={{ width: `${result.score}%` }}
              ></div>
            </div>
            <div className="progress-text">{result.score}% Complete</div>
          </div>
        </div>

        {/* Detailed Results Section */}
        {result.details && result.details.length > 0 && (
          <div className="detailed-section">
            <h2 className="section-title">Detailed Feedback</h2>
            
            <div className="results-list">
              {result.details.map((detail, index) => (
                <div
                  key={index}
                  className={`result-item ${detail.isCorrect ? "correct" : "incorrect"}`}
                >
                  <div className="result-number">Q{index + 1}</div>

                  <div className="result-details">
                    <div className="result-question">
                      {detail.questionText}
                    </div>

                    <div className="result-answer-section">
                      <div className={`answer-box ${detail.isCorrect ? "correct-answer" : "user-answer"}`}>
                        <span className="answer-label">
                          {detail.isCorrect ? "Your Answer ✓" : "Your Answer"}
                        </span>
                        <span className="answer-text">{detail.userAnswer}</span>
                      </div>

                      {!detail.isCorrect && (
                        <div className="answer-box correct-answer">
                          <span className="answer-label">Correct Answer</span>
                          <span className="answer-text">{detail.correctAnswer}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={`result-icon ${detail.isCorrect ? "correct" : "incorrect"}`}>
                    {detail.isCorrect ? "✓" : "✗"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="btn btn-secondary" onClick={() => navigate("/")}>
            ← Back to Quizzes
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              navigate("/");
              setTimeout(() => window.location.reload(), 100);
            }}
          >
            Retake Quiz →
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResultPage;