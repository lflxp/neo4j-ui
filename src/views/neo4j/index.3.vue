<template lang='pug'>
  <el-container>
    <el-header>
      <el-row class="demo-autocomplete">
            <el-col :span="24">
                <el-autocomplete placeholder="example: MATCH (a)-[r:DIRECTED]->(b) RETURN a,b,r" :fetch-suggestions="querySearch" @select="search" class="inline-input" v-model="cql" clearable>
                    <template slot="prepend">$</template>
                    <template slot="append">
                        <el-button type="primary" icon="el-icon-caret-right" @click="search"></el-button>
                    </template>
                </el-autocomplete>
            </el-col>
        </el-row>
    </el-header>
    <el-main>
      <el-card shadow="always">
        <div class="flowChart" id="flowChart"></div>
      </el-card> 
    </el-main>
    <el-footer>
      <el-card class="box-card">
        <el-table
          :data="tableData"
          style="width: 100%">
          <el-table-column
            prop="date"
            label="日期"
            width="180">
          </el-table-column>
          <el-table-column
            prop="name"
            label="姓名"
            width="180">
          </el-table-column>
          <el-table-column
            prop="address"
            label="地址">
          </el-table-column>
        </el-table>
      </el-card>
    </el-footer>
  </el-container>
</template>
<script>
/**
 * 力导向图
 */
import * as d3 from 'd3'
let gs = '',
    forceSimulation = '',
    links = '',
    linksText = ''
let nodes = [{ name: '湖南' }, { name: '毛泽东' }, { name: '主席' }]
 
let edges = [
    { source: 0, target: 1, relation: '籍贯', value: 1.3 },
    { source: 1, target: 2, relation: '职责', value: 1 }
]
export default {
    name: 'Scale',
    data() {
        return {
            id: '',
            cql: '',
            tableData: [{
              date: '2016-05-02',
              name: '王小虎',
              address: '上海市普陀区金沙江路 1518 弄'
            }, {
              date: '2016-05-04',
              name: '王小虎',
              address: '上海市普陀区金沙江路 1517 弄'
            }, {
              date: '2016-05-01',
              name: '王小虎',
              address: '上海市普陀区金沙江路 1519 弄'
            }, {
              date: '2016-05-03',
              name: '王小虎',
              address: '上海市普陀区金沙江路 1516 弄'
            }]
        }
    },
    methods: {
        uuid() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1)
            }
            return (
                s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4()
            )
        },
        ticked() {
            links
                .attr('x1', function(d) {
                    return d.source.x
                })
                .attr('y1', function(d) {
                    return d.source.y
                })
                .attr('x2', function(d) {
                    return d.target.x
                })
                .attr('y2', function(d) {
                    return d.target.y
                })
 
            linksText
                .attr('x', function(d) {
                    return (d.source.x + d.target.x) / 2
                })
                .attr('y', function(d) {
                    return (d.source.y + d.target.y) / 2
                })
 
            gs.attr('transform', d => {
                return 'translate(' + d.x + ',' + d.y + ')'
            })
        },
        dragStart(d) {
            if (!d3.event.active) {
                //设置衰减系数，对节点位置移动过程的模拟，数值越高移动越快，数值范围[0，1]
                forceSimulation.alphaTarget(0.8).restart()
            }
            d.fx = d.x
            d.fy = d.y
        },
        dragEnd(d) {
            d.fx = d3.event.x
            d.fy = d3.event.y
        },
        drag(d) {
            if (!d3.event.active) {
                forceSimulation.alphaTarget(0)
            }
            d.fx = null
            d.fy = null
        },
        loadAll() {
          return [
            { "value": "match (a)-[r:ACTED_IN]->(b) return a,b,r"},
            { "value": "MATCH (a)-[r:DIRECTED]->(b) RETURN a,b,r LIMIT 25" },
            { "value": "CREATE INDEX ON :<LabelName>(<propertyKey>)" },
            { "value": "CREATE CONSTRAINT ON (n:<LabelName>) ASSERT n.<propertyKey> IS UNIQUE" },
            { "value": "MATCH (n1)-[r]->(n2) RETURN r, n1, n2 LIMIT 25" },
            { "value": "CREATE (database:Database {name:'Neo4j'})-[r:SAYS]->(message:Message {name:'Hello World!'}) RETURN database, message, r" },
            { "value": "MATCH (cloudAtlas {title: 'Cloud Atlas'}) RETURN cloudAtlas" },
            { "value": "MATCH (people:Person) RETURN people.name LIMIT 10" },
            { "value": "MATCH (nineties:Movie) WHERE nineties.released >= 1990 AND nineties.released < 2000 RETURN nineties.title" },
            { "value": "MATCH (tom:Person {name: 'Tom Hanks'})-[:ACTED_IN]->(tomHanksMovies) RETURN tom,tomHanksMovies" },
            { "value": "MATCH (tom:Person {name:'Tom Hanks'})-[:ACTED_IN]->(m)<-[:ACTED_IN]-(coActors) RETURN coActors.name" },
            { "value": "MATCH (tom:Person {name:'Tom Hanks'})-[a:ACTED_IN]->(m)<-[b:ACTED_IN]-(coActors) RETURN tom,a,m,b,coActors" },
            { "value": "MATCH (people:Person)-[relatedTo]-(:Movie {title: 'Cloud Atlas'}) RETURN people.name, Type(relatedTo), relatedTo" },
            { "value": "MATCH (bacon:Person {name:'Kevin Bacon'})-[*1..4]-(hollywood) RETURN DISTINCT hollywood" },
            { "value": "MATCH p=shortestPath((bacon:Person {name:'Kevin Bacon'})-[*]-(meg:Person {name:'Meg Ryan'})) RETURN p" },
            { "value": `MATCH (tom:Person {name:"Tom Hanks"})-[:ACTED_IN]->(m)<-[:ACTED_IN]-(coActors),
        (coActors)-[:ACTED_IN]->(m2)<-[:ACTED_IN]-(cocoActors)
  WHERE NOT (tom)-[:ACTED_IN]->()<-[:ACTED_IN]-(cocoActors) AND tom <> cocoActors
  RETURN cocoActors.name AS Recommended, count(*) AS Strength ORDER BY Strength DESC` },
            { "value": `MATCH (tom:Person {name:"Tom Hanks"})-[:ACTED_IN]->(m)<-[:ACTED_IN]-(coActors),
        (coActors)-[:ACTED_IN]->(m2)<-[:ACTED_IN]-(cruise:Person {name:"Tom Cruise"})
  RETURN tom, m, coActors, m2, cruise` },
            { "value": "MATCH (n) RETURN n" },
            { "value": "**慎用 MATCH (n) DETACH DELETE n**" },
            { "value": "MATCH (n) RETURN count(n)" },
            { "value": "MATCH ()-->() RETURN count(*);" },
            { "value": `MATCH (n) WHERE rand() <= 0.1
  RETURN
  DISTINCT labels(n),
  count(*) AS SampleSize,
  avg(size(keys(n))) as Avg_PropertyCount,
  min(size(keys(n))) as Min_PropertyCount,
  max(size(keys(n))) as Max_PropertyCount,
  avg(size( (n)-[]-() ) ) as Avg_RelationshipCount,
  min(size( (n)-[]-() ) ) as Min_RelationshipCount,
  max(size( (n)-[]-() ) ) as Max_RelationshipCount` },
            { "value": "CALL db.labels()" },
            { "value": "CALL db.schema()" },
            { "value": "CALL db.relationshipTypes()" },
            { "value": "CALL dbms.procedures()" },
            { "value": "CALL dbms.functions()" },
            { "value": "CALL db.awaitIndex(':Person(name)')" },
            { "value": "CALL db.resampleIndex(':Person(name)')" },
            { "value": `LOAD CSV WITH HEADERS FROM "http://data.neo4j.com/northwind/categories.csv" AS row
  CREATE (n:Category)
  SET n = row` },
            { "value": `LOAD CSV WITH HEADERS FROM "http://data.neo4j.com/northwind/products.csv" AS row
  CREATE (n:Product)
  SET n = row,
    n.unitPrice = toFloat(row.unitPrice),
    n.unitsInStock = toInteger(row.unitsInStock), n.unitsOnOrder = toInteger(row.unitsOnOrder),
    n.reorderLevel = toInteger(row.reorderLevel), n.discontinued = (row.discontinued <> "0")`},
            { "value": `LOAD CSV WITH HEADERS FROM "http://data.neo4j.com/northwind/suppliers.csv" AS row
  CREATE (n:Supplier)
  SET n = row`},
            { "value": `CREATE INDEX ON :Category(categoryID)`},
            { "value": `CREATE INDEX ON :Supplier(supplierID)`},
            { "value": `CREATE INDEX ON :Product(productID)`},
            { "value": `MATCH (p:Product),(c:Category)
  WHERE p.categoryID = c.categoryID
  CREATE (p)-[:PART_OF]->(c)`},
            { "value": `MATCH (p:Product),(s:Supplier)
  WHERE p.supplierID = s.supplierID
  CREATE (s)-[:SUPPLIES]->(p)`},
            { "value": `MATCH (s:Supplier)-->(:Product)-->(c:Category)
  RETURN s.companyName as Company, collect(distinct c.categoryName) as Categories`},
            { "value": `MATCH (c:Category {categoryName:"Produce"})<--(:Product)<--(s:Supplier)
  RETURN DISTINCT s.companyName as ProduceSuppliers`},
            { "value": `LOAD CSV WITH HEADERS FROM "http://data.neo4j.com/northwind/order-details.csv" AS row
  MATCH (p:Product), (o:Order)
  WHERE p.productID = row.productID AND o.orderID = row.orderID
  CREATE (o)-[details:ORDERS]->(p)
  SET details = row,
    details.quantity = toInteger(row.quantity)`},
            { "value": `MATCH (cust:Customer)-[:PURCHASED]->(:Order)-[o:ORDERS]->(p:Product),
        (p)-[:PART_OF]->(c:Category {categoryName:"Produce"})
  RETURN DISTINCT cust.contactName as CustomerName, SUM(o.quantity) AS TotalProductsPurchased`},
            { "value": ``},
          ];
        },
      createFilter(queryString) {
          return (restaurant) => {
            return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
          };
      },
      querySearch(queryString, cb) {
          var restaurants = this.restaurants;
          var results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants;
          // 调用 callback 返回建议列表的数据
          cb(results);
      },
      search() {
        console.log('search')
      }
    },
    created() {
        this.id = this.uuid()
    },
    mounted() {
        this.restaurants = this.loadAll();
        //1.创建svg画布
        let marge = { top: 160, bottom: 60, left: 160, right: 60 }
        let width = `${document.documentElement.clientWidth}`
        // let height = 600
        let height = `${document.documentElement.clientHeight}`/2
        
        const svg = d3
            .select('#flowChart')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
        let g = svg
            .append('g')
            .attr(
                'transform',
                'translate(' + marge.top + ',' + marge.left + ')'
            )
 
        //2.设置一个color的颜色比例尺，为了让不同的扇形呈现不同的颜色
        var colorScale = d3
            .scaleOrdinal()
            .domain(d3.range(nodes.length))
            .range(d3.schemeCategory10)
 
        //3.新建一个力导向图
        // https://bl.ocks.org/mbostock/533daf20348023dfdd76
        // https://bl.ocks.org/almsuarez/baa897c189ed64ba2bb32cde2876533b
        forceSimulation = d3
            .forceSimulation()
            // .force('link', d3.forceLink().id(function(d) { return d.name; }).distance(40))
            .force('link', d3.forceLink())
            .force('charge', d3.forceManyBody().strength(-200))
            .force('center', d3.forceCenter())
 
        //4. 初始化力导向图
        //生成节点数据
        forceSimulation.nodes(nodes).on('tick', this.ticked)
        //生成边数据
        forceSimulation
            .force('link')
            .links(edges)
            .distance(function(d) {
                //每一边的长度
                return d.value * 100
            })
        //设置图形的中心位置
        forceSimulation
            .force('center')
            .x(width / 4)
            .y(height / 4)
 
        
        //5. 绘制边(有了节点和边的数据后)
        links = g
            .append('g')
            .selectAll('line')
            .data(edges)
            .enter()
            .append('line')
            .attr('stroke', function(d, i) {
                return colorScale(i)
            })
            .attr('stroke-width', 1)
        linksText = g
            .append('g')
            .selectAll('text')
            .data(edges)
            .enter()
            .append('text')
            .text(function(d) {
                return d.relation
            })
 
        //6. 绘制节点, 先为节点和节点上的文字分组
        gs = g
            .selectAll('.circleText')
            .data(nodes)
            .enter()
            .append('g')
            .attr('transform', function(d, i) {
                var cirX = d.x
                var cirY = d.y
                return 'translate(' + cirX + ',' + cirY + ')'
            })
            .call(
                d3
                    .drag()
                    .on('start', this.dragStart)
                    .on('drag', this.drag)
                    .on('end', this.dragEnd)
            )
 
        //绘制节点
        gs.append('circle')
            .attr('r', 10)
            .attr('fill', function(d, i) {
                return colorScale(i)
            })
        //文字
        gs.append('text')
            .attr('x', -10)
            .attr('y', -20)
            .attr('dy', 10)
            .text(function(d) {
                return d.name
            })
    }
}
</script>
<style lang='scss' scoped>
.force-pane {
    width: 100%;
    height: 1000px;
}

.el-autocomplete{
  width: 100%;
}

.el-header {
  padding: 20px 20px;
}
</style>
