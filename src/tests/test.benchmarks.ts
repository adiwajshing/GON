import { Serializer } from "../types";
import createRandomObj from "./createRandomObj"
import { JSONSerializer, V8Serializer } from "./Serializers";
import GONSerializer from "..";
import { writeFileSync } from "fs";

type TestType = {
    [obj: string]: { 
        [ser: string]: {
            serialize: { 
                time: number
                bytes: number
            },
            deserialize: { 
                time: number
            },
            propertyCount: number
        }
    }
}
const ITERATIONS = 750
const TEST_VECTORS = [...Array(15)].map(() => createRandomObj())
const SERIALIZERS = [
    { name: 'V8', serializer: V8Serializer },
    { name: 'json', serializer: JSONSerializer },
    { name: 'gon', serializer: GONSerializer }
]
const testResults: TestType = { }

function getCount(data) {
    let count = 0;
    for (var k in data) {
        data.hasOwnProperty(k) && count++;
        if(typeof data[k] === 'object' && !Buffer.isBuffer(data[k]) && !Array.isArray(data[k])) {
            count += getCount(data[k])
        }
    }
    return count
}

const testSerialization = (method: string, serializer: Serializer<Buffer | string>) => {
    let total = 0
    TEST_VECTORS.forEach ((value, i) => {
        const start = new Date()
        for (let i = 0; i < ITERATIONS;i++) {
            serializer.encode (value)
        }
        
        const end = new Date()
        const diff = end.getTime()-start.getTime()
        total += diff

        const propertyCount = getCount(value)
        const obj = `obj ${i}`
        testResults[obj] = testResults[obj] || {  }
        testResults[obj][method] = {
            serialize: {
                bytes: serializer.encode(value).length,
                time: diff,
            },
            deserialize: { time: 0 },
            propertyCount
        }
    })
    total /= TEST_VECTORS.length
    console.log (`[${method}] avg encoding took ${total}ms`)
}

const testDeserialization = (method: string, serializer: Serializer<Buffer | string>, print: boolean) => {
    let total = 0
    TEST_VECTORS.forEach ((value, i) => {
        const serialized = serializer.encode(value)
        const start = new Date()
        for (let i = 0; i < ITERATIONS;i++) {
            serializer.decode (serialized)
        }
        const end = new Date()
        const diff = end.getTime()-start.getTime()
        total += diff

        const obj = `obj ${i}`
        testResults[obj][method].deserialize = {
            time: diff
        }
    })

    total /= TEST_VECTORS.length
    console.log (`[${method}] avg decoding took ${total}ms`)

    if(print) {
        const output = JSON.stringify(testResults, undefined, 2)
        writeFileSync('./src/tests/bench-results.json', output)
    }
}

describe ('Benchmark Tests', () => {
    if(process.env.BENCH === '1') {
        for(const { name, serializer } of SERIALIZERS) {
            it(`should measure ${name} serialization`, () => (
                testSerialization(name, serializer)
            ))
            it(`should measure ${name} de-serialization`, () => (
                testDeserialization (name, serializer, name === SERIALIZERS[SERIALIZERS.length-1].name)
            ))
        }
    } else {
        it('should do nothing', () => {
            
        })
    }
})