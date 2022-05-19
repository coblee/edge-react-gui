// @flow

import * as React from 'react'

import { hideMessageTweak } from '../../actions/AccountReferralActions.js'
import { linkReferralWithCurrencies } from '../../actions/WalletListActions.js'
import { useMemo } from '../../types/reactHooks.js'
import { useDispatch, useSelector } from '../../types/reactRedux.js'
import { bestOfMessages } from '../../util/ReferralHelpers.js'
import { PromoCard } from './PromoCard.js'

export const PromoBanner = () => {
  const dispatch = useDispatch()

  const accountMessages = useSelector(state => state.account.referralCache.accountMessages)
  const accountReferral = useSelector(state => state.account.accountReferral)

  // Look for active referral promotion
  const referralPromoCard = useMemo(() => {
    const messageSummary = bestOfMessages(accountMessages, accountReferral)
    if (messageSummary == null) return null
    const {
      message: { message, iconUri, uri },
      messageId,
      messageSource
    } = messageSummary

    const referralOnPress = () => {
      if (uri != null) dispatch(linkReferralWithCurrencies(uri))
    }
    const referralOnClose = () => {
      dispatch(hideMessageTweak(messageId, messageSource))
    }

    return { message, iconUri, onPress: referralOnPress, onClose: referralOnClose }
  }, [accountMessages, accountReferral, dispatch])

  // Render
  if (referralPromoCard != null)
    return (
      <PromoCard
        message={referralPromoCard.message}
        iconUri={referralPromoCard.iconUri}
        onPress={referralPromoCard.onPress}
        onClose={referralPromoCard.onClose}
      />
    )
  return null
}
