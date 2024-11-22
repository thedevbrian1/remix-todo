import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { validateText } from "../.server/validation";
import {
  createTodoItem,
  deleteTodoItem,
  getTodoItems,
  updateTodoItem,
} from "../models/todo";
import { useEffect, useRef } from "react";

export const meta = () => {
  return [
    { title: "TODO" },
    { name: "description", content: "Keep track of your todo items." },
  ];
};

export async function loader() {
  let result = await getTodoItems();
  let todoItems = Array.from(result).map((item) => ({
    ...item,
    _id: item._id.toString(),
  }));

  return todoItems;
}

export async function action({ request }) {
  let formData = await request.formData();
  let action = formData.get("_action");

  switch (action) {
    case "create": {
      let todo = formData.get("todo");

      let fieldErrors = {
        todo: validateText(todo),
      };

      // Return errors if any
      if (Object.values(fieldErrors).some(Boolean)) {
        return { fieldErrors };
      }

      // Save the todo item to the database
      let result = await createTodoItem(todo);
      console.log({ result });
      break;
    }
    case "update": {
      console.log("is updating...");
      // Update isComplete to the database
      let id = formData.get("id");
      let result = await updateTodoItem(id);
      console.log({ result });
      break;
    }
    case "delete": {
      let id = formData.get("id");
      let result = await deleteTodoItem(id);
      break;
    }
  }

  return null;
}

export default function Index() {
  let todoItems = useLoaderData();

  let actionData = useActionData();
  let navigation = useNavigation();

  let isSubmitting = navigation.state === "submitting";

  let formRef = useRef(null);

  useEffect(() => {
    // Clear the form input after submission
    if (!isSubmitting) {
      formRef.current?.reset();
    }
  }, [isSubmitting]);

  return (
    <main>
      <div className={`w-full mt-32 max-w-2xl mx-auto`}>
        {navigation.state !== "idle" ? (
          <div className="absolute inset-0 min-h-screen grid place-items-center bg-black/50">
            <img src="/ball-triangle.svg" alt="" />
          </div>
        ) : null}
        <h1>Todo</h1>
        <Form
          method="post"
          className="bg-slate-500 p-4 rounded-md"
          ref={formRef}
        >
          <input type="hidden" name="_action" value="create" />
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              name="complete"
              aria-label="complete"
              disabled
            />
            <input
              type="text"
              name="todo"
              aria-label="new-todo"
              className="border border-gray-500 w-full px-4 py-2 "
            />
          </div>
          {/* Display validation errors from the server if any */}
          {actionData?.fieldErrors ? (
            <p className="text-red-500 mt-2">{actionData.fieldErrors.todo}</p>
          ) : (
            <>&nbsp;</>
          )}
        </Form>

        {/* Todo items from the database */}
        <ul className="bg-slate-500 p-4 rounded-md mt-8 divide-y divide-slate-600">
          {todoItems.map((todoItem) => (
            <TodoItem key={todoItem._id} item={todoItem} />
          ))}
        </ul>
      </div>
    </main>
  );
}

// Item component
function TodoItem({ item }) {
  let submit = useSubmit();
  return (
    <li className="flex justify-between items-center py-2">
      <Form method="post" className="flex gap-2">
        <input type="hidden" name="id" value={item._id} />
        <input type="hidden" name="_action" value="update" />
        <input
          type="checkbox"
          name="complete"
          id={item._id}
          defaultChecked={item.isComplete}
          onChange={(event) => submit(event.target.form)}
        />
        <label
          htmlFor={item._id}
          className={item.isComplete ? "line-through" : ""}
        >
          {item.item}
        </label>
      </Form>
      <Form method="post">
        <input type="hidden" name="id" value={item._id} />
        <button
          type="submit"
          name="_action"
          value="delete"
          className="active:scale-[.97] transition ease-in-out duration-300 bg-red-500 p-2"
        >
          X
        </button>
      </Form>
    </li>
  );
}
