/* globals describe it expect */
/* eslint-disable flowtype/require-valid-file-annotation */

import * as React from 'react'
import ShallowRenderer from 'react-test-renderer/shallow'

import { getTheme } from '../../components/services/ThemeContext.js'
import { TileComponent } from '../../components/tiles/Tile.js'

describe('Tile', () => {
  it('should render with loading props', () => {
    const renderer = new ShallowRenderer()

    const props = {
      body: 'string',
      children: 11,
      error: false,
      onPress: () => undefined,
      title: 'string',
      type: 'copy',
      contentPadding: true,
      maximumHeight: 'small',
      theme: getTheme()
    }
    const actual = renderer.render(<TileComponent {...props} />)

    expect(actual).toMatchSnapshot()
  })
})
