import type { ImageFilters } from '@/models'
import { ApiBase } from './apiBase'
import { HTTPMethod } from './models'

export class ImagesConnector extends ApiBase {
  constructor(endpoint: string) {
    super(endpoint)
  }

  public async getImages(page?: number, filters?: ImageFilters): Promise<string[]> {
    const images =
      (await this.request<string[]>(HTTPMethod.GET, 'getImages', { page, filters })) ?? []

    return images
  }
}
