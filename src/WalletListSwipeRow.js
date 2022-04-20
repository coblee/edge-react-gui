// @flow

import { type EdgeCurrencyWallet } from 'edge-core-js'
import * as React from 'react'
import { Text, TouchableOpacity } from 'react-native'
import Animated, { type SharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated'

import { selectWallet } from './actions/WalletActions'
import { WalletListMenuModal } from './components/modals/WalletListMenuModal'
import { Airship } from './components/services/AirshipInstance'
import { type Theme, cacheStyles, useTheme } from './components/services/ThemeContext'
import { getSpecialCurrencyInfo } from './constants/WalletAndCurrencyConstants'
import { Gradient } from './modules/UI/components/Gradient/Gradient.ui'
import { type SwipableRowRef, SwipeableRow } from './SwipeableRow'
import { memo, useCallback, useEffect, useRef } from './types/reactHooks'
import { useDispatch } from './types/reactRedux'
import { type NavigationProp } from './types/routerTypes'
import { WalletListLoadingRow } from './WalletListLoadingRow'
import { WalletListRow } from './WalletListRow'

type Props = {
  navigation: NavigationProp<'walletList'>,
  tokenId?: string,
  wallet?: EdgeCurrencyWallet,
  walletId: string,

  // Open the row for demo purposes:
  openTutorial?: boolean
}

/**
 * A row on the wallet list scene,
 * which can be swiped to reveal or activate various options.
 */
function WalletListSwipeRowComponent(props: Props) {
  const { navigation, openTutorial = false, tokenId, wallet, walletId } = props
  const theme = useTheme()
  const styles = getStyles(theme)

  const dispatch = useDispatch()
  // const edgeWallet = useSelector(state => state.core.account.currencyWallets[walletId])
  const rowRef = useRef<SwipableRowRef>(null)

  // Tutorial mode:
  const isEmpty = wallet == null
  useEffect(() => {
    if (openTutorial && !isEmpty && rowRef.current != null) {
      rowRef.current.openRight()
    }
  }, [openTutorial, isEmpty])

  // Helper methods:
  const closeRow = () =>
    setTimeout(() => {
      if (rowRef.current != null) rowRef.current.close()
    }, 150)

  // Action callbacks:
  const handleMenu = useCallback(() => {
    closeRow()
    Airship.show(bridge => (
      <WalletListMenuModal bridge={bridge} currencyCode={wallet?.currencyInfo.currencyCode} isToken={tokenId != null} walletId={walletId} />
    ))
  }, [tokenId, wallet, walletId])

  const handleRequest = closeRow
  const handleSelect = () => {
    closeRow()
    if (wallet == null) return
    dispatch(selectWallet(walletId, wallet.currencyInfo.currencyCode, true)).then(async () => {
      // Go to the transaction list, but only if the wallet exists
      // and does not need activation:
      if (
        // It won't need activation if its a token:
        tokenId != null ||
        // Or because it doesn't need activation in the first place:
        !getSpecialCurrencyInfo(wallet.type).isAccountActivationRequired ||
        // Or because it is already activated:
        (await wallet.getReceiveAddress()).publicAddress !== ''
      ) {
        navigation.navigate('transactionList')
      }
    })
  }
  const handleSend = () => closeRow()

  // Underlay rendering:
  const renderMenuUnderlay = (isActive: SharedValue<boolean>) => {
    return (
      <TouchableOpacity style={styles.menuUnderlay} onPress={handleMenu}>
        <SwipeIcon isActive={isActive}>
          <Text style={styles.menuIcon}>…</Text>
        </SwipeIcon>
      </TouchableOpacity>
    )
  }
  const renderRequestUnderlay = (isActive: SharedValue<boolean>) => (
    <>
      <TouchableOpacity style={styles.menuButton} onPress={handleMenu}>
        <Text style={styles.menuIcon}>…</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.requestUnderlay} onPress={handleRequest}>
        <SwipeIcon isActive={isActive}>
          <Text style={styles.menuIcon}>+</Text>
        </SwipeIcon>
      </TouchableOpacity>
    </>
  )
  const renderSendUnderlay = (isActive: SharedValue<boolean>) => (
    <>
      <TouchableOpacity style={styles.sendUnderlay} onPress={handleSend}>
        <SwipeIcon isActive={isActive}>
          <Text style={styles.menuIcon}>+</Text>
        </SwipeIcon>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuButton} onPress={handleMenu}>
        <Text style={styles.menuIcon}>…</Text>
      </TouchableOpacity>
    </>
  )

  console.log('swipe Row', wallet == null)

  // Render as an empty spinner row:
  if (wallet == null) {
    return (
      <SwipeableRow ref={rowRef} renderRight={renderMenuUnderlay} rightDetent={theme.rem(2.5)} rightThreshold={theme.rem(5)} onRightSwipe={handleMenu}>
        <WalletListLoadingRow walletId={walletId} />
      </SwipeableRow>
    )
  }

  // Render as a regular row:
  return (
    <SwipeableRow
      ref={rowRef}
      leftDetent={theme.rem(5)}
      leftThreshold={theme.rem(7.5)}
      renderLeft={renderRequestUnderlay}
      renderRight={renderSendUnderlay}
      rightDetent={theme.rem(5)}
      rightThreshold={theme.rem(7.5)}
      onLeftSwipe={handleRequest}
      onRightSwipe={handleSend}
    >
      <Gradient>
        <WalletListRow wallet={wallet} tokenId={tokenId ?? ''} onPress={handleSelect} />
      </Gradient>
    </SwipeableRow>
  )
}

/**
 * Helper component to render the expanding icons in the underlay.
 * The only reason this needs to be a component is to get access
 * to the `useAnimatedStyle` hook.
 */
function SwipeIcon(props: { children: React.Node, isActive: SharedValue<boolean> }) {
  const { children, isActive } = props
  const theme = useTheme()
  const styles = getStyles(theme)

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: withTiming(isActive.value ? 1.5 : 1) }]
  }))
  return <Animated.View style={[styles.iconBox, style]}>{children}</Animated.View>
}

const getStyles = cacheStyles((theme: Theme) => ({
  iconBox: {
    width: theme.rem(2.5),
    alignItems: 'center',
    justifyContent: 'center'
  },
  menuButton: {
    backgroundColor: theme.sliderTabMore,
    width: theme.rem(2.5),
    alignItems: 'center',
    justifyContent: 'center'
  },
  menuIcon: {
    fontFamily: theme.fontFaceDefault,
    fontSize: theme.rem(1.25),
    color: theme.icon
  },
  menuUnderlay: {
    backgroundColor: theme.sliderTabMore,
    flexDirection: 'row',
    flexGrow: 1,
    justifyContent: 'flex-end'
  },
  requestUnderlay: {
    backgroundColor: theme.sliderTabRequest,
    flexDirection: 'row',
    flexGrow: 1
  },
  sendUnderlay: {
    backgroundColor: theme.sliderTabSend,
    flexDirection: 'row',
    flexGrow: 1,
    justifyContent: 'flex-end'
  }
}))

export const WalletListSwipeRow = memo(WalletListSwipeRowComponent)
