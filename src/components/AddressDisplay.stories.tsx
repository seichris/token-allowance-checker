import React from 'react'
import AddressDisplay from './AddressDisplay'
import { Container } from 'semantic-ui-react'
import {
    EthAddress,
    ResolvingStates,
} from '../features/addressInput/AddressSlice'

export default {
    title: 'AddressDisplay',
    component: AddressDisplay,
    decorators: [
        (story: () => React.ReactNode) => <Container>{story()}</Container>,
    ],
}

const resolvingEns: EthAddress = {
    address: '0x0D0707963952f2fBA59dD06f2b425ace40b492Fe',
    resolvingState: ResolvingStates.Resolving,
}
const withEns: EthAddress = {
    address: '0x0D0707963952f2fBA59dD06f2b425ace40b492Fe',
    ensName: 'cool.stuff.eth',
    resolvingState: ResolvingStates.Resolved,
}
const withEsName: EthAddress = {
    address: '0x0D0707963952f2fBA59dD06f2b425ace40b492Fe',
    esContractName: 'Payroll',
    resolvingState: ResolvingStates.Resolved,
}
const withAllNames: EthAddress = {
    address: '0x0D0707963952f2fBA59dD06f2b425ace40b492Fe',
    ensName: 'cool.stuff.eth',
    esContractName: 'Payroll',
    resolvingState: ResolvingStates.Resolved,
}
const withoutEns: EthAddress = {
    address: '0x0D0707963952f2fBA59dD06f2b425ace40b492Fe',
    resolvingState: ResolvingStates.Resolved,
}

const AddressDisplayProps = {
    resolvedAddress: withEns,
    resolvingAddress: resolvingEns,
    resolvedWithoutEns: withoutEns,
    resolvedWithEsName: withEsName,
    resolvedWithAllNames: withAllNames,
}

export const resolving = () => (
    <AddressDisplay ethAddress={AddressDisplayProps.resolvingAddress} />
)

export const noENS = () => (
    <AddressDisplay ethAddress={AddressDisplayProps.resolvedWithoutEns} />
)

export const withENS = () => (
    <AddressDisplay ethAddress={AddressDisplayProps.resolvedAddress} />
)

export const withEs = () => (
    <AddressDisplay ethAddress={AddressDisplayProps.resolvedWithEsName} />
)

export const withAll = () => (
    <AddressDisplay ethAddress={AddressDisplayProps.resolvedWithAllNames} />
)
