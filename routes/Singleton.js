var hashTable = require('hashtable')
var ipinstance = new hashTable()
module.exports = {
    getInstance : () => ipinstance
}