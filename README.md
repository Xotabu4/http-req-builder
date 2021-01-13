# http-req-builder
 
Wrapper around fabulous [gotjs](https://github.com/sindresorhus/got) library. 

This lib provides builder pattern, and simplifies and hides some of the gotjs features.

I personaly use this library for my API tests.

# Usage

```typescript
import { JsonRequest } from 'http-req-builder'

const resp = await new JsonRequest()
    .url('https://httpbin.org/post')
    .method('POST')
    .searchParams({
        "hello": "world"
    })
    .body({
        "testing": true
    })
    .send()

assert(resp.body.headers['User-Agent'].includes('got'))
assert(resp.body.json.testing)  
assert(resp.body.args.hello == 'world')  
```

- Start building your requests with `new JsonRequest()`
- Specify parameters with methods:
`prefixUrl` `url` `cookieJar` `method` `headers` `bearerToken` `searchParams` `body`
- Send constructed request with `.send()`, optionaly specify response body type with `.send<MyResponseBodyType>`
- `await` returned promise, and do whatever you need


# Extending

Feel free to `extend` `BaseHttpRequest` or `JsonRequest`, and add/override methods. For example, lets add simplest logging on each request:

```typescript
import { JsonRequest } from 'http-req-builder'

class MyRequest extends JsonRequest {
    constructor() {
        super()
        // See https://github.com/sindresorhus/got#hooks
        this.options.hooks = {
            beforeRequest: [options => {
                console.time(`Request took`)
            }],
            afterResponse: [response => {
                console.timeEnd(`Request took`)
                return response;
            }]
        }
    }
}

await new MyRequest()
    .url('https://httpbin.org/get')
    .send()

await new MyRequest()
    .url('https://httpbin.org/get')
    .send()

// Request took: 125.032ms
// Request took: 123.292ms
```

