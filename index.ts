import type { Options, Method, Response, GotRequestFunction } from 'got';
import got from 'got';
import { CookieJar } from 'tough-cookie';
import * as FormData  from 'form-data';

type ElementOf<T> = T extends (infer E)[] ? E : T;

export abstract class BaseHttpRequest {
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
    public async send<T = any>(): Promise<Response<T>> {
        // Patching async stacktrace that leads to nowhere
        const stack = new Error().stack
        try {
            return await got<T>(this.options as any)
        } catch (err) {
            if (err instanceof got.HTTPError) {
                err.message = `
                [${err?.options?.method}]: ${err?.options?.url} => ${err?.response?.statusCode} 

                ${err.message} 

                ${err?.response?.rawBody?.toString()}
                `
            }
            err.stack = `${err.message} \n${stack}`
            throw err
        }
    }
}

export class JsonRequest extends BaseHttpRequest {
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

export class FormRequest extends BaseHttpRequest {
    public body(form: FormData): this {
        this.options.form = form;
        return this
    }
}
