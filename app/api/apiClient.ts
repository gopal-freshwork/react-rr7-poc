import APIInterceptor from './interceptors';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

class APIClient {
	// TODO: Need to move to Util to handle in both local and production as same logic
	private API_HOST: string = process.env.NODE_ENV === 'development' ? 'http://localhost:6789' : '';

	private async request<T>(
		url: string,
		method: RequestMethod,
		body?: object,
		options: RequestInit = {},
	): Promise<T> {
		let requestConfig: RequestInit = {
			method,
			body: body ? JSON.stringify(body) : undefined,
			headers: {},
			...options,
		};

		// Pass interceptors to modify requestConfig
		requestConfig = APIInterceptor.executeRequestInterceptors(requestConfig);

		try {
			const fullUrl = `${this.API_HOST}${url}`;
			const response = await fetch(fullUrl, requestConfig);
			return (await APIInterceptor.executeResponseInterceptors(response)) as T;
		} catch (error) {
			return Promise.reject(await APIInterceptor.executeErrorInterceptors(error as Error));
		}
	}

	async get<T>(url: string, options?: RequestInit): Promise<T> {
		return await this.request(url, 'GET', undefined, options);
	}

	async post<T>(url: string, body?: object, options?: RequestInit): Promise<T> {
		return this.request(url, 'POST', body, options);
	}

	async put<T>(url: string, body?: object, options?: RequestInit): Promise<T> {
		return this.request(url, 'PUT', body, options);
	}

	async delete<T>(url: string, options?: RequestInit): Promise<T> {
		return this.request(url, 'DELETE', undefined, options);
	}
}

export default new APIClient();
