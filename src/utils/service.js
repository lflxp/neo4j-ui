import http from 'axios'

const ip = 'http://127.0.0.1:8080'
const url = ip + '/v1/neo4j/search'

export default {
    getCql(args) {
        return http.post(url,args)
    }
}