pragma solidity >=0.5.0;

contract TodoList {
  uint16 public taskCount = 0;

  struct Task {
    uint16 id;
    string content;
    bool complete;
  }

  mapping(uint => Task) public tasks;
  /*
    event logging cost gas. Therefore it is removed.

    event taskCreated(uint16 id, string content);
    event taskStatusUpdated(uint16 id, bool complete);
    event taskContentEdited(uint16 id, string content);
  */
  function createTask(string calldata _content) external {
    taskCount++;
    tasks[taskCount] = Task(taskCount, _content, false);
    //emit taskCreated(taskCount, _content);
  }

  function updateTaskStatus(uint16 _id, bool _complete) external {
    tasks[_id].complete = _complete;
    //emit taskStatusUpdated(_id, _complete);
  }

  function editTaskContent(uint16 _id, string calldata _content) external {
    tasks[_id].content = _content;
    //emit taskContentEdited(_id, _content);
  }
}