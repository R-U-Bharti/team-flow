// This is our main form for creating and editing tasks.
// We use Formik for handling the form state and Yup for validation rules
// because it makes dealing with all these fields much easier than manual state.

import { useCallback, useRef, useEffect, useState } from "react";
import { Formik, Form, Field, type FieldInputProps } from "formik";
import * as Yup from "yup";
import type { Task, TaskStatus, TaskPriority } from "../../types/task";
import {
  STATUS_LABELS,
  PRIORITY_LABELS,
  STATUS_ORDER,
  PRIORITY_ORDER,
} from "../../types/task";
import {
  Button,
  TextInput,
  TextArea,
  Select,
  Tag,
  Modal,
  useConfirm,
} from "../../components/ui";
import type { SelectOption } from "../../components/ui";
import { useUnsavedChanges } from "../../hooks";

interface TaskFormProps {
  task?: Task | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => void;
  onDelete?: (id: string) => void;
}

export interface TaskFormValues {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  tags: string[];
}

// These are our form validation rules. Yup makes it super easy to
// declare exactly what we expect from the user input.
const validationSchema = Yup.object({
  title: Yup.string()
    .required("Title is required")
    .max(100, "Title must be 100 characters or fewer"),
  description: Yup.string().max(
    2000,
    "Description must be 2000 characters or fewer",
  ),
  status: Yup.string()
    .oneOf(["backlog", "in-progress", "done"])
    .required("Status is required"),
  priority: Yup.string()
    .oneOf(["low", "medium", "high"])
    .required("Priority is required"),
  assignee: Yup.string().max(50, "Assignee must be 50 characters or fewer"),
});

const statusOptions: SelectOption[] = STATUS_ORDER.map(s => ({
  value: s,
  label: STATUS_LABELS[s],
}));

const priorityOptions: SelectOption[] = PRIORITY_ORDER.map(p => ({
  value: p,
  label: PRIORITY_LABELS[p],
}));

// Helper to set up the empty form vs pre-filling it for an edit
const getInitialValues = (task?: Task | null): TaskFormValues => ({
  title: task?.title ?? "",
  description: task?.description ?? "",
  status: task?.status ?? "backlog",
  priority: task?.priority ?? "medium",
  assignee: task?.assignee ?? "",
  tags: task?.tags ?? [],
});

function TaskForm({ task, open, onClose, onSubmit, onDelete }: TaskFormProps) {
  const isEditing = !!task;
  const titleInputRef = useRef<HTMLInputElement>(null);

  // This hooks into our custom unsaved changes warning system
  const { isDirty, setDirty, confirmDiscard } = useUnsavedChanges();

  // Local state just for the tag input field before it's "added" to the main form state
  const [tagInput, setTagInput] = useState("");

  // Automatically focus the title input when the modal opens to save a click
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => titleInputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const confirm = useConfirm();

  const handleClose = useCallback(async () => {
    // Check if we need to warn the user about unsaved work
    if (await confirmDiscard()) {
      setDirty(false);
      onClose();
    }
  }, [confirmDiscard, setDirty, onClose]);

  const handleAddTag = useCallback(
    (
      tags: string[],
      setFieldValue: (field: string, value: string[]) => void,
    ) => {
      const trimmed = tagInput.trim();
      // Don't add empty tags or duplicates
      if (trimmed && !tags.includes(trimmed)) {
        setFieldValue("tags", [...tags, trimmed]);
        setDirty(true);
      }
      setTagInput("");
    },
    [tagInput, setDirty],
  );

  const handleRemoveTag = useCallback(
    (
      tags: string[],
      tagToRemove: string,
      setFieldValue: (field: string, value: string[]) => void,
    ) => {
      setFieldValue(
        "tags",
        tags.filter(t => t !== tagToRemove),
      );
      setDirty(true);
    },
    [setDirty],
  );

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEditing ? "Edit Task" : "Create Task"}
      width="md:min-w-xl"
    >
      <Formik
        initialValues={getInitialValues(task)}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={values => {
          onSubmit(values);
          setDirty(false);
        }}
      >
        {({ errors, touched, values, setFieldValue, isSubmitting }) => (
          <Form className="space-y-4" noValidate>
            {/* Title */}
            <Field name="title">
              {({ field }: { field: FieldInputProps<string> }) => (
                <TextInput
                  {...field}
                  ref={titleInputRef}
                  label="Title *"
                  placeholder="What needs to be done?"
                  error={
                    touched.title && errors.title ? errors.title : undefined
                  }
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    field.onChange(e);
                    setDirty(true);
                  }}
                />
              )}
            </Field>

            {/* Description */}
            <Field name="description">
              {({ field }: { field: FieldInputProps<string> }) => (
                <TextArea
                  {...field}
                  label="Description"
                  placeholder="Add more details about this task..."
                  rows={4}
                  error={
                    touched.description && errors.description
                      ? errors.description
                      : undefined
                  }
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    field.onChange(e);
                    setDirty(true);
                  }}
                />
              )}
            </Field>

            {/* Status & Priority Row */}
            <div className="grid grid-cols-2 gap-3">
              <Field name="status">
                {({ field }: { field: FieldInputProps<string> }) => (
                  <Select
                    {...field}
                    label="Status"
                    options={statusOptions}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      field.onChange(e);
                      setDirty(true);
                    }}
                  />
                )}
              </Field>

              <Field name="priority">
                {({ field }: { field: FieldInputProps<string> }) => (
                  <Select
                    {...field}
                    label="Priority"
                    options={priorityOptions}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      field.onChange(e);
                      setDirty(true);
                    }}
                  />
                )}
              </Field>
            </div>

            {/* Assignee */}
            <Field name="assignee">
              {({ field }: { field: FieldInputProps<string> }) => (
                <TextInput
                  {...field}
                  label="Assignee"
                  placeholder="Who's responsible?"
                  error={
                    touched.assignee && errors.assignee
                      ? errors.assignee
                      : undefined
                  }
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    field.onChange(e);
                    setDirty(true);
                  }}
                />
              )}
            </Field>

            {/* Tags */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-200">Tags</label>
              <div className="flex md:flex-row flex-col gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag(values.tags, setFieldValue);
                    }
                  }}
                  placeholder="Add a tag and press Enter"
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-700 bg-slate-900 text-slate-100
                           focus:outline-none focus:ring focus:ring-cyan-500 focus:border-cyan-500
                           placeholder:text-slate-500"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleAddTag(values.tags, setFieldValue)}
                >
                  Add
                </Button>
              </div>
              {values.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {values.tags.map(tag => (
                    <Tag
                      key={tag}
                      variant="primary"
                      removable
                      onRemove={() =>
                        handleRemoveTag(values.tags, tag, setFieldValue)
                      }
                    >
                      {tag}
                    </Tag>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <div>
                {isEditing && onDelete && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={async () => {
                      const ok = await confirm({
                        title: "Delete Task?",
                        message:
                          "Are you sure you want to delete this task? This action cannot be undone.",
                        confirmLabel: "Delete",
                        cancelLabel: "Cancel",
                        variant: "destructive",
                      });

                      if (ok) {
                        onDelete(task!.id);
                        setDirty(false);
                      }
                    }}
                  >
                    Delete
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={isSubmitting}>
                  {isEditing ? "Save Changes" : "Create Task"}
                </Button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}

export { TaskForm };
