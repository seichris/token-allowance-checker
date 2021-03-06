import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import Onboard from 'bnc-onboard'
import Web3 from 'web3'
import { AppDispatch, AppThunk } from '../../app/store'
import { API, WalletInitOptions } from 'bnc-onboard/dist/src/interfaces'
import { AddressId, setWalletAddressThunk } from '../addressInput/AddressSlice'

const onboardApiKey = 'f4b71bf0-fe50-4eeb-bc2b-b323527ed9e6'
const infuraApiKey = '7f230a5ca832426796454c28577d93f2'

const wallets: Partial<WalletInitOptions>[] = [
    { walletName: 'metamask', preferred: true },
    { walletName: 'coinbase', preferred: true },
    {
        walletName: 'walletConnect',
        infuraKey: infuraApiKey,
        preferred: true,
    },
    { walletName: 'trust', preferred: true },
    { walletName: 'dapper', preferred: true },
    { walletName: 'authereum', preferred: true },
    { walletName: 'opera' },
    { walletName: 'status' },
    { walletName: 'operaTouch' },
    { walletName: 'torus' },
    { walletName: 'status' },
    {
        walletName: 'ledger',
        rpcUrl: `mainnet.infura.io/v3/${infuraApiKey}`,
    },
    {
        walletName: 'trezor',
        appUrl: 'https://tac.dappstar.io',
        email: 'michael@m-bauer.org',
        rpcUrl: `mainnet.infura.io/v3/${infuraApiKey}`,
    },
]

// Define contents of onboard state
interface OnboardState {
    onboardAPI: API | null
    web3?: Web3
    networkId: number
    walletSelected: boolean
    prevWalletAddressId: AddressId | undefined
}

const initialState: OnboardState = {
    networkId: 0,
    onboardAPI: null,
    walletSelected: false,
    prevWalletAddressId: undefined,
}

const onboardSlice = createSlice({
    name: 'onboard',
    initialState: initialState,
    reducers: {
        setOnboardAPI(state, action: PayloadAction<API>) {
            state.onboardAPI = action.payload
        },
        setWeb3Instance(state, action: PayloadAction<Web3>) {
            state.web3 = action.payload
        },
        setNetworkId(state, action: PayloadAction<number>) {
            state.networkId = action.payload
        },
        setPrevWalletAddressId(state, action: PayloadAction<string>) {
            state.prevWalletAddressId = action.payload
        },
        setWalletSelected(state, action: PayloadAction<boolean>) {
            state.walletSelected = action.payload
        },
    },
})

export const {
    setOnboardAPI,
    setNetworkId,
    setWeb3Instance,
    setWalletSelected,
    setPrevWalletAddressId,
} = onboardSlice.actions

export default onboardSlice.reducer

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const selectWallet = (history: any): AppThunk => async (
    dispatch,
    getState
) => {
    console.log(`Selecting wallet...`)
    const onboardAPI = getState().onboard.onboardAPI
    if (onboardAPI) {
        const result = await onboardAPI.walletSelect()
        dispatch(setWalletSelected(result))
        if (!result) {
            // send user back to home page
            history.push('/')
        }
    } else {
        console.log(`dispatched selectWallet() without initialization...`)
    }
}

export const checkWallet = (): AppThunk => async (dispatch, getState) => {
    console.log(`checking wallet...`)
    const onboardAPI = getState().onboard.onboardAPI
    if (onboardAPI) {
        const result = await onboardAPI.walletCheck()
        console.log(`walletCheck result: ${result}`)
    } else {
        console.log(`dispatched checkWallet() without initialization...`)
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const initialize = (history: any): AppThunk => async (
    dispatch: AppDispatch,
    getState
) => {
    console.log(`Initializing OnBoard.js...`)
    const onboard = Onboard({
        dappId: onboardApiKey,
        networkId: 1,
        subscriptions: {
            wallet: wallet => {
                dispatch(setWeb3Instance(new Web3(wallet.provider)))
            },
            address: address => {
                console.log(`Wallet address changed to ${address}!`)
                dispatch(setWalletAddressThunk(address))
                const { prevWalletAddressId } = getState().onboard
                //  Only trigger history push when user changed the wallet address
                if (
                    prevWalletAddressId &&
                    prevWalletAddressId !== address.toLowerCase()
                ) {
                    console.log(
                        `Pushing ${address}. Prev walletId: ${prevWalletAddressId}`
                    )
                    history.push(`/address/${address}`)
                }
                dispatch(setPrevWalletAddressId(address.toLowerCase()))
            },
            network: networkId => {
                dispatch(setNetworkId(networkId))
            },
            balance: () => {
                /* do nothing*/
            },
        },
        walletSelect: {
            heading: 'Select walletName',
            description: 'Select walletName description',
            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore
            wallets: wallets,
        },
    })
    dispatch(setOnboardAPI(onboard))
}
