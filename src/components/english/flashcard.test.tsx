
import React from 'react';
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Flashcard } from "./flashcard";
import "@testing-library/jest-dom";
import type {
  PracticeItem,
  FeedbackState,
} from "@/app/(app)/english/practice/page";

jest.mock("@/components/english/blurred-word", () => ({
  BlurredWord: ({ sentence }: { sentence: string }) => (
    <span data-testid="blurred">{sentence}</span>
  ),
}));

jest.mock("@/components/ui/carousel", () => ({
  Carousel: ({ children }: any) => <div data-testid="carousel">{children}</div>,
  CarouselContent: ({ children }: any) => <div>{children}</div>,
  CarouselItem: ({ children }: any) => <div>{children}</div>,
  CarouselNext: () => <button data-testid="carousel-next">Next</button>,
  CarouselPrevious: () => <button data-testid="carousel-prev">Prev</button>,
}));

jest.mock("@/components/ui/card", () => ({
  Card: ({ children, ...rest }: any) => (
    <div data-testid="card" {...rest}>
      {children}
    </div>
  ),
  CardContent: ({ children }: any) => (
    <div data-testid="card-content">{children}</div>
  ),
  CardHeader: ({ children }: any) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children }: any) => (
    <h1 data-testid="card-title">{children}</h1>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...rest }: any) => <button {...rest}>{children}</button>,
}));
jest.mock("../ui/separator", () => ({
  Separator: () => <hr data-testid="separator" />,
}));
jest.mock("../ui/badge", () => ({
  Badge: ({ children }: any) => <span data-testid="badge">{children}</span>,
}));
jest.mock("../ui/progress", () => ({
  Progress: ({ value }: any) => (
    <progress data-testid="progress" value={value} />
  ),
}));

const basePracticeItem = {
  wordData: {
    id: "w1",
    word: "Plethora",
    definition: "A large or excessive amount of something.",
    examples: [
      "There was a plethora of books on the shelf.",
      "He offered a plethora of excuses.",
    ],
    ipa: "/ˈplɛθərə/",
    type: "noun",
  },
} as PracticeItem;

describe("Flashcard", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders definition and badge when present", () => {
    const handleFeedback = jest.fn();
    const feedbackState = "idle" as FeedbackState;
    render(
      <Flashcard
        practiceItem={basePracticeItem}
        handleFeedback={handleFeedback}
        feedbackState={feedbackState}
        newAccuracy={null}
      />
    );

    expect(
      screen.getByText(basePracticeItem.wordData.definition)
    ).toBeInTheDocument();
    expect(screen.getByTestId("badge")).toHaveTextContent(
      basePracticeItem.wordData.type!
    );
  });

  test('initially shows "Show Examples" button when examples exist and not shown/answered', async () => {
    const handleFeedback = jest.fn();
    render(
      <Flashcard
        practiceItem={basePracticeItem}
        handleFeedback={handleFeedback}
        feedbackState={"idle"}
        newAccuracy={null}
      />
    );

    const showExamplesBtn = screen.getByRole("button", {
      name: /show examples/i,
    });
    expect(showExamplesBtn).toBeInTheDocument();

    // click reveals carousel examples
    await userEvent.click(showExamplesBtn);
    expect(screen.getByTestId("carousel")).toBeInTheDocument();
    expect(screen.getAllByTestId("blurred").length).toBeGreaterThanOrEqual(1);
  });

  test("Show Answer reveals the word and ipa", async () => {
    const handleFeedback = jest.fn();
    render(
      <Flashcard
        practiceItem={basePracticeItem}
        handleFeedback={handleFeedback}
        feedbackState={"idle"}
        newAccuracy={null}
      />
    );

    // before clicking show answer, card title shouldn't be visible
    expect(screen.queryByTestId("card-title")).not.toBeInTheDocument();

    const showAnswerBtn = screen.getByRole("button", { name: /show answer/i });
    await userEvent.click(showAnswerBtn);

    expect(screen.getByTestId("card-title")).toHaveTextContent(
      basePracticeItem.wordData.word
    );
    expect(
      screen.getByText(basePracticeItem.wordData.ipa || "")
    ).toBeInTheDocument();

    // when showWord is true, examples should also show (because showWord triggers showExamples rendering)
    expect(screen.getByTestId("carousel")).toBeInTheDocument();
  });

  test("feedback buttons call handleFeedback with correct values only when word is shown and feedbackState is idle", async () => {
    const handleFeedback = jest.fn();
    render(
      <Flashcard
        practiceItem={basePracticeItem}
        handleFeedback={handleFeedback}
        feedbackState={"idle"}
        newAccuracy={null}
      />
    );

    // reveal answer first
    await userEvent.click(screen.getByRole("button", { name: /show answer/i }));

    // three feedback buttons exist
    const noBtn = screen.getByRole("button", { name: /no/i });
    const sortOfBtn = screen.getByRole("button", { name: /sort of/i });
    const yesBtn = screen.getByRole("button", { name: /yes/i });

    await userEvent.click(noBtn);
    expect(handleFeedback).toHaveBeenCalledWith(1);

    await userEvent.click(sortOfBtn);
    expect(handleFeedback).toHaveBeenCalledWith(3);

    await userEvent.click(yesBtn);
    expect(handleFeedback).toHaveBeenCalledWith(5);

    expect(handleFeedback).toHaveBeenCalledTimes(3);
  });

  test("does NOT call handleFeedback if showWord is false", async () => {
    const handleFeedback = jest.fn();
    render(
      <Flashcard
        practiceItem={basePracticeItem}
        handleFeedback={handleFeedback}
        feedbackState={"idle"}
        newAccuracy={null}
      />
    );

    // Show answer not clicked, but attempt to find and click feedback buttons should not be possible.
    // Buttons are not rendered yet; ensure they are not in the document.
    expect(
      screen.queryByRole("button", { name: /no/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /sort of/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /yes/i })
    ).not.toBeInTheDocument();

    // ensure handleFeedback wasn't called
    expect(handleFeedback).not.toHaveBeenCalled();
  });

  test("does NOT call handleFeedback when feedbackState is not idle even if word shown", async () => {
    const handleFeedback = jest.fn();
    render(
      <Flashcard
        practiceItem={basePracticeItem}
        handleFeedback={handleFeedback}
        feedbackState={"showingAccuracy"}
        newAccuracy={null}
      />
    );

    // Show answer -> reveal word
    await userEvent.click(screen.getByRole("button", { name: /show answer/i }));
    expect(screen.getByTestId("card-title")).toBeInTheDocument();

    // Buttons should NOT be rendered because feedbackState !== 'idle'
    expect(
      screen.queryByRole("button", { name: /no/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /sort of/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /yes/i })
    ).not.toBeInTheDocument();

    expect(handleFeedback).not.toHaveBeenCalled();
  });

  test("showingAccuracy displays Progress and rounded accuracy text", async () => {
    const handleFeedback = jest.fn();
    render(
      <Flashcard
        practiceItem={basePracticeItem}
        handleFeedback={handleFeedback}
        feedbackState={"showingAccuracy"}
        newAccuracy={72.6}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /show answer/i }));

    expect(screen.getByTestId("progress")).toBeInTheDocument();
    expect(screen.getByText(/Accuracy: 73%/)).toBeInTheDocument();
  });

  test("resets local state (showExamples & showWord) when practiceItem.wordData.id changes", async () => {
    const handleFeedback = jest.fn();
    const { rerender } = render(
      <Flashcard
        practiceItem={basePracticeItem}
        handleFeedback={handleFeedback}
        feedbackState={"idle"}
        newAccuracy={null}
      />
    );

    // reveal answer and examples
    await userEvent.click(screen.getByRole("button", { name: /show answer/i }));
    expect(screen.getByTestId("card-title")).toBeInTheDocument();
    expect(screen.getByTestId("carousel")).toBeInTheDocument();

    // Rerender with a different id
    const newPracticeItem = {
      ...basePracticeItem,
      wordData: { ...basePracticeItem.wordData, id: "w2", word: "Other" },
    } as PracticeItem;

    await act(async () => {
      rerender(
        <Flashcard
          practiceItem={newPracticeItem}
          handleFeedback={handleFeedback}
          feedbackState={"idle"}
          newAccuracy={null}
        />
      );
    });

    // After change, the word shouldn't be shown and carousel shouldn't be visible (reset)
    expect(screen.queryByTestId("card-title")).not.toBeInTheDocument();
    expect(screen.queryByTestId("carousel")).not.toBeInTheDocument();

    // Show Examples should be visible again (because fresh card)
    expect(
      screen.getByRole("button", { name: /show examples/i })
    ).toBeInTheDocument();
  });
});
