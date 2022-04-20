// @flow

import { type EdgeCurrencyWallet } from 'edge-core-js'
import * as React from 'react'
import { ViewStyle } from 'react-native'
import Animated, { useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated'
import Svg, { Path } from 'react-native-svg'

import { useTheme } from './components/services/ThemeContext'
import { useEffect } from './types/reactHooks'

const AnimatedPath = Animated.createAnimatedComponent(Path)

type Props = {
  // The diameter of the inner currency icon:
  size: number,

  wallet: EdgeCurrencyWallet
}

/**
 * Renders the sync progress ratio as part of the `CurrencyIcon` component.
 */
export const WalletSyncCircle = (props: Props) => {
  const { size, wallet } = props
  const theme = useTheme()

  // Subscribe to the sync ratio:
  const done = useSharedValue(wallet.syncRatio > 0.99)
  const opacity = useSharedValue(done.value ? 0 : 1)
  const syncRatio = useSharedValue(wallet.syncRatio)
  useEffect(() => {
    return wallet.watch('syncRatio', ratio => {
      if (!done.value) {
        syncRatio.value = withTiming(ratio, { duration: 1000 })
        if (ratio > 0.99) {
          done.value = true
          opacity.value = withTiming(0, { duration: 2000 })
        }
      } else if (ratio < 0.05) {
        done.value = false
        opacity.value = withTiming(1, { duration: 1000 })
        syncRatio.value = ratio
      }
    })
  }, [done, opacity, syncRatio, wallet])

  // Animate the SVG path:
  const animatedProps = useAnimatedProps(() => {
    const ratio = Math.max(syncRatio.value, 0.02)
    const tau = 2 * Math.PI * ratio
    const arc = 'A 1 1 0 0 1'

    let path = `M 0 -1 `
    if (ratio > 0.25) path += `${arc} 1 0 `
    if (ratio > 0.5) path += `${arc} 0 1 `
    if (ratio > 0.75) path += `${arc} -1 0 `
    path += `${arc} ${Math.sin(tau)} ${-Math.cos(tau)}`

    return { d: path, strokeOpacity: opacity.value }
  })

  // Calculate the final size of the SVG:
  const strokeWidth = theme.rem(3 / 16)
  const svgSize = size + 2 * strokeWidth
  const svgStyle: ViewStyle = {
    position: 'absolute',
    top: -strokeWidth,
    left: -strokeWidth
  }

  // Scale the coordinate system to make the circle radius exactly 1:
  const r = (size + strokeWidth) / 2
  const vSize = svgSize / r
  const viewBox = `${-vSize / 2} ${-vSize / 2} ${vSize} ${vSize}`

  return (
    <Svg height={svgSize} width={svgSize} style={svgStyle} viewBox={viewBox}>
      <AnimatedPath
        animatedProps={animatedProps}
        stroke={theme.walletProgressIconFill}
        strokeLinecap="round"
        // Put the stroke into our weird coordinate system:
        strokeWidth={strokeWidth / r}
      />
    </Svg>
  )
}
