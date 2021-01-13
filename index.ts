import type { Options, Method, GotRequestFunction, CancelableRequest, Response } from 'got';
import got from 'got';
import { CookieJar } from 'tough-cookie';

type ElementOf<T> = T extends (infer E)[] ? E : T;
export type BaseResponse<T> = CancelableRequest<Response<T>>

export abstract class BaseRequest {
    protected options: ElementOf<Parameters<GotRequestFunction>> = {
        http2: true
    };
    public prefixUrl(url: string | URL): this {
        this.options.prefixUrl = url
        return this
    }
    /**
     * @param url Can be full url, but only in case prefixUrl is not set
     */
    public url(url: string | URL): this {
        this.options.url = url
        return this
    }
    public cookieJar(cookiesJar: CookieJar): this {
        this.options.cookieJar = cookiesJar;
        return this
    }
    public method(method: Method): this {
        this.options.method = method
        return this
    }
    public headers(headers: Record<string, string | undefined>): this {
        this.options.headers = this.options.headers ?? {}
        this.options.headers = {
            ...this.options.headers,
            ...headers
        }
        return this;
    }
    public bearerToken(bearerToken?: string): this {
        return this.headers({
            'Authorization': bearerToken
        })
    }
    public searchParams(searchParams: Options["searchParams"]): this {
        this.options.searchParams = searchParams
        return this
    }
    public abstract body(body: any): this;
    public async send<T = unknown>(): Promise<BaseResponse<T>> {
        const errorStack = new Error().stack as string;
        const errorStackArray = errorStack.split('\n');
        // Excluding this method from stack, for better stacktraces
        const filteredStack = errorStackArray.slice(0, 1).concat(errorStackArray.slice(2, errorStackArray.length)).join('\n')
        try {
            return await got<T>(this.options as any)
        } catch (requestError) {
            requestError.message = `[${requestError.request?.options?.method}][${requestError?.request?.requestUrl}] => ${requestError.message} ${JSON.stringify(requestError?.response?.body)}`
            requestError.stack = filteredStack;
            throw requestError
        }
    }
}

export class JsonRequest extends BaseRequest {
    constructor() {
        super()
        this.options = {
            ...this.options,
            responseType: "json"
        }
    }
    public body(body: any): this {
        this.options.json = body;
        return this
    }
}
