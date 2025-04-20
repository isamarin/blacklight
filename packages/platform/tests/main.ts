// import Logger from '../src/index'
// import Sink from '../src/sink'
// import { expect } from 'chai'

// describe('Logger', () => {

//     describe('new instance', () => {
//         it('should create an instance of Logger', function(){
//             const logger = new Logger('test')
//             expect(logger).to.be.an.instanceOf(Logger)
//         })

//         it('should have the correct properties', function(){
//             const logger = new Logger('test')
//             // @ts-ignore - _sink is private
//             expect(logger._sink).to.be.an.instanceOf(Sink)
//             // logger._sink.data is string[] with value []
//             // @ts-ignore - _sink.data is private
//             expect(logger._sink.data).to.be.an('array').that.is.empty
//             expect(logger.name).to.equal('test')
//         })

//         it('should have the correct values after adding a log entry', function(){
//             const logger = new Logger('test')
//             logger.log('test123')
//             // @ts-ignore - _Store is private
//             expect(logger._sink).to.be.an.instanceOf(Sink)
//             // @ts-ignore - _sink.data is private. Value is ['test123']
//             expect(logger._sink.data[0]).includes({
//                 data: 'test123'
//             })
//         })
//     })
// })