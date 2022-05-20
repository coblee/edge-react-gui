// @flow
import { type EdgeTokenIdExtended } from '../../types/types.js'
import { type FiatPluginUi } from './fiatPluginTypes.js'

export type FiatProviderApproveQuoteParams = {
  showUi: FiatPluginUi
}

export type FiatProviderQuote = {
  +tokenId: EdgeTokenIdExtended,
  +cryptoAmount: string,
  +isEstimate: boolean,
  +fiatCurrencyCode: string,
  +fiatAmount: string,
  +direction: 'buy' | 'sell',
  +expirationDate?: Date,

  approveQuote(params: FiatProviderApproveQuoteParams): Promise<void>,
  closeQuote(): Promise<void>
}

export type FiatProviderAssetMap = {
  [pluginId: string]: {
    [tokenId: string]: boolean
  }
}

export type FiatProviderGetQuoteParams = {
  tokenId: EdgeTokenIdExtended,
  exchangeAmount: string,
  fiatCurrencyCode: string,
  amountType: 'fiat' | 'crypto',
  direction: 'buy' | 'sell'
}

export type FiatProvider = {
  pluginId: 'simplex',
  getSupportedAssets: () => Promise<FiatProviderAssetMap>,
  getQuote: (params: FiatProviderGetQuoteParams) => Promise<FiatProviderQuote>
}

export type FiatProviderFactoryParams = {
  io: {
    store: Object
  }
}

export type FiatProviderFactory = {
  pluginId: string,
  makeProvider: (params: FiatProviderFactoryParams) => Promise<FiatProvider>
}
