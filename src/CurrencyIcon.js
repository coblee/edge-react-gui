// @flow

import { type EdgeCurrencyWallet } from 'edge-core-js'
import * as React from 'react'
import { Image, StyleSheet, View } from 'react-native'

import { useTheme } from './components/services/ThemeContext'
import { memo, useMemo } from './types/reactHooks'
import { fixSides, mapSides, sidesToMargin } from './util/sides'
import { WalletSyncCircle } from './WalletSyncCircle'

const EDGE_CONTENT_SERVER = 'https://content.edge.app'

function getCurrencyIcon(pluginId: string, tokenId: string = '') {
  const currencyPath = `${pluginId}/${tokenId === '' ? pluginId : tokenId}`
  const url = `${EDGE_CONTENT_SERVER}/currencyIcons/${currencyPath}`
  return {
    symbolImage: `${url}.png`,
    symbolImageDarkMono: `${url}_dark.png`
  }
}

type Props = {
  // Network identity. One of these two should always be present
  // (although we can infer a `pluginId` from a `currencyCode`, if given).
  // Providing a wallet will render a progress indicator.
  wallet?: EdgeCurrencyWallet,
  pluginId?: string,

  // Defaults to "" for the primary token on the selected network:
  tokenId?: string,

  // Set this to `true` to use the mono dark icon logo:
  mono?: boolean,

  // Icon size. Defaults to 2:
  sizeRem?: number,

  // Margin around the component. Defaults to 0:
  marginRem?: number | number[]
}

export const CurrencyIconComponent = (props: Props) => {
  // Grab the wallet:
  const { wallet } = props
  const { pluginId = wallet?.currencyInfo.pluginId, tokenId = '' } = props

  // Grab the display props:
  const { marginRem, mono = false, sizeRem = 2 } = props
  const theme = useTheme()
  const margin = sidesToMargin(mapSides(fixSides(marginRem, 0), theme.rem))
  const size = theme.rem(sizeRem)

  // Main currency icon:
  const mainIcon = useMemo(() => {
    if (pluginId == null) return null

    const icon = getCurrencyIcon(pluginId, tokenId)
    return (
      <Image
        resizeMode="contain"
        source={{
          uri: mono ? icon.symbolImageDarkMono : icon.symbolImage
        }}
        style={StyleSheet.absoluteFill}
      />
    )
  }, [mono, pluginId, tokenId])

  // Parent currency icon (if it's a token):
  const parentIcon = useMemo(() => {
    if (pluginId == null || tokenId === '') return null

    const icon = getCurrencyIcon(pluginId)
    return (
      <Image
        resizeMode="contain"
        source={{
          uri: mono ? icon.symbolImageDarkMono : icon.symbolImage
        }}
        style={styles.parentIcon}
      />
    )
  }, [mono, pluginId, tokenId])

  return (
    <View style={{ ...margin, height: size, width: size }}>
      {wallet == null ? null : <WalletSyncCircle size={size} wallet={wallet} />}
      {mainIcon}
      {parentIcon}
    </View>
  )
}

const styles = StyleSheet.create({
  parentIcon: {
    bottom: 0,
    height: '45%',
    position: 'absolute',
    right: 0,
    width: '45%'
  }
})

export const CurrencyIcon = memo(CurrencyIconComponent)
