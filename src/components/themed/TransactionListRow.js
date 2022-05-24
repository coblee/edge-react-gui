// @flow

import { abs, div, log10 } from 'biggystring'
import type { EdgeCurrencyInfo, EdgeCurrencyWallet } from 'edge-core-js'
import * as React from 'react'

import { TRANSACTION_DETAILS } from '../../constants/SceneKeys.js'
import { getSymbolFromCurrency } from '../../constants/WalletAndCurrencyConstants.js'
import { displayFiatAmount } from '../../hooks/useFiatText.js'
import { formatNumber } from '../../locales/intl.js'
import s from '../../locales/strings'
import { type RootState } from '../../reducers/RootReducer.js'
import { getDisplayDenomination, getExchangeDenomination } from '../../selectors/DenominationSelectors.js'
import { memo, useCallback } from '../../types/reactHooks.js'
import { useSelector } from '../../types/reactRedux.js'
import { Actions } from '../../types/routerTypes.js'
import type { TransactionListTx } from '../../types/types.js'
import {
  DECIMAL_PRECISION,
  decimalOrZero,
  DEFAULT_TRUNCATE_PRECISION,
  getDenomFromIsoCode,
  isSentTransaction,
  maxPrimaryCurrencyConversionDecimals,
  normalizeForSearch,
  precisionAdjust,
  truncateDecimals
} from '../../util/utils'
import { showError } from '../services/AirshipInstance.js'
import { TransactionRow } from './TransactionRow.js'

type StateProps = {
  cryptoAmount: string,
  denominationSymbol?: string,
  fiatAmount: string,
  fiatSymbol: string,
  isSentTransaction: boolean,
  requiredConfirmations: number,
  selectedCurrencyName: string,
  thumbnailPath?: string,
  walletBlockHeight: number
}

type Props = {
  // eslint-disable-next-line react/no-unused-prop-types
  walletId: string,
  // eslint-disable-next-line react/no-unused-prop-types
  currencyCode: string,
  transaction: TransactionListTx
}

export const TransactionListRow = memo((props: Props) => {
  const { transaction } = props
  const state = useSelector(state => state)
  const values = calcValues(state, props)
  const { thumbnailPath } = values

  const handlePress = useCallback(() => {
    if (transaction == null) {
      return showError(s.strings.transaction_details_error_invalid)
    }
    Actions.push(TRANSACTION_DETAILS, {
      edgeTransaction: transaction,
      thumbnailPath
    })
  }, [transaction, thumbnailPath])

  return (
    <TransactionRow
      cryptoAmount={values.cryptoAmount}
      denominationSymbol={values.denominationSymbol}
      fiatAmount={values.fiatAmount}
      fiatSymbol={values.fiatSymbol}
      onPress={handlePress}
      isSentTransaction={values.isSentTransaction}
      requiredConfirmations={values.requiredConfirmations}
      selectedCurrencyName={values.selectedCurrencyName}
      thumbnailPath={values.thumbnailPath}
      transaction={transaction}
      walletBlockHeight={values.walletBlockHeight}
    />
  )
})

export const calcValues = (state: RootState, props: Props): StateProps => {
  const { currencyCode, walletId, transaction } = props
  const { metadata } = transaction
  const { name, amountFiat } = metadata ?? {}
  const guiWallet = state.ui.wallets.byId[walletId]
  const { fiatCurrencyCode } = guiWallet
  const { currencyWallets } = state.core.account
  const coreWallet: EdgeCurrencyWallet = currencyWallets[walletId]
  const currencyInfo: EdgeCurrencyInfo = coreWallet.currencyInfo
  const displayDenomination = getDisplayDenomination(state, currencyInfo.pluginId, currencyCode)
  const exchangeDenomination = getExchangeDenomination(state, currencyInfo.pluginId, currencyCode)
  const fiatDenomination = getDenomFromIsoCode(guiWallet.fiatCurrencyCode)

  // Required Confirmations
  const requiredConfirmations = currencyInfo.requiredConfirmations || 1 // set default requiredConfirmations to 1, so once the transaction is in a block consider fully confirmed

  // Thumbnail
  let thumbnailPath
  const contacts = state.contacts || []
  const transactionContactName = name != null ? normalizeForSearch(name) : null
  for (const contact of contacts) {
    const { givenName, familyName } = contact
    const fullName = normalizeForSearch(`${givenName}${familyName ?? ''}`)
    if (contact.thumbnailPath && fullName === transactionContactName) {
      thumbnailPath = contact.thumbnailPath
      break
    }
  }

  // CryptoAmount
  const rateKey = `${currencyCode}_${guiWallet.isoFiatCurrencyCode}`
  const exchangeRate = state.exchangeRates[rateKey] ? state.exchangeRates[rateKey] : undefined
  let maxConversionDecimals = DEFAULT_TRUNCATE_PRECISION
  if (exchangeRate) {
    const precisionAdjustValue = precisionAdjust({
      primaryExchangeMultiplier: exchangeDenomination.multiplier,
      secondaryExchangeMultiplier: fiatDenomination.multiplier,
      exchangeSecondaryToPrimaryRatio: exchangeRate
    })
    maxConversionDecimals = maxPrimaryCurrencyConversionDecimals(log10(displayDenomination.multiplier), precisionAdjustValue)
  }
  const cryptoAmount = div(abs(transaction.nativeAmount ?? '0'), displayDenomination.multiplier, DECIMAL_PRECISION)
  const cryptoAmountFormat = formatNumber(decimalOrZero(truncateDecimals(cryptoAmount, maxConversionDecimals), maxConversionDecimals))

  return {
    isSentTransaction: isSentTransaction(transaction),
    cryptoAmount: cryptoAmountFormat,
    fiatAmount: displayFiatAmount(amountFiat),
    fiatSymbol: getSymbolFromCurrency(fiatCurrencyCode),
    walletBlockHeight: guiWallet.blockHeight || 0,
    denominationSymbol: displayDenomination.symbol,
    requiredConfirmations,
    selectedCurrencyName: guiWallet.currencyNames[currencyCode] || currencyCode,
    thumbnailPath
  }
}
