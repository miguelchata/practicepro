
import React from 'react';
import { render, screen, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WritingCard } from "./writing-card";
import "@testing-library/jest-dom";

import type {
  PracticeItem,
  FeedbackState,
} from "@/app/(app)/english/practice/page";

jest.mock("@/components/english/blurred-word", () => ({
  BlurredWord: ({ sentence, ...rest }: { sentence: string }) => (
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

// jest.mock("@/components/ui/button", () => ({
//   __esModule: true,
//   Button: ({ children, ...rest }: any) => <button {...rest}>{children}</button>,
// }));

jest.mock("@/components/ui/input", () => ({
  Input: (props: any) => <input data-testid="input" {...props} />,
}));

// jest.mock("../ui/separator", () => ({
//   __esModule: true,
//   Separator: () => <hr data-testid="separator" />,
// }));

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

describe("WritingCard", () => {
  let handleFeedback = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders definition and badge when present", () => {
    const handleFeedback = jest.fn();
    const feedbackState = "idle" as FeedbackState;
    render(
      <WritingCard
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

  test('shows "Show Examples" button initially when examples exist and feedbackState is idle', async () => {
    const handleFeedback = jest.fn();
    render(
      <WritingCard
        practiceItem={basePracticeItem}
        handleFeedback={handleFeedback}
        feedbackState={"idle"}
        newAccuracy={null}
      />
    );

    const showBtn = screen.getByRole("button", { name: /show examples/i });
    expect(showBtn).toBeInTheDocument();

    // click reveals carousel with examples
    await userEvent.click(showBtn);
    expect(screen.getByTestId("carousel")).toBeInTheDocument();
    // each example should render inside the mocked BlurredWord element
    expect(screen.getAllByTestId("blurred").length).toBeGreaterThanOrEqual(1);
  });

  test("typing correct answer calls handleFeedback with quality 5 (case/whitespace insensitive)", async () => {
    const handleFeedback = jest.fn();
    const { rerender } = render(
      <WritingCard
        practiceItem={basePracticeItem}
        handleFeedback={handleFeedback}
        feedbackState={"idle"}
        newAccuracy={null}
      />
    );

    const input = screen.getByTestId("input") as HTMLInputElement;
    const submitBtn = screen.getByRole("button", { name: /check answer/i });

    await userEvent.type(input, "  plethora  ");
    await userEvent.click(submitBtn);

    // handleFeedback should have been called with 5
    expect(handleFeedback).toHaveBeenCalledTimes(1);
    expect(handleFeedback).toHaveBeenCalledWith(5);

    // Me mocks a rerender
    await act(async () => {
      rerender(
        <WritingCard
          practiceItem={basePracticeItem}
          handleFeedback={handleFeedback}
          feedbackState={"showingResult"}
          newAccuracy={null}
        />
      );
    });

    expect(screen.getByText(/Correct!/)).toBeInTheDocument();
  });

  test("typing incorrect answer calls handleFeedback with quality 1", async () => {
    const handleFeedback = jest.fn();
    render(
      <WritingCard
        practiceItem={basePracticeItem}
        handleFeedback={handleFeedback}
        feedbackState={"idle"}
        newAccuracy={null}
      />
    );

    const input = screen.getByTestId("input") as HTMLInputElement;
    const submitBtn = screen.getByRole("button", { name: /check answer/i });

    await userEvent.type(input, "wrongword");
    await userEvent.click(submitBtn);

    expect(handleFeedback).toHaveBeenCalledTimes(1);
    expect(handleFeedback).toHaveBeenCalledWith(1);
  });

  test("when feedbackState !== idle, shows word and ipa and disables input/form", () => {
    const handleFeedback = jest.fn();
    // render with showingResult state (non-idle)
    render(
      <WritingCard
        practiceItem={basePracticeItem}
        handleFeedback={handleFeedback}
        feedbackState={"showingResult"}
        newAccuracy={null}
      />
    );

    // CardTitle (word) should be visible
    expect(screen.getByTestId("card-title")).toHaveTextContent(
      basePracticeItem.wordData.word
    );
    // IPA should be visible
    expect(
      screen.getByText(basePracticeItem.wordData.ipa || "")
    ).toBeInTheDocument();
    // Input should not be present (form replaced)
    expect(screen.queryByTestId("input")).not.toBeInTheDocument();
  });

  test("showingAccuracy displays Progress and rounded accuracy text", async () => {
    const handleFeedback = jest.fn();
    const { rerender } = render(
      <WritingCard
        practiceItem={basePracticeItem}
        handleFeedback={handleFeedback}
        feedbackState={"showingAccuracy"}
        newAccuracy={73.4}
      />
    );

    expect(screen.getByTestId("progress")).toBeInTheDocument();
    expect(screen.getByText(/Accuracy: 73%/)).toBeInTheDocument(); // rounded
  });

  test("showingFinal displays user input when incorrect", async () => {
    const handleFeedback = jest.fn();
    // We simulate that the user wrote "wrong" and is incorrect by rendering showingFinal and passing userInput via re-render:
    // Since userInput is internal state we can't directly set it from props; instead we simulate flow:
    const { rerender } = render(
      <WritingCard
        practiceItem={basePracticeItem}
        handleFeedback={handleFeedback}
        feedbackState={"idle"}
        newAccuracy={null}
      />
    );

    const input = screen.getByTestId("input") as HTMLInputElement;
    const submitBtn = screen.getByRole("button", { name: /check answer/i });

    // write wrong answer and submit (call handleFeedback will be invoked)
    await userEvent.type(input, "WRONG");
    await userEvent.click(submitBtn);

    // Now rerender component with showingFinal to simulate parent driving states after feedback
    await act(async () => {
      rerender(
        <WritingCard
          practiceItem={basePracticeItem}
          handleFeedback={handleFeedback}
          feedbackState={"showingFinal"}
          newAccuracy={null}
        />
      );
    });

    // The component should show "You wrote: WRONG" (font styling aside). We use partial match to be resilient.
    expect(screen.getByText(/You wrote:/)).toBeInTheDocument();
    expect(screen.getByText(/WRONG/)).toBeInTheDocument();
  });

  test("resets input and flags when practiceItem.wordData.id changes", async () => {
    const handleFeedback = jest.fn();
    const { rerender } = render(
      <WritingCard
        practiceItem={basePracticeItem}
        handleFeedback={handleFeedback}
        feedbackState={"idle"}
        newAccuracy={null}
      />
    );

    // type something
    const input = screen.getByTestId("input") as HTMLInputElement;
    await userEvent.type(input, "plethora");

    expect(input.value).toBe("plethora");

    // Rerender with a new practice item id
    const newPracticeItem = {
      ...basePracticeItem,
      wordData: { ...basePracticeItem.wordData, id: "w2", word: "Another" },
    } as PracticeItem;

    // Rerender and assert input cleared
    await act(async () => {
      rerender(
        <WritingCard
          practiceItem={newPracticeItem}
          handleFeedback={handleFeedback}
          feedbackState={"idle"}
          newAccuracy={null}
        />
      );
    });

    expect(screen.getByTestId("input")).toBeInTheDocument();
    expect((screen.getByTestId("input") as HTMLInputElement).value).toBe("");
  });

  test("when feedbackState is not idle, clicking Show Examples is not shown (ensures conditional rendering)", () => {
    const handleFeedback = jest.fn();
    render(
      <WritingCard
        practiceItem={basePracticeItem}
        handleFeedback={handleFeedback}
        feedbackState={"showingResult"}
        newAccuracy={null}
      />
    );

    // Show Examples should not be present
    expect(
      screen.queryByRole("button", { name: /show examples/i })
    ).not.toBeInTheDocument();
  });
});
