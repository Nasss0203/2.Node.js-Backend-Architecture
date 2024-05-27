
const _ = require('lodash')
const { Types } = require('mongoose')

const convertToObjectIdMongodb = id => new Types.ObjectId(id)


const getInfoData = ({ fields = [], object = {} }) => {
    return _.pick(object, fields)
}

const getSelectData = (select = []) => {
    return Object.fromEntries(select.map(el => [el, 1]))
}

const unGetSelectData = (select = []) => {
    return Object.fromEntries(select.map(el => [el, 0]));
}

const removeUnderfine = obj => {
    Object.keys(obj).forEach(k => {
        if (obj[k] == null) {
            delete obj[k]
        }
    })
    return obj
}

const updateNestedObjectParser = obj => {
    // Initialize an empty object to store the final result
    const final = {}
    // Iterate over each key in the input object
    Object.keys(obj).forEach(k => {
        // Check if the value corresponding to the key is an object (but not an array)
        if (typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
            // Recursively call updateNestedObjectParser to process the nested object
            const response = updateNestedObjectParser(obj[k])
            // Iterate over each key in the nested response object
            Object.keys(response).forEach(a => {
                // Concatenate the current key with the nested key using a dot (.)
                // and store the result in the final object
                final[`${k}.${a}`] = response[a]
            })
        } else {
            // If the value is not an object, directly add it to the final object
            final[k] = obj[k]
        }
    })
    // Return the final flattened object
    return final
}



module.exports = {
    getInfoData,
    getSelectData,
    unGetSelectData,
    removeUnderfine,
    updateNestedObjectParser,
    convertToObjectIdMongodb
}