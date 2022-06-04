// @flow

import LottieView from 'lottie-react-native'
import * as React from 'react'
import { View } from 'react-native'
import { useEffect, useRef } from '../../types/reactHooks'
import { type RouteProp } from '../../types/routerTypes.js'
import { SceneWrapper } from '../common/SceneWrapper.js'
import { cacheStyles, useTheme, type Theme } from '../services/ThemeContext'
import { EdgeText } from '../themed/EdgeText'
type Props = {
  message: string,
  route: RouteProp<'waitScene'>
}


export const WaitScene = (props: Props, ) => {

  const animationRef = useRef<LottieView | null>(); // The <> is for TypeScript, but can be removed for JavaScript

  useEffect(() => {
    animationRef.current?.play();
  }, []);

  const { message } = props.route.params

  const theme = useTheme()
  const styles = getStyles(theme)

  return (
    <SceneWrapper>
      <View style={styles.content}>
        <EdgeText style={styles.message}>{message}</EdgeText>
        <View style={styles.spinner}>
          <LottieView ref={(animation) => {
        animationRef.current = animation;
      }}
      source={require('../../assets/images/Edge-Final-Logo-Animation.json')} loop />
        </View>
      </View>
    </SceneWrapper>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  message: {
    fontFamily: theme.fontFaceBold,
    fontSize: theme.rem(1),
    marginBottom: theme.rem(2),
    textAlign: 'center'
  },
  spinner: {
    width: theme.rem(5),
    height: theme.rem(5),
  }
}))

