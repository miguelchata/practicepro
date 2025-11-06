
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WritingCard } from './writing-card';
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
  type: 'write',
};

describe('WritingCard', () => {
  let handleFeedback;

  beforeEach(() => {
    handleFeedback = jest.fn();
  });

  it('should render a text input and a submit button', () => {
    render(<WritingCard practiceItem={mockPracticeItem} handleFeedback={handleFeedback} feedbackState="idle" newAccuracy={null} />);
    
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  // it('should show feedback when the wrong answer is submitted', () => {
  //   render(<WritingCard practiceItem={mockPracticeItem} handleFeedback={handleFeedback} feedbackState="idle" newAccuracy={null} />);
    
  //   fireEvent.change(screen.getByRole('textbox'), { target: { value: 'banana' } });
  //   fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

  //   expect(screen.getByText('banana')).toBeInTheDocument();
  // });

  // it('should call handleFeedback with a low quality for a wrong answer', () => {
  //   render(<WritingCard practiceItem={mockPracticeItem} handleFeedback={handleFeedback} feedbackState="idle" newAccuracy={null} />);
    
  //   fireEvent.change(screen.getByRole('textbox'), { target: { value: 'banana' } });
  //   fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

  //   expect(handleFeedback).toHaveBeenCalledWith(0);
  // });

  // it('should call handleFeedback with a high quality for a correct answer', () => {
  //   render(<WritingCard practiceItem={mockPracticeItem} handleFeedback={handleFeedback} feedbackState="idle" newAccuracy={null} />);
    
  //   fireEvent.change(screen.getByRole('textbox'), { target: { value: 'apple' } });
  //   fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

  //   expect(handleFeedback).toHaveBeenCalledWith(5);
  // });

  // it('should show accuracy when feedbackState is "showingAccuracy"', () => {
  //   render(<WritingCard practiceItem={mockPracticeItem} handleFeedback={handleFeedback} feedbackState="showingAccuracy" newAccuracy={90} />);
    
  //   expect(screen.getByText('Accuracy: 90%')).toBeInTheDocument();
  //   expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '90');
  // });

  // it('should reveal the answer when "I don\'t know" is clicked', () => {
  //   render(<WritingCard practiceItem={mockPracticeItem} handleFeedback={handleFeedback} feedbackState="idle" newAccuracy={null} />);

  //   fireEvent.click(screen.getByRole('button', { name: "I don't know" }));

  //   expect(handleFeedback).toHaveBeenCalledWith(0);
  //   expect(screen.getByText('The correct answer is:')).toBeInTheDocument();
  //   expect(screen.getByText('apple')).toBeInTheDocument();
  // });
});
