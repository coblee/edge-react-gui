// @flow

import * as React from 'react'
import { Text } from 'react-native'

interface Props {
  walletId: string;
}

export function WalletListLoadingRow(props: Props) {
  return <Text>Loading {props.walletId}</Text>
}
