import Platform from '../src/index'
import { expect } from 'chai'

import { version } from '../package.json'

describe('Platform', () => {

    describe('new instance', () => {
        it('should create an instance of Platform', function(){
            const platform = new Platform()
            expect(platform).to.be.an.instanceOf(Platform)
        })
        
        it('should be able to query platform version', async function(){
            const platform = new Platform()
            const caller = platform.appRouter.createCaller({})

            const response = await caller.version()
            expect(response).to.equal(version)
        })

        it('should be able to ping appRouter', async function(){
            const platform = new Platform()
            const caller = platform.appRouter.createCaller({})

            const response = await caller.ping()

            expect(response).to.equal('pong')
        })

        // it('should have the correct properties', function(){
        //     const logger = new Logger('test')
        //     // @ts-ignore - _sink is private
        //     expect(logger._sink).to.be.an.instanceOf(Sink)
        //     // logger._sink.data is string[] with value []
        //     // @ts-ignore - _sink.data is private
        //     expect(logger._sink.data).to.be.an('array').that.is.empty
        //     expect(logger.name).to.equal('test')
        // })

        // it('should have the correct values after adding a log entry', function(){
        //     const logger = new Logger('test')
        //     logger.log('test123')
        //     // @ts-ignore - _Store is private
        //     expect(logger._sink).to.be.an.instanceOf(Sink)
        //     // @ts-ignore - _sink.data is private. Value is ['test123']
        //     expect(logger._sink.data[0]).includes({
        //         data: 'test123'
        //     })
        // })
    })
})