// @flow
// globals spec
// import ENV from '../env.json'

type data = {
  walletId: string,
  key: string
}

export const helpers = (spec: any) => ({
  getWalletListRows: async (walletListName: string): Promise<data> => {
    const walletList = await spec.findComponent(walletListName)
    console.log('walletListRenderData', walletList.props.data)
    return walletList.props.data
  },
  longPress: async (walletName: string) => {
    const row = await spec.findComponent(walletName)
    row.props.onPress()
  },
  fillInFlipInput: async (walletListName: string) => {
    const EnterFiatAmount = await spec.findComponent(walletListName)
    console.log('EnterFiatAmount', EnterFiatAmount.props.textInputFrontFocus)
    return EnterFiatAmount.props.textInputFrontFocus === true
  },
  closeModal: async (modalName: string, returnValue: string) => {
    const modal = await spec.findComponent(modalName)
    return await modal.props.bridge.resolve(returnValue)
  }
  // closeFlipInputModal: async (modalName: string) => {
  //   const modal = await spec.findComponent(modalName)
  //   console.log('CLoseModal', modal.props.onNext)
  //   return await modal.props.onNext
  // }
})

// If invalid address then the flipInput should not open
