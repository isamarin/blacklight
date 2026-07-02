import { IncomingHttpHeaders } from 'http'
import https from 'https'

export default class Http {

    getRequest(host:string, path:string, headers:any, method = 'GET') {
        return new Promise<HttpResponse>((resolve, reject) => {

            const hostHeaders = {
                ...headers,
            }

            const options = {
                method: method,
                hostname: host,
                path: path,
                port: 443,
                headers: hostHeaders
            }

            const req = this.createRequest(options, resolve, reject)
            
            req.on('error', (error) => {
                reject(new Error('Unhandled error:'+ JSON.stringify(error)))
            })

            req.end()

        })
    }

    deleteRequest(host:string, path:string, headers:any) {
        return this.getRequest(host, path, headers, 'DELETE')
    }

    postRequest(host:string, path:string, headers:any, data:any, method = 'POST') {
        return new Promise<HttpResponse>((resolve, reject) => {

            const hostHeaders = {
                ...headers,
            }

            if(typeof data === 'object'){
                data = JSON.stringify(data)
            }

            const options = {
                method: method,
                hostname: host,
                path: path,
                port: 443,
                headers: hostHeaders
            }

            const req = this.createRequest(options, resolve, reject)
            
            req.on('error', (error) => {
                reject(new Error('Unhandled error:'+ JSON.stringify(error)))
            })

            req.write(data)
            req.end()

        })
    }

    putRequest(host:string, path:string, headers:any, data:any) {
        return this.postRequest(host, path, headers, data, 'PUT')
    }

    createRequest(options:any, resolve:any, reject:any){
        return https.request(options, (res) => {
            let responseData = ''
            
            res.on('data', (data) => {
                responseData += data
            })

            res.on('close', () => {
                if(res.statusCode == 200 || res.statusCode == 204){
                    if(responseData.toString() === ''){
                        resolve(new HttpResponse({}, res.headers, options))
                    } else {
                        try {
                            resolve(new HttpResponse(JSON.parse(responseData.toString()), res.headers, options))
                        } catch {
                            reject(new Error('Error fetching '+options.hostname+options.path+'. Details: '+ JSON.stringify({
                                statuscode: res.statusCode,
                                headers: res.headers,
                                body: responseData.toString().slice(0, 500),
                                message: 'Invalid JSON from '+options.hostname+options.path
                            }, null, 2)))
                        }
                    }
                } else {
                    reject(new Error('Error fetching '+options.hostname+options.path+'. Details: '+ JSON.stringify({
                        statuscode: res.statusCode,
                        headers: res.headers,
                        body: responseData.toString().slice(0, 500),
                        message: 'Error fetching '+options.hostname+options.path
                    }, null, 2)))
                }
            })
        })
    }
}


export class HttpResponse<T = any> {

    data:T
    headers:IncomingHttpHeaders
    options:any

    constructor(data:any, headers:IncomingHttpHeaders, options:any){
        this.data = data
        this.headers = headers
        this.options = options

        // delete(this.options.headers['Authorization'])
    }

    header(){
        return this.headers
    }

    body(){
        return this.data
    }
}