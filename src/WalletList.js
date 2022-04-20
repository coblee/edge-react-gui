// @flow

import { type EdgeAccount } from 'edge-core-js'
import * as React from 'react'
import { FlatList } from 'react-native'

import { useEffect, useState } from './types/reactHooks'
import { type NavigationProp } from './types/routerTypes'
import { WalletListSwipeRow } from './WalletListSwipeRow'

type Props = {
  account: EdgeAccount,
  navigation: NavigationProp<'walletList'>
}

export function WalletList(props: Props) {
  const { account, navigation } = props

  const [activeWalletIds, setActiveWalletIds] = useState(account.activeWalletIds)
  const [currencyWallets, setCurrencyWallets] = useState(account.currencyWallets)
  useEffect(() => account.watch('activeWalletIds', setActiveWalletIds), [account])
  useEffect(() => account.watch('currencyWallets', setCurrencyWallets), [account])

  const list: Array<{ walletId: string, tokenId?: string }> = []
  for (const walletId of activeWalletIds) {
    list.push({ walletId })
    const wallet = currencyWallets[walletId]
    if (wallet != null)
      for (const tokenId of wallet.enabledTokenIds) {
        list.push({ walletId, tokenId })
      }
  }

  return (
    <FlatList
      style={{ flex: 1, alignSelf: 'stretch' }}
      data={list}
      renderItem={item => {
        const { walletId, tokenId } = item.item
        const wallet = currencyWallets[walletId]
        return <WalletListSwipeRow navigation={navigation} tokenId={tokenId} wallet={wallet} walletId={walletId} />
      }}
      extraData={currencyWallets}
    />
  )
}
