import React from 'react'
import { Amount, Token, Transaction } from '@pooltogether/hooks'
import {
  Tooltip,
  ModalProps,
  SquareButton,
  SquareButtonTheme,
  SquareLink,
  ButtonLink,
  SquareButtonSize
} from '@pooltogether/react-components'
import { PrizePool } from '@pooltogether/v4-js-client'
import { Trans, useTranslation } from 'react-i18next'

import { TxButtonNetworkGated } from 'lib/components/Input/TxButtonNetworkGated'
import { ModalNetworkGate } from 'lib/components/Modal/ModalNetworkGate'
import { ModalTitle } from 'lib/components/Modal/ModalTitle'
import { ModalTransactionSubmitted } from 'lib/components/Modal/ModalTransactionSubmitted'
import { DepositAllowance } from 'lib/hooks/Tsunami/PrizePool/useUsersDepositAllowance'
import { useSelectedChainId } from 'lib/hooks/useSelectedChainId'
import { EstimatedDepositGasItem } from 'lib/components/InfoList/EstimatedGasItem'
import { ModalApproveGate } from 'lib/views/Deposit/ModalApproveGate'
import { ModalLoadingGate } from 'lib/views/Deposit/ModalLoadingGate'
import { InfoListItem, ModalInfoList } from 'lib/components/InfoList'
import { useIsWalletOnNetwork } from 'lib/hooks/useIsWalletOnNetwork'
import { EstimateAction } from 'lib/hooks/Tsunami/useEstimatedOddsForAmount'
import { UpdatedOdds } from 'lib/components/UpdatedOddsListItem'
import { BottomSheet } from 'lib/components/BottomSheet'
import { AmountBeingSwapped } from 'lib/components/AmountBeingSwapped'
import Link from 'next/link'
import { useRouter } from 'next/router'

interface DepositConfirmationModalProps extends Omit<ModalProps, 'children'> {
  prizePool: PrizePool
  token: Token
  ticket: Token
  amountToDeposit: Amount
  depositAllowance: DepositAllowance
  isDataFetched: boolean
  approveTx: Transaction
  depositTx: Transaction
  sendApproveTx: () => void
  sendDepositTx: () => void
  resetState: () => void
}

export const DepositConfirmationModal = (props: DepositConfirmationModalProps) => {
  const {
    prizePool,
    token,
    ticket,
    amountToDeposit,
    depositAllowance,
    isDataFetched,
    approveTx,
    depositTx,
    sendApproveTx,
    sendDepositTx,
    resetState,
    isOpen,
    closeModal
  } = props
  const { amount, amountUnformatted } = amountToDeposit

  const { chainId } = useSelectedChainId()
  const { t } = useTranslation()

  const isWalletOnProperNetwork = useIsWalletOnNetwork(chainId)

  if (!isWalletOnProperNetwork) {
    return (
      <BottomSheet
        label={t('confirmDepositModal', 'Confirm deposit - modal')}
        open={isOpen}
        onDismiss={closeModal}
      >
        <ModalTitle chainId={chainId} title={t('wrongNetwork', 'Wrong network')} />
        <ModalNetworkGate chainId={chainId} className='mt-8' />
      </BottomSheet>
    )
  }

  if (!isDataFetched) {
    return (
      <BottomSheet
        label={t('confirmDepositModal', 'Confirm deposit - modal')}
        open={isOpen}
        onDismiss={closeModal}
      >
        <ModalTitle chainId={chainId} title={t('loadingYourData', 'Loading your data')} />
        <ModalLoadingGate className='mt-8' />
      </BottomSheet>
    )
  }

  if (amountUnformatted && depositAllowance?.allowanceUnformatted.lt(amountUnformatted)) {
    return (
      <BottomSheet
        label={t('confirmDepositModal', 'Confirm deposit - modal')}
        open={isOpen}
        onDismiss={closeModal}
      >
        <ModalTitle chainId={chainId} title={t('approveDeposits', 'Approve deposits')} />
        <ModalApproveGate
          chainId={chainId}
          prizePool={prizePool}
          approveTx={approveTx}
          sendApproveTx={sendApproveTx}
          className='mt-8'
        />
      </BottomSheet>
    )
  }

  if (depositTx && depositTx.sent) {
    if (depositTx.error) {
      return (
        <BottomSheet
          label={t('confirmDepositModal', 'Confirm deposit - modal')}
          open={isOpen}
          onDismiss={closeModal}
        >
          <ModalTitle chainId={chainId} title={t('errorDepositing', 'Error depositing')} />
          <p className='my-2 text-accent-1 text-center mx-8'>😔 {t('ohNo', 'Oh no')}!</p>
          <p className='mb-8 text-accent-1 text-center mx-8'>
            {t(
              'somethingWentWrongWhileProcessingYourTransaction',
              'Something went wrong while processing your transaction.'
            )}
          </p>
          <SquareButton
            theme={SquareButtonTheme.tealOutline}
            className='w-full'
            onClick={() => {
              resetState()
              closeModal()
            }}
          >
            {t('tryAgain', 'Try again')}
          </SquareButton>
        </BottomSheet>
      )
    }

    return (
      <BottomSheet
        label={t('confirmDepositModal', 'Confirm deposit - modal')}
        open={isOpen}
        onDismiss={closeModal}
      >
        <ModalTitle chainId={chainId} title={t('depositSubmitted', 'Deposit submitted')} />
        <ModalTransactionSubmitted
          className='mt-8'
          chainId={chainId}
          tx={depositTx}
          closeModal={closeModal}
        />
        <CheckBackForPrizesBox />
        <AccountPageButton />
      </BottomSheet>
    )
  }

  return (
    <BottomSheet
      label={t('confirmDepositModal', 'Confirm deposit - modal')}
      open={isOpen}
      onDismiss={closeModal}
    >
      <ModalTitle chainId={prizePool.chainId} title={t('depositConfirmation')} />

      <div className='w-full mx-auto mt-8'>
        <AmountBeingSwapped
          title={t('depositTicker', { ticker: token.symbol })}
          chainId={prizePool.chainId}
          from={token}
          to={ticket}
          amount={amountToDeposit}
        />

        <ModalInfoList className='mt-8'>
          <UpdatedOdds
            amount={amountToDeposit}
            prizePool={prizePool}
            action={EstimateAction.deposit}
          />
          <AmountToRecieve amount={amountToDeposit} ticket={ticket} />
          <EstimatedDepositGasItem prizePool={prizePool} amountUnformatted={amountUnformatted} />
        </ModalInfoList>

        <TxButtonNetworkGated
          className='mt-8 w-full'
          chainId={chainId}
          toolTipId={`deposit-tx-${chainId}`}
          onClick={sendDepositTx}
          disabled={depositTx?.inWallet && !depositTx.cancelled && !depositTx.completed}
        >
          {t('confirmDeposit', 'Confirm deposit')}
        </TxButtonNetworkGated>
      </div>
    </BottomSheet>
  )
}

const AmountToRecieve = (props: { amount: Amount; ticket: Token }) => {
  const { amount, ticket } = props
  const { t } = useTranslation()
  return (
    <InfoListItem
      label={
        <>
          <Tooltip
            id={`tooltip-ticket-representes-${ticket.address}`}
            tip={t(
              'ticketRepresentsChanceToWin',
              'The {{ticket}} token represents your chance to win.',
              { ticket: ticket.symbol }
            )}
          >
            {t('tickerToReceive', { ticker: ticket.symbol })}
          </Tooltip>
        </>
      }
      value={amount.amountPretty}
    />
  )
}
const CheckBackForPrizesBox = () => {
  const { t } = useTranslation()
  return (
    <div className='w-full font-semibold font-inter gradient-new text-center px-2 xs:px-8 py-2 my-4 text-xs rounded-lg text-inverse'>
      {t('disclaimerComeBackRegularlyToClaimWinnings')}
      <br />
      <a
        href='https://docs.pooltogether.com/faq/prizes-and-winning'
        target='_blank'
        rel='noopener noreferrer'
        className='underline text-xs'
      >
        {t('learnMore', 'Learn more')}
      </a>
    </div>
  )
}
const AccountPageButton = () => {
  const { t } = useTranslation()
  const router = useRouter()
  return (
    <Link href={{ pathname: '/account', query: router.query }}>
      <SquareLink
        size={SquareButtonSize.sm}
        className='text-xs hover:text-inverse transition-colors text-center'
      >
        {t('viewAccount', 'View account')}
      </SquareLink>
    </Link>
  )
}
