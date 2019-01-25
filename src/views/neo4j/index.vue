<template>
  <div id="app">
  </div>
</template>

<script>
import search from '../../utils/force/search' 
import Http from '@/utils/service'

export default {
  data() {
    return {
    }
  },
  mounted() {
    var arg = { "cql" : "match (a:Person{name:'Tom Hanks'})-[r:ACTED_IN]->(b) return a,b,r" }
    Http.getCql(arg).then(data => {
      console.log(data)
      this.render(data)
    })
    .catch(error=>{
      console.error(error)
    })
  },
  methods: {
    render (data) {
      const config = {
        width: 800,
        height: 600
      }
      const searchNeo4j = new search('#app', config)
      searchNeo4j.drawForce(data)
    }
  }
}
</script>

<style lang='scss' scoped>
.force-pane {
    width: 100%;
    height: 1000px;
}
.node {
  opacity: 0.5;
}

.node:hover {
  opacity: 1;
}

.link {
  stroke: #999;
  stroke-opacity: 0.3;
}
</style>