// @flow

import * as React from 'react'
import { Image, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

import { SceneWrapper } from '../../../components/common/SceneWrapper.js'
// import { Actions } from '../../types/routerTypes.js'
import { type Theme, cacheStyles, useTheme } from '../../../components/services/ThemeContext.js'
import { OutlinedTextInput } from '../../../components/themed/OutlinedTextInput.js'
import { SceneHeader } from '../../../components/themed/SceneHeader.js'
import { memo, useCallback, useRef, useState } from '../../../types/reactHooks.js'
import type { NavigationProp, RouteProp } from '../../../types/routerTypes'

type Props = {
  route: RouteProp<'guiPluginEnterAmount'>,
  navigation: NavigationProp<'guiPluginEnterAmount'>
}

export const FiatPluginEnterAmountScene = memo((props: Props): React.Node => {
  const theme = useTheme()
  const styles = getStyles(theme)
  // const { navigation } = props
  const { headerIconUri, headerTitle, onSubmit, convertValue, onChangeText, label1, label2, initialAmount1 = '' } = props.route.params
  const [value1, setValue1] = useState<string>(initialAmount1)
  const [value2, setValue2] = useState<string>('')
  const firstRun = useRef<boolean>(true)
  const lastUsed = useRef<number>(1)
  // const cleanListeners = []
  // cleanListeners.push(navigation.addListener('didBlur', event => console.log('event didBlur', event)))
  // cleanListeners.push(navigation.addListener('didFocus', event => console.log('event didFocus', event)))
  // cleanListeners.push(navigation.addListener('willBlur', event => console.log('event willBlur', event)))
  // cleanListeners.push(navigation.addListener('willFocus', event => console.log('event willFocus', event)))

  if (firstRun.current && initialAmount1 != null) {
    convertValue(1, initialAmount1).then(val => {
      if (typeof val === 'string') setValue2(val)
    })
  }
  firstRun.current = false
  let headerIcon = null
  if (headerIconUri != null) {
    headerIcon = <Image style={styles.icon} source={{ uri: headerIconUri }} />
  }

  const handleChangeText1 = useCallback(
    (value: string) => {
      lastUsed.current = 1
      onChangeText(1, value)
      setValue1(value)
      setValue2('...')
      convertValue(1, value).then(v => {
        if (typeof v === 'string') setValue2(v)
      })
    },
    [convertValue, onChangeText]
  )
  const handleChangeText2 = useCallback(
    (value: string) => {
      lastUsed.current = 2
      onChangeText(2, value)
      setValue2(value)
      setValue1('...')
      convertValue(2, value).then(v => {
        if (typeof v === 'string') setValue1(v)
      })
    },
    [convertValue, onChangeText]
  )
  const handleSubmit = useCallback(() => {
    onSubmit({ lastUsed: lastUsed.current, value1, value2 })
  }, [onSubmit, value1, value2])

  return (
    <SceneWrapper scroll background="theme">
      <ScrollView>
        <SceneHeader style={styles.sceneHeader} title={headerTitle} underline withTopMargin>
          {headerIcon}
        </SceneHeader>
        <View style={styles.container}>
          <View style={styles.textFields}>
            <OutlinedTextInput
              autoCorrect={false}
              autoFocus
              returnKeyType="done"
              autoCapitalize="none"
              keyboardType="decimal-pad"
              label={label1}
              onChangeText={handleChangeText1}
              onSubmitEditing={handleSubmit}
              value={value1 ?? '0'}
              // marginRem={[0, 1]}
              // error={handleError}
            />
            <OutlinedTextInput
              autoCorrect={false}
              autoFocus={false}
              returnKeyType="done"
              autoCapitalize="none"
              keyboardType="decimal-pad"
              label={label2}
              onChangeText={handleChangeText2}
              onSubmitEditing={handleSubmit}
              value={value2 ?? '0'}
              // marginRem={[0, 1]}
              // error={handleError}
            />
          </View>
        </View>
      </ScrollView>
    </SceneWrapper>
  )
})

const getStyles = cacheStyles((theme: Theme) => ({
  sceneHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  container: {
    width: '100%',
    alignItems: 'center'
  },
  textFields: {
    flexDirection: 'column',
    minWidth: theme.rem(15),
    maxWidth: theme.rem(20)
  },
  icon: {
    height: theme.rem(1.5),
    width: theme.rem(1.5),
    marginRight: theme.rem(0.5),
    marginLeft: theme.rem(0.5),
    resizeMode: 'contain'
  }
}))
