interface CustomError extends Error {
	response?: Response | Promise<Response>;
}

class APIInterceptor {
	private static requestInterceptors: ((config: RequestInit) => RequestInit)[] = [];
	private static responseInterceptors: ((response: Response) => Promise<Response>)[] = [];
	private static errorInterceptors: ((error: Error) => Promise<Error>)[] = [];

	static addRequestInterceptor(interceptor: (config: RequestInit) => RequestInit) {
		this.requestInterceptors.push(interceptor);
	}

	static addResponseInterceptor(interceptor: (response: Response) => Promise<Response>) {
		this.responseInterceptors.push(interceptor);
	}

	static addErrorInterceptor(interceptor: (error: Error) => Promise<Error>) {
		this.errorInterceptors.push(interceptor);
	}

	static executeRequestInterceptors(config: RequestInit): RequestInit {
		let req = config;
		for (const interceptor of this.requestInterceptors) {
			req = interceptor(req);
		}
		return req;
	}

	static async executeResponseInterceptors(response: Response): Promise<Response> {
		let res = response;
		for (const interceptor of this.responseInterceptors) {
			res = await interceptor(res);
		}
		return res;
	}

	static async executeErrorInterceptors(error: Error) {
		let err = error;
		for (const interceptor of this.errorInterceptors) {
			err = await interceptor(err);
		}
		return err;
	}
}

APIInterceptor.addRequestInterceptor((config: RequestInit) => {
	config.headers = {
		...config.headers,
		'Content-Type': 'application/json',
	};
	return config;
});

APIInterceptor.addResponseInterceptor((response: Response) => {
	if (!response.ok) {
		// Add a toast notification, message: something went wrong
		// throw new Error('Request failed');
		return Promise.reject({
			status: response.status,
			statusText: response.statusText || 'Request failed',
			response: response.json(),
		});
	}

	if (response.status === 401) {
		// Redirect to login page
		// throw new Error('Unauthorized');
		return Promise.reject({
			status: response.status,
			statusText: response.statusText || 'Unauthorized',
			response: response.json(),
		});
	}

	if (response.status === 403) {
		// Redirect to forbidden page
		// throw new Error('Forbidden');
		return Promise.reject({
			status: response.status,
			statusText: response.statusText || 'Forbidden',
			response: response.json(),
		});
	}

	if (response.status === 404) {
		// Redirect to not found page
		// throw new Error('Not Found');
		return Promise.reject({
			status: response.status,
			statusText: response.statusText || 'Not Found',
			response: response.json(),
		});
	}

	return response.json();
});

APIInterceptor.addErrorInterceptor((error: CustomError) => {
	if (error.message === 'Failed to fetch' && navigator.onLine === false) {
		return Promise.reject({ status: 0, statusText: 'No internet connection' });
	}

	if (error.response && error.response instanceof Promise) {
		return error.response.then(async (response: Response) => {
			return Promise.reject({
				...error,
				response: await response,
			});
		});
	}
	return Promise.reject(error);
	// Here we can implement if request failed, we can add retry api call logic
});

export default APIInterceptor;
