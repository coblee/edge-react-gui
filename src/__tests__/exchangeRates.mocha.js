// @flow

import { assert } from 'chai'
import { it } from 'mocha'

import { getHistoricalRate } from '../util/exchangeRates'

function snooze(ms: number): Promise<void> {
  return new Promise((resolve: any) => setTimeout(resolve, ms))
}

it('get bulk rates', async () => {
  const promises = []
  const rates = []
  promises.push(getHistoricalRate('BTC_iso:USD', '2022-06-01T04:00:00.000Z'))
  rates.push(31616)

  promises.push(getHistoricalRate('ETH_iso:USD', '2022-06-02T04:00:00.000Z'))
  rates.push(1814)

  promises.push(getHistoricalRate('XMR_iso:EUR', '2022-06-03T04:00:00.000Z'))
  rates.push(184)

  promises.push(getHistoricalRate('BTC_iso:PHP', '2022-06-04T04:00:00.000Z'))
  rates.push(1553326)

  promises.push(getHistoricalRate('ETH_iso:USD', '2022-06-02T04:00:00.000Z'))
  rates.push(1814)

  await snooze(1000)

  promises.push(getHistoricalRate('DOGE_iso:MXN', '2022-06-04T04:00:00.000Z'))
  rates.push(1)

  promises.push(getHistoricalRate('ETH_iso:USD', '2022-06-02T04:00:00.000Z'))
  rates.push(1814)

  await snooze(1000)

  promises.push(getHistoricalRate('ETH_iso:USD', '2022-06-02T04:00:00.000Z'))
  rates.push(1814)

  promises.push(getHistoricalRate('XMR_iso:EUR', '2022-06-03T04:00:00.000Z'))
  rates.push(184)

  promises.push(getHistoricalRate('BTC_iso:PHP', '2022-06-04T04:00:00.000Z'))
  rates.push(1553326)

  const results = await Promise.all(promises)
  for (let i = 0; i < rates.length; i++) {
    assert.equal(rates[i], Math.floor(results[i]))
  }
}).timeout(10000)
