import { Router, Response } from 'express'
import { ParsedRequest, ResponseHandler, RPCError } from '../types/types'
import { revertWithError } from '../utils/parser'
import { chainIdHandler } from './calls/chainId'

const router: Router = Router()

const Methods = new Map<string, ResponseHandler>([])
Methods.set('eth_chainId', {
  method: 'eth_chainId',
  handler: chainIdHandler,
})

router.post('/', async function (req: ParsedRequest, res: Response) {
  const request = req.rpcRequest
  if (request?.method && request?.params && Methods.has(request.method)) {
    const handler: ResponseHandler | undefined = Methods.get(request.method)
    if (handler) {
      const result = await handler.handler(request)

      res.send(result)
      return
    }
  } else {
    const error: RPCError = {
      code: 7979,
      message: 'Method not implemented',
      data: '405 Not Allowed',
    }
    revertWithError(res, 405, error)
    return
  }
})

export default router
