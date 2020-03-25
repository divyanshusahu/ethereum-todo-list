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
  Switch,
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
        // ! Event subscriptions is not provided by HttpProvider.
        // web3 = new Web3("http://localhost:8545"); // port 8545 ganache-cli port.
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
      "0xc4B1E15e241472EDB62E34237fCB41c4444e9A15"; // Paste your contract address here
    let tlc = new web3.eth.Contract(todoListABI.abi, todoListContractAddress);
    setTodoListConnection(tlc);

    let tc = await tlc.methods.taskCount().call();
    setTaskCount(parseInt(tc));
    let t = [];
    for (let i = 1; i <= tc; i++) {
      let x = await tlc.methods.tasks(i).call();
      let xi = { id: x.id, content: x.content, complete: x.complete };
      t.push(xi);
    }
    setTodoListTasks(t);

    /*
      ! Event cost gas. Therefore it is removed.
      tlc.events.taskCreated({}, (error, data) => {
          if (error) {
            console.log(error);
            return;
          }
          setTodoListTasks([...todoListTasks, data.returnValues]);
        });

        tlc.events.taskStatusUpdated({}, (error, data) => {
          if (error) {
            console.log(error);
            return;
          }
          let temp = todoListTasks;
          temp[parseInt(data.returnValues["id"]) - 1] = data.returnValues["complete"];
          setTodoListTasks(temp);
        });

        tlc.events.taskContentEdited({}, (error, data) => {
          if (error) {
            console.log(error);
            return;
          }
          let temp = todoListTasks;
          temp[parseInt(data.returnValues["id"])-1] = data.returnValues.content;
          setTodoListTasks(todoListTasks);
        })
    */
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
    toaster.notify("Creating a new task", { id: "createTaskToaster" });
    /*
     * In production mode we don't need to specifty the gas
     * amount. Metamask will take care of it automatically.
     * Either way the excess gas amount will be automatically
     * refunded to the user account.
     */
    return todoListConnection.methods
      .createTask(newTaskInput)
      .send({ from: account, gas: 300000 })
      .on("receipt", receipt => {
        /*
          ? Events can also be accessed by receipt with
          ? receipt.events.eventName.returnValues
        */
        toaster.success("Task added successfully!", {
          id: "createTaskToaster"
        });
        let temp = {
          id: taskCount + 1,
          content: newTaskInput,
          complete: false
        };
        setTodoListTasks([...todoListTasks, temp]);
        setTaskCount(taskCount + 1);
        setNewTaskInput("");
      })
      .on("error", error => {
        toaster.danger("Task failed to add", {
          description: error.message,
          id: "createTaskToaster"
        });
      });
  };

  const updateTaskStatus = (event, id) => {
    toaster.notify("Updating task status", { id: "markTaskCompleteToaster" });
    let taskStatus = event.target.checked;
    return todoListConnection.methods
      .updateTaskStatus(id, taskStatus)
      .send({ from: account, gas: 300000 })
      .on("receipt", receipt => {
        toaster.success("Task Updated successfully", {
          id: "markTaskCompleteToaster"
        });
        let temp = todoListTasks;
        temp[id - 1]["complete"] = taskStatus;
        /*
          ? react state updater used by useState will not update UI if new value
          ? equals previous value. There new array with same value is used to
          ? update the state. Don't use setTodoListTasks(temp). It won't work.
        */
        setTodoListTasks([...temp]);
      })
      .on("error", error => {
        toaster.danger("Task updation failed!", {
          description: error.message,
          id: "markTaskCompleteToaster"
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
              value={newTaskInput}
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
                      <Switch
                        checked={t.complete}
                        style={{ float: "right" }}
                        onChange={e => updateTaskStatus(e, t.id)}
                      />
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
