import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ReactMarkdown from 'react-markdown'

function AIMessage({ message }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-[var(--accent)] text-white rounded-br-sm'
            : 'bg-[var(--surface)] border border-[var(--border)] rounded-bl-sm'
        }`}
      >
        {isUser ? (
          message.content
        ) : (
          <div className="prose prose-sm prose-invert max-w-none">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}

describe('AIMessage', () => {
  it('renders user message right-aligned', () => {
    const message = { role: 'user', content: 'Hello, how are my finances?' }
    render(<AIMessage message={message} />)
    expect(screen.getByText('Hello, how are my finances?')).toBeInTheDocument()
  })

  it('renders AI message left-aligned', () => {
    const message = { role: 'assistant', content: 'Your finances look good.' }
    render(<AIMessage message={message} />)
    expect(screen.getByText('Your finances look good.')).toBeInTheDocument()
  })

  it('renders markdown in AI messages', () => {
    const message = { role: 'assistant', content: '**bold text** and *italic*' }
    render(<AIMessage message={message} />)
    expect(screen.getByText('bold text')).toBeInTheDocument()
    expect(screen.getByText('italic')).toBeInTheDocument()
  })

  it('renders list items in AI messages', () => {
    const message = {
      role: 'assistant',
      content: '- Item 1\n- Item 2\n- Item 3',
    }
    render(<AIMessage message={message} />)
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
    expect(screen.getByText('Item 3')).toBeInTheDocument()
  })

  it('renders plain text for user messages without markdown processing', () => {
    const message = { role: 'user', content: '**not bold**' }
    render(<AIMessage message={message} />)
    expect(screen.getByText('**not bold**')).toBeInTheDocument()
  })
})
