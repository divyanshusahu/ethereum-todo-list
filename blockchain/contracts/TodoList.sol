pragma solidity >=0.5.0;

contract TodoList {
  uint16 taskCount = 0;

  struct Task {
    uint16 id;
    string content;
    bool complete;
  }

  mapping(uint => Task) public tasks;

  event taskCreated(uint16 _id, string _content);
  event taskCompleted(uint16 _id);
  event taskContentEdited(uint16 _id);

  function createTask(string calldata _content) external {
    taskCount++;
    tasks[taskCount] = Task(taskCount, _content, false);
    emit taskCreated(taskCount, _content);
  }

  function markTaskComplete(uint16 _id) external {
    tasks[_id].complete = true;
    emit taskCompleted(_id);
  }

  function editTaskContent(uint16 _id, string calldata _content) external {
    tasks[_id].content = _content;
    emit taskContentEdited(_id);
  }
}