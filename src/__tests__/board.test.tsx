/**
 * Board integration tests.
 *
 * Test 1: Core workflow — creating a task and seeing it on the board.
 * Test 2: Non-trivial UI behavior — filtering tasks by priority.
 *
 * Uses Vitest globals and native assertions to avoid jest-dom compatibility issues.
 * Note: screen.getByText() already throws if element is not found, so we use
 * toBeTruthy() as a confirmation assertion rather than toBeInTheDocument().
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "../components/ui";
import { BoardView } from "../features/board/BoardView";
import { STORAGE_KEY } from "../types/storage";

// Helper to render with all required providers
function renderBoard() {
  return render(
    <BrowserRouter>
      <ToastProvider>
        <BoardView />
      </ToastProvider>
    </BrowserRouter>,
  );
}

describe("Board View", () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  it("shows empty state when there are no tasks", () => {
    renderBoard();

    expect(screen.getByText("No tasks yet")).toBeTruthy();
    expect(
      screen.getByText(/Get started by creating your first task/),
    ).toBeTruthy();
    expect(screen.getByText("+ Create First Task")).toBeTruthy();
  });

  it("creates a task and displays it on the board", async () => {
    const user = userEvent.setup();
    renderBoard();

    // Click "+ New Task" button
    const newTaskBtn = screen.getByRole("button", { name: /new task/i });
    await user.click(newTaskBtn);

    // Fill in the form
    const titleInput = screen.getByLabelText(/title/i);
    await user.type(titleInput, "Implement authentication");

    const descriptionInput = screen.getByLabelText(/description/i);
    await user.type(descriptionInput, "Add JWT-based auth flow");

    // Submit the form
    const createBtn = screen.getByRole("button", { name: /create task/i });
    await user.click(createBtn);

    // Verify the task appears on the board
    await waitFor(() => {
      expect(screen.getByText("Implement authentication")).toBeTruthy();
    });
    expect(screen.getByText("Add JWT-based auth flow")).toBeTruthy();
    expect(screen.getByText(/1 task total/i)).toBeTruthy();

    // Verify localStorage persistence
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    expect(stored.tasks).toHaveLength(1);
    expect(stored.tasks[0].title).toBe("Implement authentication");
  });

  it("validates required fields on task creation", async () => {
    const user = userEvent.setup();
    renderBoard();

    await user.click(screen.getByRole("button", { name: /new task/i }));

    // Try to submit without filling title
    const createBtn = screen.getByRole("button", { name: /create task/i });
    await user.click(createBtn);

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeTruthy();
    });
  });

  it("filters tasks by priority", async () => {
    const user = userEvent.setup();

    // Seed localStorage with tasks of different priorities
    const now = new Date().toISOString();
    const seedData = {
      schemaVersion: 2,
      tasks: [
        {
          id: "1",
          title: "High priority task",
          description: "",
          status: "backlog",
          priority: "high",
          assignee: "",
          tags: [],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: "2",
          title: "Low priority task",
          description: "",
          status: "backlog",
          priority: "low",
          assignee: "",
          tags: [],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: "3",
          title: "Medium priority task",
          description: "",
          status: "in-progress",
          priority: "medium",
          assignee: "",
          tags: [],
          createdAt: now,
          updatedAt: now,
        },
      ],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
    renderBoard();

    // All tasks visible initially
    expect(screen.getByText("High priority task")).toBeTruthy();
    expect(screen.getByText("Low priority task")).toBeTruthy();
    expect(screen.getByText("Medium priority task")).toBeTruthy();

    // Filter by "High" priority
    const prioritySelect = screen.getByLabelText("Priority");
    await user.selectOptions(prioritySelect, "high");

    // Only High visible
    await waitFor(() => {
      expect(screen.queryByText("Low priority task")).toBeNull();
    });
    expect(screen.getByText("High priority task")).toBeTruthy();
    expect(screen.queryByText("Medium priority task")).toBeNull();
  });

  it('shows "no results" state when filters hide all tasks', async () => {
    const user = userEvent.setup();

    const now = new Date().toISOString();
    const seedData = {
      schemaVersion: 2,
      tasks: [
        {
          id: "1",
          title: "Only task",
          description: "",
          status: "backlog",
          priority: "low",
          assignee: "",
          tags: [],
          createdAt: now,
          updatedAt: now,
        },
      ],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
    renderBoard();

    // Search for nonexistent text
    const searchInput = screen.getByPlaceholderText(/search tasks/i);
    await user.type(searchInput, "zzzznonexistent");

    await waitFor(() => {
      expect(screen.getByText(/no tasks found/i)).toBeTruthy();
    });
    expect(
      screen.getByText(/no tasks match your current filters/i),
    ).toBeTruthy();
  });

  it("shows migration notification when loading legacy data", () => {
    const v1Data = {
      schemaVersion: 1,
      tasks: [
        {
          id: "1",
          title: "Legacy task",
          description: "Old format",
          status: "backlog",
          priority: "medium",
          assignee: "Old User",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v1Data));

    renderBoard();

    expect(screen.getByText("Legacy task")).toBeTruthy();
    expect(screen.getByText(/data was migrated/i)).toBeTruthy();
  });
});
