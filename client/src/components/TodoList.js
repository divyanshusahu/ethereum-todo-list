import React from "react";
import Web3 from "web3";

import {
  Pane,
  Card,
  Heading,
  Paragraph,
  Badge,
  Pill,
  TextInput,
  Button,
  toaster
} from "evergreen-ui";

import todoListABI from "../data/TodoList.json";

function TodoList() {
  const [account, setAccount] = React.useState(null);
  const [todoListConnection, setTodoListConnection] = React.useState(null);
  const [taskCount, setTaskCount] = React.useState(null);
  const [newTaskInput, setNewTaskInput] = React.useState("");
  const [todoListTasks, setTodoListTasks] = React.useState([]);

  let web3js;

  const loadBlockchainData = async () => {
    web3js = new Web3("http://localhost:8545");
    const userAccount = await web3js.eth.getAccounts();
    setAccount(userAccount[1]);
    const todoListContractAddress =
      "0x9537b202e6B3b329e4a58373271BF46e63B11f49";
    let tlc = new web3js.eth.Contract(todoListABI.abi, todoListContractAddress);
    setTodoListConnection(tlc);
    let tc = await tlc.methods.taskCount().call();
    setTaskCount(tc);
    let t = [];
    for (let i = 1; i <= taskCount; i++) {
      let x = await tlc.methods.tasks(i).call();
      t.push(x);
    }
    setTodoListTasks(t);

    tlc.events.taskCreated().on("data", event => {
      let task = event.returnValues;
      let temp = todoListTasks;
      temp.push(task);
      setTodoListTasks(temp);
    });
  };

  React.useEffect(() => {
    loadBlockchainData();
  }, []);

  const createTask = () => {
    if (newTaskInput.length < 10) {
      return toaster.danger("Task content too small", {
        description: "Task content must be ten characters long"
      });
    }
    toaster.notify("Creating a new task");
    return todoListConnection.methods
      .createTask(newTaskInput)
      .send({ from: account })
      .on("receipt", receipt => {
        console.log(receipt);
        toaster.success("Task added successfully!");
        setTaskCount(taskCount+1);
      })
      .on("error", error => {
        console.log(error);
        //toaster.danger("Task failed to add", { description: error });
      });
  };

  return (
    <Pane
      display="flex"
      alignItems="center"
      justifyContent="center"
      margin={0}
      padding={64}
      background="tint2"
    >
      <Card
        display="flex"
        alignItems="center"
        justifyContent="center"
        padding={32}
        elevation={4}
        background="white"
      >
        <div id="todolist_root">
          <div id="todolist_header">
            <Heading size={900} marginTop="union">
              Ethereum based Todo List
            </Heading>
            <Paragraph size={500}>
              Your ethereum account:{" "}
              <Badge color="teal" isInteractive isSolid>
                {account}
              </Badge>
            </Paragraph>
            <Paragraph size={500}>
              Current number of tasks{" "}
              <Pill color="teal" isInteractive isSolid>
                {taskCount}
              </Pill>
            </Paragraph>
          </div>
          <div id="todolist_action" style={{ marginTop: "16px" }}>
            <TextInput
              name="new_task_input"
              id="new_task_input"
              placeholder="Enter new task here"
              marginRight={32}
              onChange={event => setNewTaskInput(event.target.value)}
            />
            <Button appearance="primary" iconBefore="add" onClick={createTask}>
              Create New Task
            </Button>
          </div>
        </div>
      </Card>
    </Pane>
  );
}

export default TodoList;
