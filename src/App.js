import './App.css';
import {useEffect, useState} from "react"
import { ethers, Signer, utils } from 'ethers';
import { CA } from "./utils/contract";
import {BANK_ABI} from "./utils/abi"
import './styles/output.css'

function App() {
  const[isWalletConnected, setIsWalletConnected] =useState(false);
  const[account,setAccount] = useState(null);
  const[error, setError] = useState(null);
  const [bankName, setBankName] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [addressTo, setAddressTo] = useState("");
  const [cusBal, setCusBal] = useState("");
  const [contractBal, setContractBal] = useState(null);
  const[bankOwner, setBankOwner] = useState("");

  const connectWallet = async() =>{
    try {
      if (window.ethereum) {
        const accounts =await window.ethereum.request({method:'eth_requestAccounts'});
        const account = accounts[0];
        setAccount(account);
        setIsWalletConnected(true);
        console.log(account);
        getBankName();
      } else {
        setError("Please connect Metamask");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getBankName = async() =>{
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner();
        const bankDapp = new ethers.Contract(CA, BANK_ABI,signer);
        const bankName = await bankDapp.bankName()
        setBankName(bankName);
        console.log(bankName);
      } else {
        setError("Connect Metamask wallet")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const connectBankName = async(e) =>{
    e.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankDapp = new ethers.Contract(CA,BANK_ABI,signer);
        const setName = await bankDapp.setBankName(bankName);
        console.log("setting bank name...");
        await setName.wait();
        console.log("bank name set");
        setBankName(setName);
        getBankName();
      } else {
        setError("Connect to metamask");
      }
    } catch (error) {
     console.log(error); 
    }
  }

  const onChangeHandler = ({target}) =>{
    switch (target.id) {
      case "setBankName":
        setBankName(target.value);
        break;
      case "deposit":
        setDepositAmount(target.value);
        break;
      case "withdraw":
        setWithdrawAmount(target.value);
        break;
      case "to":
        setAddressTo(target.value);
        break;
      default:
        break;
    }
  }

  const depositMoney = async(e) =>{
    e.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankDapp = new ethers.Contract(CA,BANK_ABI,signer);
        const amount = {value:ethers.utils.parseEther(depositAmount)}
        const deposit = await bankDapp.depositMoney(amount);
        console.log("depositing");
        deposit.wait();
        setDepositAmount(deposit);
        console.log("Deposited");
        console.log(depositAmount);
        costumerBal();
      } else {
        setError("Connect your wallet");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const withdraw =async (e) =>{
    e.preventDefault()
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankDapp = new ethers.Contract(CA,BANK_ABI,signer);
        const withdrawal = ethers.utils.parseEther(withdrawAmount)
        const withdrawMoney = await bankDapp.withdrawMoney(account,withdrawal)
        withdrawMoney.wait();
        console.log("...withdrawing");
        console.log(withdrawAmount);
        console.log("sent to");
        console.log(addressTo);
        costumerBal();
      } else {
        setError("Connect web3provider")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const costumerBal = async() =>{
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const bankDapp = new ethers.Contract(CA,BANK_ABI,signer);
    const customerBal = await bankDapp.getCustomerBalance();
    setCusBal(ethers.utils.formatUnits(customerBal.toString(),18));
    console.log(cusBal);
  }

  const getBankOwner =async () =>{
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const bankDapp = new ethers.Contract(CA,BANK_ABI,signer)
    const bankOwner = await bankDapp.bankOwner()
    console.log("Bank owner is:",bankOwner);
    setBankOwner(bankOwner)
  }

  // const bankBal = async() =>{
  //   try {
  //     if (window.ethereum) {
  //     const provider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_RPC_URL);
  //     // const signer = provider.getSigner();
  //     const bankDapp = new ethers.Contract(CA,BANK_ABI,provider);
  //     const contractbankDapp =await bankDapp.getBankBalance();
  //     setContractBal(ethers.utils.formatUnits(contractbankDapp.toString(),18));
  //     console.log(contractBal);
  //     } else {
  //       setError("CAONNECT TO METAMASK")
  //     }
     
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }
  
  useEffect(()=>{
  // connectWallet();
  costumerBal();
  getBankOwner();
  //bankBal();

  },[])

  return (
    <div className="bg-indigo-900 h-screen major-container">
      <h1>Bank Contract Project</h1>
      <div className='minor-container'>
        <div className='form-div'>
          <h3 className='bankName'>Bank of Cadena</h3>
          <form onSubmit={depositMoney} className="form">
            <input type="text" name="" id="deposit" placeholder='0.000 ETH' onChange={onChangeHandler}/>
            <button className='bg-indigo-900'>deposit money in eth</button>
          </form>
          <form onSubmit={withdraw} className="form">
            <input type="text" name="" id="withdraw" placeholder='0.000 ETH' onChange={onChangeHandler} />
            {/* <input type="text" placeholder='receiver address'  id="to" onChange={onChangeHandler}/> */}
            <button className='bg-indigo-900'>withdraw money in eth</button>
          </form>
        </div>
        <div className='detail-div'>
          <p className='decoration-white'>Customer balance:{cusBal}</p>
          <p className='decoration-white'>Bank Owner Address:{bankOwner}</p>
          <p className='decoration-white'>Your Wallet Address:{account}</p>
          {isWalletConnected ? 
          <button onClick={connectWallet} style={{width: "10em",backgroundColor: "lightblue",color: "white", padding:"1%", borderRadius: "5px" }}>Wallet Connected 🔒</button> 
        : <button onClick={connectWallet} style={{width: "10em",backgroundColor: "lightblue",color: "white", padding:"1%", borderRadius: "5px"}}>Connect wallet 🔑</button>}  
        </div>
      </div>
    </div>
  );
}

export default App;
