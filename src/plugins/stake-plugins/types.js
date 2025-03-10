// @flow

// -----------------------------------------------------------------------------
// Stake Policy
// -----------------------------------------------------------------------------

export type AssetId = { pluginId: string, currencyCode: string }

export type LpUid = {
  pluginId: string,
  lpId: string
}

export type LiquidityPool = LpUid & {
  displayName: string
}

// Not sure if this is going be enough because how "LP-staking" works;
// Need to figure out how we deal with LP pool asset-ratios.
export type StakePolicy = {|
  // Perhaps we need a UUID for each policy?
  stakePolicyId: string,

  // A percentage number representing the yield per year
  apy: number,

  liquidityPool?: LiquidityPool,

  // The assets which must be staked
  stakeAssets: AssetId[],

  // The assets which can be earned
  rewardAssets: AssetId[],

  // Whether claim action is required to obtain reward
  mustClaimRewards: boolean
|}

// -----------------------------------------------------------------------------
// Change Quote
// -----------------------------------------------------------------------------
export type ChangeQuoteRequest = {
  action: 'stake' | 'unstake' | 'claim',
  stakePolicyId: string,
  currencyCode: string,
  nativeAmount: string,
  signerSeed: string
}

export type QuoteAllocation = {
  allocationType: 'stake' | 'unstake' | 'claim' | 'fee',
  pluginId: string,
  currencyCode: string,
  nativeAmount: string
}

export type ChangeQuote = {
  allocations: QuoteAllocation[],
  approve: () => Promise<void>
}

// -----------------------------------------------------------------------------
// Stake Position
// -----------------------------------------------------------------------------

export type StakePositionRequest = {
  stakePolicyId: string,
  signerSeed: string
}

export type PositionAllocation = {
  // The type of asset for this allocation
  pluginId: string,
  currencyCode: string,
  // The type of the allocation
  allocationType: 'staked' | 'unstaked' | 'earned',
  // Amount of the asset allocated
  nativeAmount: string,
  /*
  A date/time when the allocation is available.
  Example: earned allocations with a future date are not available,
  but earned allocations with a past date are available to be earned.
  For some tokens (e.g. FIO), there is no earned allocation; rather there is
  an unstaked allocation which is locked until the date.
  */
  locktime?: Date
}

export type StakePosition = {
  allocations: PositionAllocation[],
  canStake: boolean,
  canUnstake: boolean,
  canClaim: boolean
}

// -----------------------------------------------------------------------------
// Stake Plugin
// -----------------------------------------------------------------------------

export type StakePlugin = {
  getStakePolicies: () => Promise<StakePolicy[]>,
  fetchChangeQuote: (request: ChangeQuoteRequest) => Promise<ChangeQuote>,
  fetchStakePosition: (request: StakePositionRequest) => Promise<StakePosition>
}

// -----------------------------------------------------------------------------
// Info Server Response
// -----------------------------------------------------------------------------

export type InfoServerResponse = {
  policies: { [string]: number }
}
