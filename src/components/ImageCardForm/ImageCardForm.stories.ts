import type { Meta, StoryObj } from '@storybook/vue3'

import ImageCardForm from './ImageCardForm.vue'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: 'Components/ImageCardForm',
  component: ImageCardForm,
  argTypes: {
    card: {
      description: 'Image card data'
    }
  },
  args: {
    card: {
      id: '-1',
      url: 'https://fishki.net/upload/users/2020/08/31/385211/1bd31ae68f7f75bb25d72d97156212ca.jpg'
    }
  },
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs']
} satisfies Meta<typeof ImageCardForm>

export default meta
type Story = StoryObj<typeof meta>
/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */
export const Primary: Story = {}
