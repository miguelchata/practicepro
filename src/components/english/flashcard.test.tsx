
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Flashcard } from './flashcard';
import '@testing-library/jest-dom';

const mockPracticeItem = {
  wordData: {
    id: '1',
    word: 'apple',
    definition: 'A fruit that grows on trees.',
    examples: ['An apple a day keeps the doctor away.'],
    type: 'fruit',
    repetitions: 0,
    accuracy: 0,
    status: 'new',
  },
  type: 'guess',
};

describe('Flashcard', () => {
  let handleFeedback;

  beforeEach(() => {
    handleFeedback = jest.fn();
  });

  it('should render the definition and a show answer button', () => {
    render(<Flashcard practiceItem={mockPracticeItem} handleFeedback={handleFeedback} feedbackState="idle" newAccuracy={null} />);
    
    expect(screen.getByText('A fruit that grows on trees.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show Answer' })).toBeInTheDocument();
  });

  it('should show the word when "Show Answer" is clicked', () => {
    render(<Flashcard practiceItem={mockPracticeItem} handleFeedback={handleFeedback} feedbackState="idle" newAccuracy={null} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Show Answer' }));

    expect(screen.getByText('apple')).toBeInTheDocument();
    expect(screen.getByText(/again/i)).toBeInTheDocument();
    expect(screen.getByText(/hard/i)).toBeInTheDocument();
    expect(screen.getByText(/good/i)).toBeInTheDocument();
    expect(screen.getByText(/easy/i)).toBeInTheDocument();
  });

  it('should call handleFeedback with the correct quality when a feedback button is clicked', () => {
    render(<Flashcard practiceItem={mockPracticeItem} handleFeedback={handleFeedback} feedbackState="idle" newAccuracy={null} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Show Answer' }));
    fireEvent.click(screen.getByRole('button', { name: /good/i }));

    expect(handleFeedback).toHaveBeenCalledWith(3);
  });

  it('should not call handleFeedback if the answer is not shown', () => {
    render(<Flashcard practiceItem={mockPracticeItem} handleFeedback={handleFeedback} feedbackState="idle" newAccuracy={null} />);
    
    // Attempt to click a feedback button that isn't visible
    // This test implicitly passes if no error is thrown and handleFeedback is not called.
    expect(screen.queryByRole('button', { name: /good/i })).not.toBeInTheDocument();
    expect(handleFeedback).not.toHaveBeenCalled();
  });

  it('should show accuracy when feedbackState is "showingAccuracy"', () => {
    render(<Flashcard practiceItem={mockPracticeItem} handleFeedback={handleFeedback} feedbackState="showingAccuracy" newAccuracy={85} />);
    
    expect(screen.getByText('Accuracy: 85%')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '85');
  });

  it('should show examples when "Show Examples" is clicked', () => {
    render(<Flashcard practiceItem={mockPracticeItem} handleFeedback={handleFeedback} feedbackState="idle" newAccuracy={null} />);

    fireEvent.click(screen.getByRole('button', { name: 'Show Examples' }));

    expect(screen.getByText('An apple a day keeps the doctor away.')).toBeInTheDocument();
  });
});
