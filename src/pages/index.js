import Head from 'next/head'
import { useEffect, useState } from "react";
import Image from 'next/image'
import { Inter } from 'next/font/google'
import { BigNumber, ethers } from "ethers";
import styles from '@/styles/Home.module.css'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import contractABI from ".//ABI/contract-abi.json"
import { useIsMounted } from './hooks/useIsMounted';
import { usePrepareContractWrite, useContractWrite, useContractRead, useAccount, useWaitForTransaction, useSigner } from 'wagmi';

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  // Wagmi is reading from window.ethereum object, wallets like metamask inject an ethereum object into
  // the global javascript DOM of window.ethereum, wagmi tries to use it but because of how react/nextjs work
  // and because we have "isConnected && ..." in part of the render (js being returned and using value of isConnected)
  // , when the page is first rendered it doesn't have access to the window object so can't access window.ethereum
  // tries to render it but by the time it actually does the component has mounted and now it does have access
  // to it, so the value changes, shows up as a hydration error becuase what it thought the intial UI was going to 
  // be is not what it ended up being.
  const mounted = useIsMounted();
  const { isConnected } = useAccount();

  const contractAddress = "0x3cE83C1A95e732118ab7F7c434654Fc7677E46aa"

  const { data: entranceFee } = useContractRead({
    address: contractAddress,
    abi: contractABI,
    functionName: "getEntranceFee",
    watch: true
  })

  const { data: currentPlayers } = useContractRead({
    address: contractAddress,
    abi: contractABI,
    functionName: "currentPlayers",
    watch: true
  })

  const { data: recentWinner } = useContractRead({
    address: contractAddress,
    abi: contractABI,
    functionName: "recentWinner",
    watch: true
  })

  const { config } = usePrepareContractWrite({
    address: contractAddress,
    abi: contractABI,
    functionName: 'enter',
    args: [{ value: entranceFee?.toString() }]
  });
  const { data: txData, isLoading: loading, isSuccess: success, write } = useContractWrite(config);

  const { isSuccess } = useWaitForTransaction({
    hash: txData?.hash,
  })

  return (
    <>
      <ConnectButton />
      <p>Welcome to Smart Contract Lottery</p>
      {mounted && isConnected ? <p>Current entrance fee (wei): {entranceFee?.toString()}</p> : <p>No data to display</p>}
      {mounted && isConnected ? <p>Current players: {currentPlayers?.toString()}</p> : <p>No players to display</p>}
      {mounted && isConnected ? <p>Recent Winner: {recentWinner?.toString()}</p> : <p>No winners to display</p>}
      {mounted && isConnected ? <button class={styles.button} disabled={!write} onClick={() => write?.({ overrides: { value: entranceFee?.toString() } })}>Enter Lottery!</button> : <p>No button</p>}
      {isSuccess && (
        <div>
          Successful!
          <div>
            <a href={`https://goerli.etherscan.io/tx/${txData?.hash}`}>Etherscan</a>
          </div>
        </div>
      )}
    </>
  )
}