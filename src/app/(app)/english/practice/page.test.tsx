
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PracticePage from './page';
import { useVocabulary } from '@/firebase/firestore/use-collection';
import { useUpdateVocabularyItem } from '@/firebase/firestore/use-vocabulary';
import { useSearchParams, useRouter } from 'next/navigation';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('@/firebase/firestore/use-collection', () => ({
  useVocabulary: jest.fn(),
}));

jest.mock('@/firebase/firestore/use-vocabulary', () => ({
  useUpdateVocabularyItem: jest.fn(),
}));

jest.mock('@/components/english/flashcard', () => ({
  Flashcard: ({ practiceItem, handleFeedback }) => (
    <div>
      Flashcard: {practiceItem.wordData.word}
      <button onClick={() => handleFeedback(5)}>Good</button>
    </div>
  ),
}));

jest.mock('@/components/english/writing-card', () => ({
  WritingCard: ({ practiceItem, handleFeedback }) => (
    <div>
      WritingCard: {practiceItem.wordData.word}
      <button onClick={() => handleFeedback(3)}>Hard</button>
    </div>
  ),
}));

const mockVocabulary = [
  { id: '1', word: 'apple', repetitions: 0, accuracy: 0, status: 'new' },
  { id: '2', word: 'banana', repetitions: 1, accuracy: 0.5, status: 'learning', nextReviewAt: new Date().toISOString() },
  { id: '3', word: 'cherry', repetitions: 5, accuracy: 0.9, status: 'mastered', nextReviewAt: new Date().toISOString() },
];

describe('PracticePage', () => {
  let mockRouter;
  let mockUpdateVocabularyItem;

  beforeEach(() => {
    mockRouter = { push: jest.fn() };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    
    mockUpdateVocabularyItem = jest.fn();
    (useUpdateVocabularyItem as jest.Mock).mockReturnValue(mockUpdateVocabularyItem);

    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('amount=2&type=both'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state', () => {
    (useVocabulary as jest.Mock).mockReturnValue({ data: [], loading: true });
    render(<PracticePage />);
    expect(screen.getByText('Preparing your session...')).toBeInTheDocument();
  });

  // it('should render session complete when no words are available', () => {
  //   (useVocabulary as jest.Mock).mockReturnValue({ data: [], loading: false });
  //   render(<PracticePage />);
  //   expect(screen.getByText('Session Complete!')).toBeInTheDocument();
  // });

  // it('should render practice session with items', async () => {
  //   (useVocabulary as jest.Mock).mockReturnValue({ data: mockVocabulary, loading: false });
  //   render(<PracticePage />);
    
  //   // Since the items are shuffled, we can check for the presence of either type
  //   await waitFor(() => {
  //       const flashcards = screen.queryAllByText(/Flashcard:/);
  //       const writingCards = screen.queryAllByText(/WritingCard:/);
  //       expect(flashcards.length + writingCards.length).toBeGreaterThan(0);
  //   });
  // });

  // it('should show quit confirmation dialog and navigate on confirm', async () => {
  //   (useVocabulary as jest.Mock).mockReturnValue({ data: mockVocabulary, loading: false });
  //   render(<PracticePage />);

  //   await waitFor(() => {
  //       expect(screen.queryByText('Preparing your session...')).not.toBeInTheDocument();
  //   });

  //   fireEvent.click(screen.getByRole('button', { name: /x/i }));
    
  //   expect(screen.getByText('Are you sure you want to quit?')).toBeInTheDocument();
    
  //   fireEvent.click(screen.getByText('Quit Session'));
  //   expect(mockRouter.push).toHaveBeenCalledWith('/english');
  // });

  // it('should update progress when an item is answered correctly', async () => {
  //   (useVocabulary as jest.Mock).mockReturnValue({ data: [mockVocabulary[0]], loading: false });
  //   (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('amount=1&type=guess'));

  //   render(<PracticePage />);

  //   await waitFor(() => {
  //     expect(screen.getByText(/Flashcard: apple/)).toBeInTheDocument();
  //   });

  //   expect(screen.getByText('0 / 1')).toBeInTheDocument();

  //   fireEvent.click(screen.getByRole('button', { name: 'Good' }));

  //   await waitFor(() => {
  //     // The session finishes, and the "Session Complete!" screen appears.
  //     expect(screen.getByText('Session Complete!')).toBeInTheDocument();
  //   });
  // });
});
