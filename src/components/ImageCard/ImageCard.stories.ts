import type { Meta, StoryObj } from '@storybook/vue3'

import ImageCard from './ImageCard.vue'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: 'Components/ImageCard',
  component: ImageCard,
  argTypes: {
    url: {
      description: 'Image URL',
      type: 'string'
    },
    disabled: {
      description: 'Disable controls option for previews',
      type: 'boolean'
    },
    onFavToggle: {
      type: 'function'
    },
    onDelete: {
      type: 'function'
    },
    onLoadError: {
      type: 'function'
    }
  },
  args: {
    id: '1',
    url: 'https://fishki.net/upload/users/2020/08/31/385211/1bd31ae68f7f75bb25d72d97156212ca.jpg',
    onLoadError: () => {
      console.log('Load error')
    }
  },
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs']
} satisfies Meta<typeof ImageCard>

export default meta
type Story = StoryObj<typeof meta>
/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */
export const Primary: Story = {}

export const WideImage: Story = {
  args: {
    url: 'https://k-a-r-t-i-n-a.ru/wp-content/uploads/2018/02/devyatyj-val-i.-ajvazovskogo.-obzor-kartiny-2048x1371.jpg'
  }
}

export const TallImage: Story = {
  args: {
    url: 'https://smallbay.ru/images3/briullov01.jpg'
  }
}

export const WithTags: Story = {
  args: {
    categories: ['foo', 'iamlongtag', 'i_am_a_very_very_very_very_long_tag']
  }
}
