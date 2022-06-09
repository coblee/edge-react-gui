// @flow
// globals spec
// import ENV from '../env.json'

type fiatList = {
  value: string,
  label: string
}

type data = {
  walletId: string,
  key: string
}

export const helpers = (spec: any) => ({
  resolveModal: async (modalName: string, returnValue: string) => {
    const modal = await spec.findComponent(modalName)
    return await modal.props.bridge.resolve(returnValue)
  },
  getFiatList: async (currencyListName: string): Promise<fiatList> => {
    const fiatList = await spec.findComponent(currencyListName)
    return fiatList.props.data
  },
  getWalletListRows: async (walletListName: string): Promise<data> => {
    const walletList = await spec.findComponent(walletListName)
    return walletList.props.data
  },
  getWalletListCodes: async (walletListName: string): Promise<data> => {
    const walletList = await spec.findComponent(walletListName)
    return walletList.props.data
  },
  navigate: async (buttonName: string, time?: number = 1000) => {
    await spec.press(buttonName)
    await spec.pause(time)
  },
  closeModal: async (modalName: string, time?: number = 1000) => {
    await spec.press(`${modalName}.Close`)
    await spec.pause(time)
  },
  navigateBack: async (sceneName: string, time?: number = 1000) => {
    await spec.press(`${sceneName}.Back`)
    await spec.pause(time)
  }
})
