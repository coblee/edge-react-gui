// @flow

import { type EdgeCurrencyWallet } from 'edge-core-js'
import * as React from 'react'
import { Text, View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { cacheStyles } from 'react-native-patina'

import { useTheme } from './components/services/ThemeContext'
import { CurrencyIcon } from './CurrencyIcon'
import { useEffect, useState } from './types/reactHooks'
import { type Theme } from './types/Theme'

type Props = {
  wallet: EdgeCurrencyWallet,
  tokenId: string,
  onPress?: () => void
}

export function WalletListRow(props: Props) {
  const { wallet, tokenId, onPress } = props
  const theme = useTheme()
  const styles = getStyles(theme)

  // Look up wallet info:
  const { customTokens = {}, builtinTokens = {} } = wallet.currencyConfig
  const token = customTokens[tokenId] ?? builtinTokens[tokenId]
  const currencyCode = token == null ? wallet.currencyInfo.currencyCode : token.currencyCode
  const [denomination] = token == null ? wallet.currencyInfo.denominations : token.denominations

  // Subscribe to the name:
  const [name, setName] = useState(wallet.name)
  useEffect(() => wallet.watch('name', setName), [wallet])

  // Subscribe to the balance:
  const [balance, setBalance] = useState(wallet.balances[currencyCode] ?? '')
  useEffect(() => wallet.watch('balances', balances => setBalance(balances[currencyCode] ?? '')), [currencyCode, wallet])

  const cryptoBalance = denomination.symbol == null ? balance : `${denomination.symbol} ${balance}`

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <CurrencyIcon wallet={wallet} tokenId={tokenId} marginRem={0.5} />
      {/* <Text style={styles.iconText}>{`${(syncRatio * 100).toFixed(2)}%`}</Text> */}

      <View style={styles.column}>
        <View style={styles.row}>
          <Text style={styles.currencyText}>{currencyCode}</Text>
          <Text style={styles.tickerText}>Price</Text>
          <Text style={styles.balanceText}>{cryptoBalance}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.nameText}>{name ?? `My ${wallet.currencyInfo.displayName}`}</Text>
          <Text style={styles.fiatBalanceText}>Much $$</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const getStyles = cacheStyles((theme: Theme) => {
  const topText = {
    color: theme.primaryText,
    flexShrink: 1,
    fontFamily: theme.fontFaceDefault,
    fontSize: theme.rem(1)
  }
  const bottomText = {
    color: theme.secondaryText,
    flexShrink: 1,
    fontFamily: theme.fontFaceDefault,
    fontSize: theme.rem(0.75)
  }

  return {
    container: {
      alignItems: 'center',
      flexDirection: 'row',
      height: theme.rem(4.25),
      justifyContent: 'flex-start',
      padding: theme.rem(0.5),

      backgroundColor: theme.backgroundGradientRight
    },
    column: {
      alignItems: 'stretch',
      // borderColor: 'red',
      // borderWidth: 1,
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      padding: theme.rem(0.5)
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    currencyText: { ...topText, fontFamily: theme.fontFaceMedium },
    tickerText: {
      ...topText,
      color: theme.negativeText,
      flexGrow: 1,
      marginLeft: theme.rem(0.75)
    },
    balanceText: { ...topText },
    fiatBalanceText: { ...bottomText },
    nameText: { ...bottomText, flexGrow: 1 },
    iconText: {
      color: theme.secondaryText,
      flexShrink: 1,
      fontFamily: theme.fontFaceDefault,
      fontSize: theme.rem(0.75),
      width: theme.rem(5)
    }
  }
})
