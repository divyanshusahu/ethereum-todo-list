import React from "react";
import Web3 from "web3";

import { Pane, Card, Heading, Text } from "evergreen-ui";

function TodoList() {
  const [account, setAccount] = React.useState(null);

  const loadBlockchainData = async () => {
    const web3 = new Web3("http://localhost:8545");
    const userAccount = await web3.eth.getAccounts();
    console.log(userAccount);
    setAccount(userAccount[0]);
  };

  React.useEffect(() => {
    loadBlockchainData();
  }, []);

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
        <div>
          <Heading size={900} marginTop="union">
            Ethereum based Todo List
          </Heading>
          <Text size={500}>Your ethereum account: {account}</Text>
        </div>
      </Card>
    </Pane>
  );
}

export default TodoList;
