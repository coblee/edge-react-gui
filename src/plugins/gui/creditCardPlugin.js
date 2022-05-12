// @flow
import { div, gt, toFixed } from 'biggystring'

import { type EdgeTokenIdExtended } from '../../types/types'
import { type FiatPlugin, type FiatPluginFactory, type FiatPluginFactoryArgs } from './fiatPluginTypes'
import { type FiatProviderGetQuoteParams, type FiatProviderQuote } from './fiatProviderTypes'
import { simplexProvider } from './providers/simplexPlugin'

const providerFactories = [simplexProvider]

const promiseWithTimeout = <T>(promise: Promise<T>, timeoutMs: number = 5000): Promise<T> | Promise<void> =>
  Promise.race([promise, new Promise((resolve, reject) => setTimeout(() => resolve(undefined), timeoutMs))])

const safePromise = <T>(promise: Promise<T>): Promise<T> | Promise<void> => promise.catch(e => undefined)

export const creditCardPlugin: FiatPluginFactory = async (params: FiatPluginFactoryArgs) => {
  const { showUi, account } = params

  const assetPromises = []
  const providerPromises = []
  for (const providerFactory of providerFactories) {
    providerPromises.push(providerFactory())
  }
  const providers = await Promise.all(providerPromises)
  for (const provider of providers) {
    assetPromises.push(promiseWithTimeout(safePromise(provider.getSupportedAssets())))
  }

  const fiatPlugin: FiatPlugin = {
    pluginId: 'creditcard',
    startPlugin: async () => {
      const assetArray = await Promise.all(assetPromises)

      const allowedCurrencyCodes: EdgeTokenIdExtended[] = []
      for (const assetMap of assetArray) {
        if (assetMap == null) continue
        for (const currencyPluginId in assetMap) {
          const currencyCodeMap = assetMap[currencyPluginId]
          for (const currencyCode in currencyCodeMap) {
            if (currencyCodeMap[currencyCode]) {
              allowedCurrencyCodes.push({ pluginId: currencyPluginId, currencyCode })
            }
          }
        }
      }

      // Pop up modal to pick wallet/asset
      const walletListResult = await showUi.walletPicker({ headerTitle: 'Select Asset to Purchase', allowedCurrencyCodes, showCreateWallet: true })
      const { walletId, currencyCode } = walletListResult
      if (walletId == null) return

      const coreWallet = account.currencyWallets[walletId]
      const currencyPluginId = coreWallet.currencyInfo.pluginId
      if (!coreWallet) return showUi.errorDropdown(new Error(`Missing wallet with ID ${walletId}`))

      let counter = 0
      let bestQuote: FiatProviderQuote | void

      // Navigate to scene to have user enter amount
      const response = await showUi.enterAmount({
        headerTitle: `Buy ${currencyCode}`,
        label1: `Amount USD`,
        label2: `Amount ${currencyCode}`,
        initialAmount1: '500',
        convertValue: async (sourceFieldNum: number, value: string): Promise<string | void> => {
          const myCounter = ++counter
          let quoteParams: FiatProviderGetQuoteParams

          if (sourceFieldNum === 1) {
            // User entered a fiat value. Convert to crypto
            quoteParams = {
              tokenId: { pluginId: currencyPluginId, currencyCode },
              exchangeAmount: value,
              fiatCurrencyCode: coreWallet.fiatCurrencyCode,
              amountType: 'fiat',
              direction: 'buy'
            }
          } else {
            // User entered a crypto value. Convert to fiat
            quoteParams = {
              tokenId: { pluginId: currencyPluginId, currencyCode },
              exchangeAmount: value,
              fiatCurrencyCode: coreWallet.fiatCurrencyCode,
              amountType: 'crypto',
              direction: 'buy'
            }
          }

          const quotePromises = providers.map(p => promiseWithTimeout(safePromise(p.getQuote(quoteParams))))
          const quotes = await Promise.all(quotePromises)

          // Only update with the latest call to convertValue
          if (myCounter !== counter) return

          let bestQuoteRatio = '0'
          for (const quote of quotes) {
            if (quote == null) continue
            if (quote.direction !== 'buy') continue
            const quoteRatio = div(quote.cryptoAmount, quote.fiatAmount, 16)
            if (gt(quoteRatio, bestQuoteRatio)) {
              bestQuoteRatio = quoteRatio
              bestQuote = quote
            }
          }
          if (bestQuote == null) return

          if (sourceFieldNum === 1) {
            return toFixed(bestQuote.cryptoAmount, 0, 6)
          } else {
            return toFixed(bestQuote.fiatAmount, 0, 2)
          }
        }
      })
      console.log(`enterAmount response`, response)

      if (bestQuote == null) showUi.popScene()
      showUi.popScene()
    }
  }
  return fiatPlugin
}
