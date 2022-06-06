// @flow

import { asArray, asEither, asNull, asObject, asString } from 'cleaners'
import fetch from 'node-fetch'

// import { pickRandom } from './utils'

const RATES_SERVERS = ['https://rates2.edge.app']
const RATES_SERVER_MAX_QUERY_SIZE = 100
// const HOUR_MS = 1000 * 60 * 60
const FETCH_FREQUENCY = 2000

const asRatesResponse = asObject({
  data: asArray(
    asObject({
      currency_pair: asString,
      date: asString,
      exchangeRate: asEither(asString, asNull)
    })
  )
})

type RateMap = {
  [pair_date: string]: number | null
}

type RateQueueEntry = {
  currency_pair: string,
  date: string
}

const rateMap: RateMap = {}
let rateQueue: RateQueueEntry[] = []
let resolverMap: {
  [pair_date: string]: Function[]
} = {}
let clearTimeout

export const roundHalfHour = (dateStr: string) => {
  const date = new Date(dateStr)
  let seconds = date.getSeconds()
  seconds = seconds > 30 ? 30 : 0

  date.setMinutes(0)
  date.setSeconds(seconds)
  date.setMilliseconds(0)
  return date.toISOString()
}

const addToQueue = (entry: RateQueueEntry, resolve: Function) => {
  const { currency_pair: pair, date } = entry
  const pairDate = `${pair}_${date}`
  rateQueue.push(entry)
  if (resolverMap[pairDate] == null) {
    resolverMap[pairDate] = [resolve]
    console.log('first push', pairDate)
  } else {
    resolverMap[pairDate].push(resolve)
    console.log('push', pairDate)
  }
  if (clearTimeout == null || rateQueue.length === RATES_SERVER_MAX_QUERY_SIZE) {
    console.log(`Starting timeout from ${pairDate}`)
    clearTimeout = setTimeout(async () => {
      console.log(`Querying server`)
      // Query the server with all requests
      // const url = pickRandom(RATES_SERVERS) ?? ''
      const url = RATES_SERVERS[0] ?? ''
      const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: rateQueue })
      }
      rateQueue = []
      const workingResolverMap = resolverMap
      resolverMap = {}
      try {
        const response = await fetch(url + '/v2/exchangeRates', options)
        if (response.ok) {
          const json = await response.json()
          const cleanedRates = asRatesResponse(json)
          for (const rateObj of cleanedRates.data) {
            const { currency_pair: currencyPair, exchangeRate, date } = rateObj
            const rate = parseFloat(exchangeRate)
            rateMap[`${currencyPair}_${date}`] = rate
            const resolvers = workingResolverMap[`${currencyPair}_${date}`]
            if (resolvers.length) {
              console.log('resolving', rate)
              resolvers.forEach(r => r(rate))
            }
          }
        } else {
          throw new Error('bad response')
        }
      } catch (e) {
        console.log('exchangeRates addToQueue error', e.message)
        // Resolve all the promises with value 0
        for (const key in workingResolverMap) {
          const resolvers = workingResolverMap[key]
          resolvers.forEach(r => r(0))
        }
      } finally {
        clearTimeout = undefined
      }
    }, FETCH_FREQUENCY)
  } else {
    console.log(`Buffering query ${pairDate}`)
  }
}

export const getHistoricalRate = (codePair: string, date: string): Promise<number> => {
  const roundDate = roundHalfHour(date)
  return new Promise((resolve, reject) => {
    const [code1, code2] = codePair.split('_').sort()
    const pair = `${code1}_${code2}`
    const reverse = pair !== codePair
    const rate = rateMap[`${pair}_${roundDate}`]
    if (rate == null) {
      addToQueue({ currency_pair: pair, date: roundDate }, resolve)
      return
    }

    let out = rate
    if (reverse) {
      out = 1 / rate
    }
    console.log('cache hit', out)
    resolve(out)
  })
}
