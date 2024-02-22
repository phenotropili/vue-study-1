import type { ImageFilters, ImageCard } from '@/models'
import { ApiBase } from './apiBase'
import { HTTPMethod, type EditImageResponse, type GetImagesResponse } from './models'

export class ImagesConnector extends ApiBase {
  constructor(endpoint: string) {
    super(endpoint)
  }

  public async getImages(page?: number, filters?: ImageFilters): Promise<GetImagesResponse> {
    const response = (await this.request<GetImagesResponse>(HTTPMethod.POST, 'getImages', {
      page,
      filters
    })) ?? {
      images: [],
      pagesTotal: 0,
      categories: []
    }

    return response
  }

  public async editImage(_id: string, categories: string[]): Promise<EditImageResponse> {
    const response = await this.request<EditImageResponse>(HTTPMethod.POST, 'editImage', {
      _id,
      categories
    })

    if (!response) {
      throw 'Failed to save image'
    }

    return response
  }
}
