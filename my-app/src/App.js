import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import './App.css';


function App() {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false); //статус подключения
  const [isAdded, setIsAdded] = useState(false); //проверка добавлен ли
  const [errorMessage, setErrorMessage] = useState(''); //ошибка

  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS
  const contractABI = [
    { "inputs": [], "name": "addWallet", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "addedWallets", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "getWallets", "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "wallets", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }
  ];
  useEffect(() => {
    initWeb3();
  }, []);

  // Функция для инициализации Web3 и контракта
  const initWeb3 = async () => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      // Инициализируем контракт
      const contractInstance = new web3Instance.eth.Contract(contractABI, contractAddress);
      setContract(contractInstance);

      // Если уже подключен кошелек
      const accounts = await web3Instance.eth.getAccounts();
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        checkIfUserAdded(contractInstance, accounts[0]);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  // Функция для подключения кошелька и запуска MetaMask
  const connectWallet = async () => {
    try {

      // запуск окна MetaMask 
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]); // устанавливаем аккаунт
      setIsConnected(true);// устанавливаем статус подключения
      checkIfUserAdded(contract, accounts[0]); //проверяем регистрацию контракта
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const addWallet = async () => {
    try {
      await contract.methods.addWallet().send({ from: account });
      setIsAdded(true);
    } catch (error) {
      console.error("Error adding wallet:", error);
    }
  };

  const checkIfUserAdded = async (contractInstance, userAccount) => {
    const wallets = await contractInstance.methods.getWallets().call();
    if (wallets.includes(userAccount)) {
      setIsAdded(true);
    }
  };

  const handleButtonClick = () => {
    if (window.ethereum) {
      connectWallet();
    } else {
      setErrorMessage('Вы не запустили metamask');
    }
  };
  return (
    <div className="App">
      <header className="App-header">
        {!isConnected ? (
          <>
            <button className='button' onClick={handleButtonClick}>Connect Wallet</button>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
          </>
        ) : (
          <>
            <h1>Привет, вы зарегистрированы!</h1>
            <p>{account.slice(-5)}, поздравляем! </p>
            <button className='button' onClick={addWallet} disabled={isAdded}>
              {isAdded ? 'Ты уже с нами' : 'Добавь свой кошелек'}
            </button>
          </>
        )}
      </header>
    </div>
  );
}

export default App;