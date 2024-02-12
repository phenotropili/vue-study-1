import axios from 'axios'
import type { AxiosInstance, AxiosError } from 'axios'
import { HTTPMethod } from './models'

export class ApiBase {
  private readonly axiosInstance: AxiosInstance

  constructor(
    endpoint: string,
    private readonly onError?: (status: number, message?: string, data?: any) => void
  ) {
    this.axiosInstance = axios.create({
      baseURL: endpoint,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  protected async request<Res, Body = any, Params = any>(
    method: HTTPMethod,
    url: string,
    body?: Body,
    params?: Params
  ): Promise<Res | undefined> {
    try {
      const requestUrl = url[0] === '/' ? url.slice(1) : url

      const response = await this.axiosInstance.request<Res>({
        url: requestUrl,
        method,
        params,
        data: body
      })

      return response.data
    } catch (e: unknown) {
      const error = e as Error | AxiosError
      if (this.onError) {
        if (axios.isAxiosError(e)) {
          this.onError(
            (error as AxiosError).status ?? 500,
            error.message,
            (error as AxiosError).toJSON()
          )
        }

        this.onError(500, error.message)
      }
    }
  }
}
