import { client, ObjectId } from "../mongoClient.server";

let db = client.db("todos");
let collection = db.collection("todos");

export async function createTodoItem(todo) {
  let todoObj = {
    item: todo,
    isComplete: false,
  };

  let result = await collection.insertOne(todoObj);
  return result;
}

export async function getTodoItems() {
  let result = collection.find().toArray();
  return result;
}

export async function updateTodoItem(id) {
  let result = await collection.updateOne({ _id: new ObjectId(id) }, [
    {
      $set: {
        isComplete: {
          $not: "$isComplete",
        },
      },
    },
  ]);
  return result;
}

export async function deleteTodoItem(id) {
  let result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result;
}
