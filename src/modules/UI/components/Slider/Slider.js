// @flow

import * as React from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { PanGestureHandler } from 'react-native-gesture-handler'
import Animated, { Easing, runOnJS, useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import Entypo from 'react-native-vector-icons/Entypo'

import { type Theme, cacheStyles, useTheme } from '../../../../components/services/ThemeContext.js'
import { EdgeText } from '../../../../components/themed/EdgeText'
import { useHandler } from '../../../../hooks/useHandler.js'
import s from '../../../../locales/strings.js'
import { useEffect, useState } from '../../../../types/reactHooks.js'

const COMPLETE_POINT: number = 3

type Props = {
  onSlidingComplete(reset: () => void): mixed,
  parentStyle?: any,
  showSpinner?: boolean,
  completePoint?: number,
  width?: number,

  // Reset logic:
  reset?: boolean,

  // Disabled logic:
  disabledText?: string,
  disabled: boolean
}

const clamp = (value, lowerBound, upperBound) => {
  'worklet'
  return Math.min(Math.max(lowerBound, value), upperBound)
}

export const SliderComponent = (props: Props) => {
  const theme = useTheme()
  const styles = getStyles(theme)
  const [completed, setCompleted] = useState(false)
  const {
    disabledText,
    disabled,
    reset,
    showSpinner,
    onSlidingComplete,
    parentStyle,
    completePoint = COMPLETE_POINT,
    width = theme.confirmationSliderWidth
  } = props

  const upperBound = width - theme.confirmationSliderThumbWidth
  const widthStyle = { width }
  const sliderDisabled = disabled || showSpinner
  const sliderText = !sliderDisabled ? s.strings.send_confirmation_slide_to_confirm : disabledText || s.strings.select_exchange_amount_short

  const translateX = useSharedValue(upperBound)
  const isSliding = useSharedValue(false)

  const resetSlider = useHandler(() => {
    translateX.value = withTiming(upperBound, {
      duration: 500,
      easing: Easing.inOut(Easing.exp)
    })
    setCompleted(false)
  })
  const complete = () => {
    onSlidingComplete(() => resetSlider())
    setCompleted(true)
  }

  const onGestureEvent = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      if (!sliderDisabled) ctx.offsetX = translateX.value
    },
    onActive: (event, ctx) => {
      if (!sliderDisabled) {
        isSliding.value = true
        translateX.value = clamp(event.translationX + ctx.offsetX, 0, upperBound)
      }
    },
    onEnd: () => {
      if (!sliderDisabled) {
        isSliding.value = false

        if (translateX.value < completePoint) {
          runOnJS(complete)()
        } else {
          translateX.value = withTiming(upperBound, {
            duration: 500,
            easing: Easing.inOut(Easing.exp)
          })
        }
      }
    }
  })

  const scrollTranslationStyle = useAnimatedStyle(() => {
    return { transform: [{ translateX: translateX.value }] }
  })

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: translateX.value + theme.confirmationSliderThumbWidth
    }
  })

  // Reset slider state conditions:
  useEffect(() => {
    // Reset prop set by parent
    if (reset) resetSlider()
    // Completed prop set by parent and no longer showing spinner
    else if (completed && !showSpinner) resetSlider()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSlider, reset, showSpinner])

  return (
    <View style={[parentStyle, styles.sliderContainer]}>
      <View style={[styles.slider, sliderDisabled ? styles.disabledSlider : null, widthStyle]}>
        <Animated.View style={[styles.progress, progressStyle]} />

        <PanGestureHandler onGestureEvent={onGestureEvent}>
          <Animated.View style={[styles.thumb, sliderDisabled ? styles.disabledThumb : null, scrollTranslationStyle]}>
            <Entypo style={styles.thumbIcon} name="chevron-left" size={theme.rem(1.5)} />
          </Animated.View>
        </PanGestureHandler>
        {showSpinner ? (
          <ActivityIndicator color={theme.iconTappable} style={styles.activityIndicator} />
        ) : (
          <EdgeText style={sliderDisabled ? [styles.textOverlay, styles.textOverlayDisabled] : styles.textOverlay}>{sliderText}</EdgeText>
        )}
      </View>
    </View>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  sliderContainer: {
    alignItems: 'center'
  },
  slider: {
    borderRadius: theme.confirmationSliderThumbWidth / 2,
    backgroundColor: theme.confirmationSlider,
    justifyContent: 'center',
    height: theme.confirmationSliderThumbWidth,
    width: theme.confirmationSliderWidth
  },
  disabledSlider: {
    backgroundColor: theme.confirmationSlider
  },
  thumb: {
    height: theme.confirmationSliderThumbWidth,
    width: theme.confirmationSliderThumbWidth,
    borderRadius: theme.confirmationSliderThumbWidth / 2,
    backgroundColor: theme.confirmationSliderThumb,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5
  },
  thumbIcon: {
    color: theme.confirmationSliderArrow,
    fontSize: theme.rem(2.25)
  },
  disabledThumb: {
    backgroundColor: theme.confirmationThumbDeactivated
  },
  progress: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.confirmationSlider,
    borderRadius: theme.confirmationSliderThumbWidth / 2
  },
  textOverlay: {
    fontSize: theme.rem(0.75),
    position: 'absolute',
    color: theme.confirmationSliderText,
    alignSelf: 'center',
    lineHeight: theme.confirmationSliderThumbWidth,
    zIndex: 1
  },
  textOverlayDisabled: {
    color: theme.confirmationSliderTextDeactivated
  },
  activityIndicator: {
    position: 'absolute',
    alignSelf: 'center',
    top: theme.rem(1),
    zIndex: 1
  }
}))
