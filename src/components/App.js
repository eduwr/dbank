import { Tabs, Tab } from "react-bootstrap";
import dBank from "../abis/dBank.json";
import React, { Component } from "react";
import Token from "../abis/Token.json";
import dbank from "../dbank.png";
import Web3 from "web3";
import "./App.css";

//h0m3w0rk - add new tab to check accrued interest

class App extends Component {
  async componentWillMount() {
    await this.loadBlockchainData(this.props.dispatch);
  }

  async loadBlockchainData(dispatch) {
    if (typeof window.ethereum !== "undefined") {
      const web3 = new Web3(window.ethereum);
      const netId = await web3.eth.net.getId();
      const [account] = await web3.eth.getAccounts();

      if (typeof account !== "undefined") {
        const balance = await web3.eth.getBalance(account);

        this.setState({
          account,
          balance,
          web3,
        });
      } else {
        window.alert("Please login with metamask");
      }

      try {
        // Token
        const token = new web3.eth.Contract(
          Token.abi,
          Token.networks[netId].address
        );
        // Bank
        const dbank = new web3.eth.Contract(
          dBank.abi,
          dBank.networks[netId].address
        );
        const dBankAddress = dBank.networks[netId].address;

        const tokenBalance = await token.methods
          .balanceOf(this.state.account)
          .call();
        console.log("BALANCE", web3.utils.fromWei(tokenBalance));

        this.setState({
          token,
          dbank,
          dBankAddress,
          tokenBalance: web3.utils.fromWei(tokenBalance),
        });
      } catch (error) {
        console.log("Error", error);
        window.alert("Contract not deployed");
      }
    } else {
      window.alert("Please install metamask");
    }

    //assign to values to variables: web3, netId, accounts

    //check if account is detected, then load balance&setStates, elsepush alert

    //in try block load contracts

    //if MetaMask not exists push alert
  }

  async deposit(amount) {
    if (this.state.dbank !== "undefined") {
      try {
        await this.state.dbank.methods.deposit().send({
          value: amount,
          from: this.state.account,
        });
      } catch (error) {
        console.log(error);
      }
    }
  }

  async withdraw(e) {
    e.preventDefault();
    if (this.state.dbank !== "undefined") {
      try {
        await this.state.dbank.methods.withdraw().send({
          from: this.state.account,
        });
      } catch (error) {
        console.log(error);
      }
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      web3: "undefined",
      account: "",
      token: null,
      dbank: null,
      balance: 0,
      dBankAddress: null,
      tokenBalance: "",
    };
  }

  render() {
    return (
      <div className="text-monospace">
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.dappuniversity.com/bootcamp"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={dbank} className="App-logo" alt="logo" height="32" />
            <b>dBank</b>
          </a>
        </nav>
        <div className="container-fluid mt-5 text-center">
          <br></br>
          <h1>Welcome to dBank</h1>
          <h2>{this.state.account}</h2>
          <br></br>
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example">
                  <Tab eventKey="deposit" title="Deposit">
                    <div>
                      <br></br>
                      How much you want to deposit?
                      <br />
                      (min. amount is 0.01 ETH)
                      <br></br>
                      (1 deposit is possible at the time)
                      <br></br>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const amount = this.state.web3.utils.toWei(
                            this.depositAmount.value
                          );
                          this.deposit(amount);
                        }}
                      >
                        <div className="form-group m-sm-2">
                          <br></br>
                          <input
                            id="depositAmount"
                            step="0.01"
                            type="number"
                            min="0.01"
                            placeholder="ETH amount"
                            required
                            ref={(input) => {
                              this.depositAmount = input;
                            }}
                          ></input>
                        </div>
                        <button type="submit" className="btn btn-primary">
                          DEPOSIT
                        </button>
                      </form>
                    </div>
                  </Tab>
                  <Tab eventKey="withdraw" title="Withdraw">
                    <div>
                      <br></br>
                      Do you want to withdraw + take interest?
                      <br></br>
                      <p>
                        Your current interest balance is{" "}
                        <span>{this.state.tokenBalance} ETH</span>
                      </p>
                      <br></br>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        onClick={(e) => this.withdraw(e)}
                      >
                        WITHDRAW
                      </button>
                    </div>
                  </Tab>
                </Tabs>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
