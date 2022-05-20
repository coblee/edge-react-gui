// @flow
import { add, div, mul, sub } from 'biggystring'
import uuidv1 from 'uuid/v1'

import { snooze } from '../../../util/utils'
import {
  type FiatProviderApproveQuoteParams,
  type FiatProviderAssetMap,
  type FiatProviderFactory,
  type FiatProviderFactoryParams,
  type FiatProviderGetQuoteParams,
  type FiatProviderQuote
} from '../fiatProviderTypes'
const pluginId = 'simplex'

const allowedCurrencyCodes: FiatProviderAssetMap = {
  bitcoin: { BTC: true },
  ethereum: { ETH: true },
  bitcoincash: { BCH: true },
  ripple: { XRP: true }
}

export const SIMPLEX_ID_MAP = {
  avalanche: { AVAX: 'AVAX-C' },
  binance: { AVA: 'AVA', BNB: 'BNB' },
  binancesmartchain: {
    BABYDOGE: 'BABYDOGE',
    BAKE: 'BAKE',
    BNB: 'BNB',
    BUSD: 'BUSD-SC',
    CAKE: 'CAKE',
    EGC: 'EGC',
    KMON: 'KMON',
    SATT: 'SATT-SC',
    TCT: 'TCT',
    ULTI: 'ULTI',
    USDC: 'USDC-SC',
    XVS: 'XVS'
  },
  bitcoin: { BTC: 'BTC' },
  bitcoincash: { BCH: 'BCH' },
  bitcoinsv: { BSV: 'BSV' },
  cardano: { ADA: 'ADA' },
  celo: { CELO: 'CELO', CEUR: 'CEUR', CUSD: 'CUSD' },
  digibyte: { DGB: 'DGB' },
  dogecoin: { DOGE: 'DOGE' },
  eos: { EOS: 'EOS' },
  ethereum: {
    '1EARTH': '1EARTH',
    AAVE: 'AAVE',
    AXS: 'AXS-ERC20',
    BAT: 'BAT',
    BUSD: 'BUSD',
    CEL: 'CEL',
    CHZ: 'CHZ',
    COMP: 'COMP',
    COTI: 'COTI-ERC20',
    CRO: 'CRO-ERC20',
    DAI: 'DAI',
    DEP: 'DEP',
    DFT: 'DFT',
    ELON: 'ELON',
    ENJ: 'ENJ',
    ETH: 'ETH',
    GALA: 'GALA',
    GHX: 'GHX',
    GMT: 'GMT-ERC20',
    GOVI: 'GOVI',
    HEDG: 'HEDG',
    HGOLD: 'HGOLD',
    HUSD: 'HUSD',
    KCS: 'KCS',
    LINK: 'LINK',
    MANA: 'MANA',
    MATIC: 'MATIC-ERC20',
    MKR: 'MKR',
    PRT: 'PRT',
    REVV: 'REVV',
    RFOX: 'RFOX',
    RFUEL: 'RFUEL',
    RLY: 'RLY-ERC20',
    SAND: 'SAND',
    SATT: 'SATT-ERC20',
    SHIB: 'SHIB',
    SUSHI: 'SUSHI',
    TRU: 'TRU',
    TUSD: 'TUSD',
    UNI: 'UNI',
    UOS: 'UOS-ERC20',
    USDC: 'USDC',
    USDK: 'USDK',
    USDP: 'USDP',
    USDT: 'USDT',
    VNDC: 'VNDC',
    WBTC: 'WBTC',
    XAUT: 'XAUT',
    XYO: 'XYO'
  },
  fantom: { FTM: 'FTM' },
  groestlcoin: { GRS: 'GRS' },
  hedera: { HBAR: 'HBAR' },
  litecoin: { LTC: 'LTC' },
  one: { ONE: 'ONE' },
  polkadot: { DOT: 'DOT' },
  polygon: { GMEE: 'GMEE', MATIC: 'MATIC', USDC: 'USDC-MATIC' },
  qtum: { QTUM: 'QTUM' },
  ravencoin: { RVN: 'RVN' },
  ripple: { XRP: 'XRP' },
  solana: { KIN: 'KIN', SOL: 'SOL' },
  stellar: { XLM: 'XLM' },
  tezos: { XTZ: 'XTZ' },
  tron: {
    BTT: 'BTT',
    KLV: 'KLV',
    TRX: 'TRX',
    USDC: 'USDC-TRC20',
    USDT: 'USDT-TRC20'
  },
  wax: { WAX: 'WAXP' }
}

const getUserId = async (store): Promise<string> => {
  const result = await store.readData(['simplex_user_id'])
  let id = result.simplex_user_id ?? null

  if (id == null) {
    id = uuidv1()
    await store.writeData({ simplex_user_id: id })
  }
  return id
}

export const simplexProvider: FiatProviderFactory = {
  pluginId,
  makeProvider: async (params: FiatProviderFactoryParams) => {
    const out = {
      pluginId,
      getSupportedAssets: async (): Promise<FiatProviderAssetMap> => allowedCurrencyCodes,
      getQuote: async (params: FiatProviderGetQuoteParams): Promise<FiatProviderQuote> => {
        await snooze(Math.random() * 3000)
        const { tokenId, fiatCurrencyCode, exchangeAmount, amountType, direction } = params

        const { currencyCode } = tokenId
        const currencyPluginId = tokenId.pluginId
        const exchangeRate = { bitcoin: '43123', ethereum: '2212' }
        const fee = '0.025'

        if (currencyCode == null) throw new Error('simplexProvider: Missing tokenId.currencyCode')

        let isEstimate = false
        let fiatAmount = '0'
        let cryptoAmount = '0'
        if (direction === 'buy') {
          isEstimate = true
          if (amountType === 'crypto') {
            cryptoAmount = exchangeAmount
            const feeMultiplier = add('1', fee)
            fiatAmount = mul(exchangeRate[currencyPluginId], exchangeAmount)
            fiatAmount = mul(fiatAmount, feeMultiplier)
          } else {
            fiatAmount = exchangeAmount
            const feeMultiplier = sub('1', fee)
            cryptoAmount = div(exchangeAmount, exchangeRate[currencyPluginId], 16)
            cryptoAmount = mul(cryptoAmount, feeMultiplier)
          }
        } else {
          throw new Error('simplexProvider: Sell unsupported')
        }

        const paymentQuote: FiatProviderQuote = {
          tokenId,
          isEstimate,
          fiatCurrencyCode,
          fiatAmount,
          cryptoAmount,
          direction,
          expirationDate: new Date(Date.now() + 60000),
          approveQuote: async (params: FiatProviderApproveQuoteParams): Promise<void> => {},
          closeQuote: async (): Promise<void> => {}
        }
        return paymentQuote
      }
    }
    return out
  }
}
