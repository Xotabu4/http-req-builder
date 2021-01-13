import { JsonRequest } from "./index"
import {strict as assert} from "assert"

// Make normal tests
async function test() {
    const resp0 = await new JsonRequest()
        .url('https://httpbin.org/non-exist')
        .send().catch(err => err)

    assert(resp0.message.includes('404 (Not Found)'))

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
}

test()