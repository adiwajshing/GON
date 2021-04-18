
// from: https://stackoverflow.com/questions/2443901/random-object-generator-in-javascript
const createRandomObj = (fieldCount?: number, allowNested?: boolean) => {
    fieldCount = fieldCount || randomInt (50)
    allowNested = typeof allowNested === 'undefined' ? randomInt (2) === 0 : allowNested
    let generatedObj = {};

    for(let i = 0; i < fieldCount; i++) {
        let generatedObjField;

        switch(randomInt(allowNested ? 8 : 7)) {

            case 0:
            generatedObjField = randomInt(100000000);
            break;

            case 1:
            generatedObjField = Math.random();
            break;

            case 2:
            generatedObjField = Math.random() < 0.5 ? true : false;
            break;

            case 3:
            generatedObjField = randomString(randomInt(4) + 4);
            break;

            case 4:
            generatedObjField = null;
            break;
            
            case 5:
            generatedObjField = Buffer.from( [...Array(randomInt(4096))].map(() => Math.floor(Math.random() * 254)+1) )
            break;
            
            case 6:
            generatedObjField = new Date()
            break;

            case 7:
            generatedObjField = [...Array(10)].map (() => Math.random())
            break;

            case 8:
            generatedObjField = createRandomObj(randomInt(20), randomInt(5) >= 3);
            break;
        }
        generatedObj[randomString(8)] = generatedObjField;
    }
    return generatedObj as any
}

// helper functions

function randomInt(rightBound)
{
    return Math.floor(Math.random() * rightBound);
}

function randomString(size)
{
    var alphaChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var generatedString = '';
    for(var i = 0; i < size; i++) {
        generatedString += alphaChars[randomInt(alphaChars.length)];
    }
    return generatedString;
}

export default createRandomObj