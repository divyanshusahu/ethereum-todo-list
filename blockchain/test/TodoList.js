const TodoList = artifacts.require("TodoList");

contract("TodoList", (account) => {
  let [alice, bob] = account;
  let contractInstance;
  let taskContent = "Task created from truffle test";
  beforeEach(async () => {
    contractInstance = await TodoList.new();
  });

  it("should to able to create new task", async () => {
    const result = await contractInstance.createTask(taskContent, { from: alice });
    assert.equal(result.receipt.status, true);
  });
})