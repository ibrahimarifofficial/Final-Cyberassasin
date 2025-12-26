'use client'

import { useState } from 'react'

interface BlogCommentsProps {
  postId: number
  postSlug: string
}

export default function BlogComments({ postId, postSlug }: BlogCommentsProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Reset form
    setName('')
    setEmail('')
    setComment('')
    setIsSubmitting(false)
    setSubmitted(true)
    
    // Hide success message after 3 seconds
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <div className="blog-comments">
      <h3 className="blog-comments-title">Leave a Comment</h3>
      
      {submitted && (
        <div className="blog-comments-success">
          Thank you! Your comment has been submitted and is awaiting moderation.
        </div>
      )}

      <form className="blog-comments-form" onSubmit={handleSubmit}>
        <div className="blog-comments-form-row">
          <div className="blog-comments-form-group">
            <label htmlFor="comment-name" className="blog-comments-label">
              Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="comment-name"
              className="blog-comments-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your name"
            />
          </div>
          
          <div className="blog-comments-form-group">
            <label htmlFor="comment-email" className="blog-comments-label">
              Email <span className="required">*</span>
            </label>
            <input
              type="email"
              id="comment-email"
              className="blog-comments-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your.email@example.com"
            />
          </div>
        </div>

        <div className="blog-comments-form-group">
          <label htmlFor="comment-text" className="blog-comments-label">
            Comment <span className="required">*</span>
          </label>
          <textarea
            id="comment-text"
            className="blog-comments-textarea"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            rows={6}
            placeholder="Share your thoughts..."
          />
        </div>

        <button
          type="submit"
          className="blog-comments-submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Post Comment'}
        </button>
      </form>
    </div>
  )
}

