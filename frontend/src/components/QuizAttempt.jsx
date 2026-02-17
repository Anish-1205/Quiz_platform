import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/QuizAttempt.css";

function QuizAttempt({ quizId }) {
  const [quiz, setQuiz] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [idx, setIdx] = useState(0);
  const [ans, setAns] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set());
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const uid = "user_" + Date.now();

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching quiz:", quizId);
        const quizRes = await axios.get(`http://localhost:8080/api/quizzes/${quizId}`);
        console.log("Quiz data:", quizRes.data);
        setQuiz(quizRes.data);

        const attemptRes = await axios.post(
          `http://localhost:8080/api/quizzes/${quizId}/attempt/start`,
          {},
          { params: { userId: uid } }
        );
        console.log("Attempt created:", attemptRes.data);
        setAttemptId(attemptRes.data.attemptId);
      } catch (err) {
        console.error("Error:", err);
        setError("Failed to start quiz. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [quizId, navigate]);

  const submit = async () => {
    if (!ans[quiz.questions[idx].id]) {
      alert("Please select an answer");
      return;
    }

    try {
      setSubmitted(true);

      await axios.post(
        `http://localhost:8080/api/quizzes/attempt/${attemptId}/response`,
        {
          questionId: quiz.questions[idx].id,
          selectedOptionId: ans[quiz.questions[idx].id],
        }
      );

      const newAnswered = new Set(answeredQuestions);
      newAnswered.add(quiz.questions[idx].id);
      setAnsweredQuestions(newAnswered);

      setTimeout(() => {
        setSubmitted(false);

        if (idx < quiz.questions.length - 1) {
          setIdx(idx + 1);
        } else {
          finishQuiz();
        }
      }, 800);
    } catch (err) {
      setSubmitted(false);
      console.error("Error submitting response:", err);
      alert("Error submitting response. Please try again.");
    }
  };

  const finishQuiz = async () => {
    try {
      await axios.post(`http://localhost:8080/api/quizzes/attempt/${attemptId}/submit`);
      navigate(`/result/${attemptId}`);
    } catch (err) {
      console.error("Error finishing quiz:", err);
      alert("Error finishing quiz. Please try again.");
    }
  };

  const goToPrevious = () => {
    if (idx > 0) {
      setIdx(idx - 1);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Preparing your quiz...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>⚠️ Error</h2>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => navigate("/")}>
          Back to Quizzes
        </button>
      </div>
    );
  }

  if (!quiz || quiz.questions.length === 0) {
    return (
      <div className="error-container">
        <h2>⚠️ No Questions</h2>
        <p>This quiz has no questions available.</p>
        <button className="btn btn-primary" onClick={() => navigate("/")}>
          Back to Quizzes
        </button>
      </div>
    );
  }

  const q = quiz.questions[idx];
  const progressPercent = ((idx + 1) / quiz.questions.length) * 100;
  const isAnswered = answeredQuestions.has(q.id);
  const hasAnswer = !!ans[q.id];

  return (
    <div className="quiz-attempt-container">
      {/* Header */}
      <div className="quiz-header">
        <div className="quiz-header-content">
          <h1>{quiz.title}</h1>
          <div className="quiz-timer">
            <span className="timer-icon">⏱️</span>
            <span className="timer-text">{quiz.duration} min</span>
          </div>
        </div>

        <div className="progress-section">
          <div className="progress-info">
            <span className="question-counter">
              Question <strong>{idx + 1}</strong> of <strong>{quiz.questions.length}</strong>
            </span>
            <span className="progress-percent">{Math.round(progressPercent)}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="quiz-content">
        <div className="question-card">
          <div className="question-header">
            <span className="question-number">Q{idx + 1}</span>
            <span className={`question-status ${isAnswered ? 'answered' : 'unanswered'}`}>
              {isAnswered ? '✓ Answered' : '○ Pending'}
            </span>
          </div>

          <h2 className="question-text">{q.text}</h2>

          <div className="options-container">
            {q.options && q.options.length > 0 ? (
              q.options.map((option) => (
                <label key={option.id} className="option-label">
                  <input
                    type="radio"
                    name={`question-${q.id}`}
                    value={option.id}
                    checked={ans[q.id] === option.id}
                    onChange={() => setAns({ ...ans, [q.id]: option.id })}
                    disabled={submitted}
                    className="option-input"
                  />
                  <span className="option-radio"></span>
                  <span className="option-text">{option.text}</span>
                </label>
              ))
            ) : (
              <div className="no-options">No options available</div>
            )}
          </div>
        </div>

        {/* Navigation & Submit */}
        <div className="quiz-footer">
          <button
            className="btn btn-secondary"
            onClick={goToPrevious}
            disabled={idx === 0}
          >
            ← Previous
          </button>

          <button
            className={`btn ${hasAnswer ? 'btn-success' : 'btn-primary'}`}
            onClick={submit}
            disabled={submitted || !hasAnswer}
          >
            {submitted ? (
              <>
                <span className="spinner-mini"></span>
                Submitting...
              </>
            ) : idx === quiz.questions.length - 1 ? (
              <>
                <span>Finish Quiz</span>
                <span className="arrow">🎉</span>
              </>
            ) : (
              <>
                <span>Next Question</span>
                <span className="arrow">→</span>
              </>
            )}
          </button>
        </div>

        {/* Question Indicators */}
        <div className="question-indicators">
          {quiz.questions.map((question, i) => (
            <div
              key={question.id}
              className={`indicator ${i === idx ? 'active' : ''} ${
                answeredQuestions.has(question.id) ? 'answered' : ''
              }`}
              onClick={() => setIdx(i)}
              title={`Question ${i + 1}`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Success Feedback */}
      {submitted && (
        <div className="success-feedback">
          <span className="feedback-icon">✓</span>
          <span className="feedback-text">Answer recorded!</span>
        </div>
      )}
    </div>
  );
}

export default QuizAttempt;