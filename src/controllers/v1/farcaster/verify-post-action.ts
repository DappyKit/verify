import { Request, Response, NextFunction } from 'express'
import done from './page/done'
import { RpcHelperUtils, SDK, Config } from '@dappykit/sdk'
import { Wallet } from 'ethers'
import { clickLog } from '../utils/clickcaster'

export default async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    try {
      const clickData = req.body?.trustedData?.messageBytes

      if (clickData) {
        // eslint-disable-next-line no-console
        clickLog(clickData).then(console.log).catch(console.log)
        const sdk = new SDK(
          Config.optimismMainnetConfig,
          RpcHelperUtils.convertHDNodeWalletToAccountSigner(Wallet.createRandom()),
        )

        await sdk.gateway.verification.verifyFarcaster(clickData)
      }
    } catch (e) {}
    res.send(done())
  } catch (e) {
    next(e)
  }
}
