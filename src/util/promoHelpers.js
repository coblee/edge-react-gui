// @flow
import { asArray, asBoolean, asDate, asObject, asOptional, asString, asValue } from 'cleaners'
import { type EdgeDataStore } from 'edge-core-js'
import { Platform } from 'react-native'
import { getVersion } from 'react-native-device-info'
import { getLocales } from 'react-native-localize'

import { config } from '../theme/appConfig.js'

const asPromotion = asObject({
  messageId: asString,
  message: asObject(
    // keys are language identifiers (ie. 'enUS')
    asObject({
      title: asString,
      body: asString,
      imageUrl: asString
    })
  ),
  locations: asObject(
    // Keys are 2-character country codes (ie. 'US')
    asBoolean
  ),
  appFlags: asObject(
    // Keys are unique account attributes (ie. 'wyreLinkedBank')
    asBoolean
  ),
  appId: asOptional(asString),
  forPlatform: asValue('ios', 'android'),
  maxVersion: asString,
  minVersion: asString,
  startDate: asDate,
  endDate: asDate
})

export type Promotion = $Call<typeof asPromotion>

type Profile = {
  appId: string | void,
  appVersion: string,
  language: string,
  location: string,
  platform: 'ios' | 'android'
}

export type AppFlags = {
  wyreLinkedBank?: boolean
}

export const getPromotions = async (): Promise<Promotion[]> => {
  const promos = []

  const response = await fetch('https://info1.edge.app/v1/notifications')
  const json = await response.json()
  if (json.notifications == null) return promos

  json.notifications.forEach(promo => {
    try {
      promos.push(asPromotion(promo))
    } catch (e) {}
  })

  return promos
}

const asWyrePaymentMethodResponse = asObject({
  data: asArray(
    asObject({
      status: asString
    })
  )
})

export const hasWyreLinkedBank = async (store: EdgeDataStore): Promise<boolean> => {
  // Wyre has two possible keys that hold the secret so we need to look in both places
  let secret
  try {
    secret = await store.getItem('co.edgesecure.wyre', 'wyreSecret')
  } catch (e) {
    secret = await store.getItem('co.edgesecure.wyre', 'wyreAccountId')
  }

  const response = await fetch('https://api.sendwyre.com/v2/paymentMethods', {
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer ' + secret,
      'Content-Type': 'application/json'
    }
  })
  if (!response.ok) throw new Error('hasWyreLinkedBank not ok')
  const json = asWyrePaymentMethodResponse(await response.json())

  // The first item in the array is the most recent and only item that matters
  if (json.data[0]?.status === 'ACTIVE') return true
  return false
}

export const getProfile = (): Profile => {
  // {"isRTL":false,"languageCode":"en","languageTag":"en-US","countryCode":"US"}
  const { languageTag, countryCode } = getLocales()[0]
  const platform = Platform.OS
  const appVersion = getVersion() //  99.99.99
  const appId = config.appId

  return {
    appId,
    appVersion,
    language: languageTag,
    location: countryCode,
    platform
  }
}

// Test to see if the app version on device is within a range. Version formats must be in '12.34.56' format like returned from getVersion()
// Anything other than 0-9 will become NaN and compare as false
const testVersion = (deviceVersion: string, minVersion: string, maxVersion: string): boolean => {
  const [device, min, max] = [deviceVersion, minVersion, maxVersion].map(semver =>
    Number(
      semver
        .split('.')
        .map(id => id.padStart(2, '0'))
        .join()
        .replace(/,/g, '')
    )
  )

  return min <= device && device <= max
}

export const testProfile = (device: Profile, promotion: Promotion): boolean => {
  // Test appId
  if (device.appId !== promotion.appId) return false

  // Test language
  if (promotion.message[device.language] == null) return false

  // Test location
  if (promotion.locations[device.location] == null) return false

  // Test platform
  if (device.platform !== promotion.forPlatform) return false

  // Test dates
  const rightNow = new Date()
  if (rightNow < promotion.startDate || promotion.endDate < rightNow) return false

  // Test appVersion
  if (!testVersion(device.appVersion, promotion.minVersion, promotion.maxVersion)) return false

  return true
}
