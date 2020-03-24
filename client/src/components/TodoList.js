import React from "react";
import Web3 from "web3";
import isEmpty from "is-empty";

import {
  Pane,
  Card,
  Heading,
  Paragraph,
  Badge,
  Pill,
  TextInput,
  Button,
  UnorderedList,
  ListItem,
  toaster
} from "evergreen-ui";

import todoListABI from "../data/TodoList.json";

function TodoList() {
  const [account, setAccount] = React.useState(null);
  const [todoListConnection, setTodoListConnection] = React.useState(null);
  const [taskCount, setTaskCount] = React.useState(null);
  const [newTaskInput, setNewTaskInput] = React.useState("");
  const [todoListTasks, setTodoListTasks] = React.useState([]);

  let web3;

  const loadBlockchainData = async () => {
    if (window.ethereum) {
      // modern browser
      if (process.env.NODE_ENV === "development") {
        // Event subscriptions is not provided by HttpProvider.
        //web3 = new Web3("http://localhost:8545"); // port 8545 ganache-cli port.
        web3 = new Web3();
        let eventProvider = new Web3.providers.WebsocketProvider(
          "ws://localhost:8545"
        );
        web3.setProvider(eventProvider);
      } else {
        web3 = new Web3(window.ethereum);
        try {
          window.ethereum.enable();
        } catch {
          console.log("need to enable");
        }
      }
    } else if (window.web3) {
      // legacy browser
      web3 = new Web3(window.web3.currentProvider);
    } else {
      // browser without Metamask.
      toaster.danger("Error. Metamask not installed.", {
        description: "You need to install Metamask for this app to work"
      });
    }

    const userAccount = await web3.eth.getAccounts();
    setAccount(userAccount[0]);
    const todoListContractAddress =
      "0x23d78370Ef7732E85906980cA03A3F5Feee78feF"; // Paste your contract address here
    let tlc = new web3.eth.Contract(todoListABI.abi, todoListContractAddress);
    setTodoListConnection(tlc);

    let tc = await tlc.methods.taskCount().call();
    setTaskCount(parseInt(tc));
    let t = [];
    for (let i = 1; i <= tc; i++) {
      let x = await tlc.methods.tasks(i).call();
      t.push(x);
    }
    setTodoListTasks(t);

    /*
      Subscriptions for an event in not supported by HttpProvider.
      Need to look how to use WebSocket with ganache.
    */
    web3.eth
      .subscribe(
        "logs",
        { fromBlock: "0x0", address: todoListContractAddress },
        (error, result) => {
          if (error) {
            console.log(error);
            return;
          }
          console.log(result.data);
        }
      )
      .on("data", event => {
        console.log(event);
      });
  };

  React.useEffect(() => {
    loadBlockchainData();
  }, []);

  const createTask = () => {
    if (newTaskInput.length < 10) {
      console.log(todoListConnection.events.taskCreated());
      return toaster.danger("Task content too small", {
        description: "Task content must be ten characters long"
      });
    }
    toaster.notify("Creating a new task", { id: "createTaskToaster" });
    /* 
      In production mode we don't need to specifty the gas
      amount. Metamask will take care of it automatically.
      Either way the excess gas amount will be automatically
      refunded to the user account.
    */
    return todoListConnection.methods
      .createTask(newTaskInput)
      .send({ from: account, gas: 300000 })
      .on("receipt", receipt => {
        toaster.success("Task added successfully!", {
          id: "createTaskToaster"
        });
        setTaskCount(taskCount + 1);
      })
      .on("error", error => {
        toaster.danger("Task failed to add", {
          description: error.message,
          id: "createTaskToaster"
        });
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
          <div id="todolist_tasks" style={{ marginTop: "16px" }}>
            <UnorderedList>
              {isEmpty(todoListTasks)
                ? null
                : todoListTasks.map(t => (
                    <ListItem
                      key={t.id}
                      icon={t.complete ? "tick-circle" : "ban-circle"}
                      iconColor={t.complete ? "success" : "danger"}
                    >
                      {t.content}
                    </ListItem>
                  ))}
            </UnorderedList>
          </div>
        </div>
      </Card>
    </Pane>
  );
}

export default TodoList;
