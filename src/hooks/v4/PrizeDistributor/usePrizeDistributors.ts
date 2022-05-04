import { useSupportedChainIds } from '@hooks/useSupportedChainIds'
import { usePrizePoolNetwork } from '../PrizePoolNetwork/usePrizePoolNetwork'

export const usePrizeDistributors = () => {
  const prizePoolNetwork = usePrizePoolNetwork()
  return prizePoolNetwork?.prizeDistributors
}
