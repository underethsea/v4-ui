import { Token } from '@pooltogether/hooks'
import { PrizeAwardable } from '@pooltogether/v4-js-client'
import classnames from 'classnames'
import { getAmountFromBigNumber } from 'lib/utils/getAmountFromBigNumber'
import ordinal from 'ordinal'

interface PrizeListProps
  extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement> {
  prizes: PrizeAwardable[]
  ticket: Token
  token: Token
}

export const PrizeList = (props: PrizeListProps) => {
  const { prizes, ticket, token, className, ...ulProps } = props

  return (
    <ul {...ulProps} className={classnames(className, 'space-y-4 max-h-80 overflow-y-auto')}>
      {!prizes &&
        Array.from(Array(3)).map((_, i) => <LoadingPrizeRow key={`prize-loading-row-${i}`} />)}
      {prizes?.map((prize) => (
        <PrizeRow key={prize.pick.toString()} prize={prize} token={token} ticket={ticket} />
      ))}
    </ul>
  )
}

interface PrizeRowProps {
  prize: PrizeAwardable
  ticket: Token
  token: Token
}

const PrizeRow = (props: PrizeRowProps) => {
  const { prize, ticket, token } = props
  const { amount: amountUnformatted, distributionIndex } = prize

  const { amountPretty } = getAmountFromBigNumber(amountUnformatted, ticket.decimals)

  return (
    <li
      className={classnames(
        'flex flex-row text-center p-px bg-light-purple-10 rounded-lg mb-2 last:mb-0 text-xxs',
        {
          'bg-light-purple-10': distributionIndex !== 0,
          'pool-gradient-3 ': distributionIndex === 0
        }
      )}
    >
      <div
        className={classnames(
          'flex rounded-lg flex-row w-full justify-between space-x-2 py-2 px-4 sm:px-6',
          {
            'bg-actually-black bg-opacity-60': distributionIndex === 0
          }
        )}
      >
        <span>{`${amountPretty} ${token.symbol}`}</span>
        <span>{`${ordinal(distributionIndex + 1)} Prize${getEmoji(distributionIndex)}`}</span>
      </div>
    </li>
  )
}

const getEmoji = (distributionIndex) => {
  if (distributionIndex === 0) {
    return ' 🏆'
  } else if (distributionIndex === 1) {
    return ' 🥈'
  } else if (distributionIndex === 2) {
    return ' 🥉'
  }
  return ''
}

const LoadingPrizeRow = () => <li className='w-full h-6 animate-pulse bg-darkened rounded-xl' />