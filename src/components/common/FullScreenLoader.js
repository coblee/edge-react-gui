// @flow

import React, { Component } from 'react'
import { ActivityIndicator, StyleSheet, View, ViewPropTypes } from 'react-native'

import { THEME } from '../../theme/variables/airbitz.js'
import { PLATFORM } from '../../theme/variables/platform.js'

type Props = {
  indicatorStyles?: ViewPropTypes.style,
  size?: 'large' | 'small'
}

class FullScreenLoader extends Component<Props> {
  render() {
    const { size, indicatorStyles } = this.props
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator style={[styles.indicator, indicatorStyles]} size={size || 'large'} />
      </View>
    )
  }
}

const rawStyles = {
  loadingContainer: {
    flex: 1,
    position: 'absolute',
    height: PLATFORM.deviceHeight,
    width: PLATFORM.deviceWidth,
    backgroundColor: THEME.COLORS.OPACITY_GRAY_1,
    zIndex: 1000
  },
  indicator: {
    flex: 1,
    alignSelf: 'center'
  }
}
const styles: typeof rawStyles = StyleSheet.create(rawStyles)

export default FullScreenLoader
