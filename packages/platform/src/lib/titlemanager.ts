import Http from './http.js'

export default class TitleManager {

    private _queue: string[] = []
    private _httpClient = new Http()
    private _titles:Map<string, any> = new Map()

    async queueItems(items:string[]){
        console.log('Queueing items:', items)
        this._queue = [...this._queue, ...items]
    }

    async processQueue(token:string){
        console.log('Processing Queue:', this._queue)

        try {
            const itemsToProcess = this._queue.splice(0, 20); // Get the next 20 items

            for(const item of itemsToProcess){
                if(this._titles.has(item)){
                    console.log('Item already in titles:', item)
                    // Remove from itemsToProcess
                    const index = itemsToProcess.indexOf(item);
                    if (index > -1) {
                        itemsToProcess.splice(index, 1);
                    }
                }
            }
            
            if(itemsToProcess.length > 0){
                const result = await this._httpClient.postRequest('catalog.gamepass.com', `/v3/products?hydration=RemoteHighSapphire0&market=US&language=en-us`, {
                    'Authorization': `Bearer ${token}`,
                    'ms-cv': '0.0',
                    'calling-app-name': 'Blacklight',
                    'calling-app-version': '3.0.0',
                },{
                    Products: itemsToProcess,
                })
                
                // this._titles.set(queueItem, result)
                for(const product in result.data.Products){
                    console.log(result.data.Products[product])
                    this._titles.set(result.data.Products[product].StoreId, result.data.Products[product])
                }
                return
            }
        } catch (error) {
            console.error('Error processing queue:', error)
            return
        }
    }

    async processQueueAndReturn(items:string[], token:string){
        while(this._queue.length > 0){
            await this.processQueue(token)
        }
        // @TODO: Return only the items we want
        
        console.log('Returning items:', this._titles, items)
        return Array.from(this._titles.values())
    }
        
        

}