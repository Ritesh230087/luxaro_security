import { useState, useEffect } from 'react'
import axios from 'axios'
import './Captcha.css'

const Captcha = ({ onVerify, required = false }) => {
  const [captcha, setCaptcha] = useState(null)
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCaptcha()
  }, [])

  const fetchCaptcha = async () => {
    try {
      const { data } = await axios.get('/api/auth/captcha')
      setCaptcha(data.data)
      setAnswer('')
      setError('')
    } catch (error) {
      console.error('Error fetching CAPTCHA:', error)
    }
  }

  const handleVerify = async () => {
    if (!answer.trim()) {
      setError('Please solve the puzzle')
      return
    }

    setLoading(true)
    setError('')

    // Verify locally first (simple math)
    const [num1, operator, num2] = captcha.question.split(' ')
    let correctAnswer
    switch (operator) {
      case '+':
        correctAnswer = parseInt(num1) + parseInt(num2)
        break
      case '-':
        correctAnswer = parseInt(num1) - parseInt(num2)
        break
      case '*':
        correctAnswer = parseInt(num1) * parseInt(num2)
        break
      default:
        correctAnswer = 0
    }

    if (parseInt(answer) === correctAnswer) {
      onVerify(captcha.challengeId, answer)
      setError('')
    } else {
      setError('Incorrect answer. Please try again.')
      setAnswer('')
      fetchCaptcha()
    }

    setLoading(false)
  }

  if (!captcha) {
    return <div className="captcha-loading">Loading puzzle...</div>
  }

  return (
    <div className="captcha-container">
      <div className="captcha-puzzle">
        <label>Solve this puzzle to continue:</label>
        <div className="puzzle-display">
          <span className="puzzle-question">{captcha.question}</span>
          <button
            type="button"
            onClick={fetchCaptcha}
            className="refresh-captcha"
            title="Get new puzzle"
          >
            🔄
          </button>
        </div>
        <div className="puzzle-input">
          <input
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Enter answer"
            className={error ? 'error' : ''}
          />
          <button
            type="button"
            onClick={handleVerify}
            disabled={loading || !answer.trim()}
            className="verify-btn"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
        {error && <div className="captcha-error">{error}</div>}
      </div>
    </div>
  )
}

export default Captcha


