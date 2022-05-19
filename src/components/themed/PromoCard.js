// @flow

import * as React from 'react'
import { TouchableOpacity, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import AntDesignIcon from 'react-native-vector-icons/AntDesign'

import { type Theme, cacheStyles, getTheme } from '../services/ThemeContext.js'
import { EdgeText } from './EdgeText.js'
import { ButtonBox } from './ThemedButtons.js'

type Props = {
  message: string,
  iconUri?: string,
  onPress: () => void,
  onClose: () => void
}

export const PromoCard = (props: Props) => {
  const { message, iconUri, onPress, onClose } = props
  const theme = getTheme()
  const styles = getStyles(theme)

  return (
    <ButtonBox marginRem={1} onPress={onPress}>
      <View style={styles.container}>
        {iconUri != null ? <FastImage resizeMode="contain" source={{ uri: iconUri }} style={styles.icon} /> : null}
        <EdgeText numberOfLines={0} style={styles.text}>
          {message}
        </EdgeText>
        <TouchableOpacity onPress={onClose}>
          <AntDesignIcon name="close" color={theme.iconTappable} size={theme.rem(1)} style={styles.close} />
        </TouchableOpacity>
      </View>
    </ButtonBox>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.tileBackground,
    borderColor: theme.lineDivider,
    borderWidth: theme.dividerLineHeight,
    borderRadius: 4,
    padding: theme.rem(0.5)
  },
  icon: {
    width: theme.rem(2),
    height: theme.rem(2),
    margin: theme.rem(0.5)
  },
  text: {
    flex: 1,
    margin: theme.rem(0.5)
  },
  close: {
    padding: theme.rem(0.5)
  }
}))
