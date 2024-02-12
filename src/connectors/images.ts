import type { ImageFilters, ImageCard } from '@/models'
import { ApiBase } from './apiBase'
import { HTTPMethod, type EditImageResponse } from './models'

export class ImagesConnector extends ApiBase {
  constructor(endpoint: string) {
    super(endpoint)
  }

  public async getImages(page?: number, filters?: ImageFilters): Promise<ImageCard[]> {
    const images =
      (await this.request<ImageCard[]>(HTTPMethod.POST, 'getImages', { page, filters })) ?? []

    return images
  }

  public async editImage(id: string, categories: string[]): Promise<EditImageResponse> {
    const response = await this.request<EditImageResponse>(HTTPMethod.POST, 'editImage', {
      id,
      categories
    })

    if (!response) {
      throw 'Failed to save image'
    }

    return response
  }
}
