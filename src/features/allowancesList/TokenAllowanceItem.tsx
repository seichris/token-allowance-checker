import React, {useEffect} from 'react'
import {AllowanceId, fetchAllowanceValueThunk, QueryStates} from './AllowancesListSlice'
import {useDispatch, useSelector} from 'react-redux'
import { RootState } from 'app/rootReducer'
import {Table, Loader, Popup, Button, ButtonProps} from 'semantic-ui-react'
import AddressDisplay from 'components/AddressDisplay'
import bnToDisplayString from '@triplespeeder/bn2string'
import BN from 'bn.js'
import { openEditAllowanceModal } from 'features/editAllowance/EditAllowanceSlice'

interface TokenAllowanceItemProps {
    allowanceId: AllowanceId
}

const unlimitedAllowance = new BN(2).pow(new BN(256)).subn(1)

const TokenAllowanceItem = ({allowanceId}:TokenAllowanceItemProps) => {
    const dispatch = useDispatch()
    const allowance       = useSelector((state:RootState) => state.allowances.allowancesById[allowanceId])
    const allowanceValue  = useSelector((state:RootState) => state.allowances.allowanceValuesById[allowanceId])
    const owner           = useSelector((state:RootState) => state.addresses.addressesById[allowance.ownerId])
    const spender         = useSelector((state:RootState) => state.addresses.addressesById[allowance.spenderId])
    const tokenContract   = useSelector((state:RootState) => state.tokenContracts.contractsById[allowance.tokenContractId])
    const walletAddressId = useSelector((state:RootState) => state.addresses.walletAddressId)

    // trigger loading of allowance value if necessary
    useEffect(()=>{
        if (allowanceValue.state === QueryStates.QUERY_STATE_INITIAL) {
            dispatch(fetchAllowanceValueThunk(allowanceId))
        }
    }, [allowanceValue, allowanceId])

    let allowanceElement, criticalAllowance
    switch(allowanceValue.state) {
        case QueryStates.QUERY_STATE_RUNNING:
            allowanceElement = <Loader active inline size={'mini'}/>
            break
        case QueryStates.QUERY_STATE_COMPLETE:
            criticalAllowance = (allowanceValue.value.eq(unlimitedAllowance)) || (allowanceValue.value.gte(tokenContract.totalSupply))
            if (criticalAllowance) {
                allowanceElement = <em>unlimited</em>
            } else {
                const roundToDecimals = new BN('2')
                const {precise, rounded} = bnToDisplayString({
                    value: allowanceValue.value,
                    decimals: tokenContract.decimals,
                    roundToDecimals
                })
                allowanceElement = <span>{rounded}</span>
            }
            break
        case QueryStates.QUERY_STATE_ERROR:
            allowanceElement = <span>error</span>
            break
        case QueryStates.QUERY_STATE_INITIAL:
        default:
            allowanceElement = ''
    }

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>, data: ButtonProps) => {
        event.preventDefault();
        dispatch(openEditAllowanceModal(allowanceId))
    }

    const editEnabled = allowance.ownerId === walletAddressId
    const actionContent = <Popup
        content={editEnabled ? 'edit allowance' : 'Only address owner can edit allowance'}
        trigger={<span>
            <Button
                icon={'edit'}
                size={'small'}
                compact
                primary
                disabled={!editEnabled}
                onClick={handleClick}
            />
        </span>}
    />

    return (
        <Table.Row key={`${allowanceId}`}>
            <Table.Cell>
                <AddressDisplay addressId={allowance.spenderId}/>
            </Table.Cell>
            <Table.Cell negative={criticalAllowance}>
                {allowanceElement}
            </Table.Cell>
            <Table.Cell>
                {actionContent}
            </Table.Cell>
        </Table.Row>
    )
}

export default TokenAllowanceItem