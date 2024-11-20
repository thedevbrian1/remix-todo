import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { validateText } from "../.server/validation";
import { createTodoItem, getTodoItems } from "../models/todo";
// import { client } from "../mongoClient.server";

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

  return null;
}

export default function Index() {
  let todoItems = useLoaderData();
  console.log({ todoItems });

  let actionData = useActionData();

  return (
    <main>
      <div className="w-full mt-32 max-w-2xl mx-auto">
        <h1>Todo</h1>
        <Form method="post" className="bg-slate-500 p-4 rounded-md">
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
        <div className="bg-slate-500 p-4 rounded-md mt-8 divide-y divide-slate-600">
          {todoItems.map((todoItem) => (
            <TodoItem key={todoItem._id} item={todoItem} />
          ))}
        </div>
      </div>
    </main>
  );
}

function TodoItem({ item }) {
  return (
    <div className="flex gap-2 py-2">
      <input type="checkbox" name="complete" id={item._id} />
      <label htmlFor={item._id}>{item.item}</label>
    </div>
  );
}
