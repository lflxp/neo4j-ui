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
        <div id="option">
          <input name="updateButton" 
                type="button" 
                value="Update" 
                onclick="updateData()" />
        </div>
        <br>
        <div id="option">
          <input name="resetButton" 
                type="button" 
                value="Reset" 
                onclick="resetData()" />
        </div>
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
 * https://bl.ocks.org/almsuarez/baa897c189ed64ba2bb32cde2876533b
 */
let gs = '',
    forceSimulation = '',
    links = '',
    linksText = ''
let nodes = [{ name: '湖南' }, { name: '毛泽东' }, { name: '主席' },
  { name: '湖南1' }, { name: '毛泽东1' }, { name: '主席1' },
  { name: '湖南2' }, { name: '毛泽东2' }, { name: '主席2' }
]
 
let edges = [
    { source: 0, target: 1, relation: '籍贯', value: 1.3 },
    { source: 1, target: 2, relation: '职责', value: 1 },
    { source: 5, target: 6, relation: '职责', value: 1 },
    { source: 4, target: 5, relation: '职责', value: 1 },
    { source: 3, target: 5, relation: '职责', value: 1 },
    { source: 2, target: 4, relation: '职责', value: 1 },
    { source: 3, target: 1, relation: '职责', value: 1 },
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
        // ticked() {
        //     links
        //         .attr('x1', function(d) {
        //             return d.source.x
        //         })
        //         .attr('y1', function(d) {
        //             return d.source.y
        //         })
        //         .attr('x2', function(d) {
        //             return d.target.x
        //         })
        //         .attr('y2', function(d) {
        //             return d.target.y
        //         })
 
        //     linksText
        //         .attr('x', function(d) {
        //             return (d.source.x + d.target.x) / 2
        //         })
        //         .attr('y', function(d) {
        //             return (d.source.y + d.target.y) / 2
        //         })
 
        //     gs.attr('transform', d => {
        //         return 'translate(' + d.x + ',' + d.y + ')'
        //     })
        // },
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
        const d3 = this.$d3
        this.restaurants = this.loadAll();
        //1.创建svg画布
        let marge = { top: 160, bottom: 60, left: 160, right: 60 }
        let width = `${document.documentElement.clientWidth}`
        // let height = 600
        let height = `${document.documentElement.clientHeight}`/1.5
       
        function ticked() {
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
            
            links.attr('d',linkArc)
 
            linksText
                .attr('x', function(d) {
                    return (d.source.x + d.target.x) / 2
                })
                .attr('y', function(d) {
                    return (d.source.y + d.target.y) / 2
                })
 
            node.attr('transform', d => {
                return 'translate(' + d.x + ',' + d.y + ')'
            })
        }
        
        const svg = d3
            .select('#flowChart')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
        // let g = svg
        //     .append('g')
        //     .attr(
        //         'transform',
        //         'translate(' + marge.top + ',' + marge.left + ')'
        //     )

          function zoomed(){
            g.attr( "transform",d3.event.transform );
            }
            // 缩放和平移
            svg.call(d3.zoom()
            .scaleExtent([0.1,10])
            .on('zoom',zoomed)
            );

          svg.append("svg:defs")
            .append("svg:marker")
            .attr("id", "marker")
            .attr("markerUnits","userSpaceOnUse")
            .attr('viewBox', '0 -5 10 10')
            .attr("refX", 20)
            .attr("refY",0)
            .attr('markerWidth', 12)
            .attr('markerHeight', 12)
            .attr('orient', 'auto')
            .attr("stroke-width",4)//箭头宽度
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr("fill","#000000");
 
        //2.设置一个color的颜色比例尺，为了让不同的扇形呈现不同的颜色
        var colorScale = d3
            .scaleOrdinal()
            .domain(d3.range(nodes.length))
            .range(d3.schemeCategory10)
 
        //3.新建一个力导向图
        // https://bl.ocks.org/mbostock/533daf20348023dfdd76
        // https://bl.ocks.org/almsuarez/baa897c189ed64ba2bb32cde2876533b
        forceSimulation = d3
            .forceSimulation(nodes)
            // .force('link', d3.forceLink().id(function(d) { return d.name; }).distance(40))
            .force('link', d3.forceLink(edges).distance(200))
            .force('charge', d3.forceManyBody().strength(-1000))
            .force('center', d3.forceCenter(width/2,height/2))
            .force('x',d3.forceX())
            .force('y',d3.forceY())
            .alphaTarget(1)
            .on('tick',ticked)
 
        //4. 初始化力导向图
        //生成节点数据
        // forceSimulation.nodes(nodes).on('tick', this.ticked)
        //生成边数据
        // forceSimulation
        //     .force('link')
        //     .links(edges)
        //     .distance(function(d) {
        //         //每一边的长度
        //         return d.value * 100
        //     })
        //设置图形的中心位置
        // forceSimulation
        //     .force('center')
        //     .x(width / 4)
        //     .y(height / 4)
 
        //Fade rules for hovering over nodes
        function fade(opacity) {
          return d => {
            node.style('stroke-opacity', function (o) {
              const thisOpacity = isConnected(d, o) ? 1 : opacity;
              this.setAttribute('fill-opacity', thisOpacity);
              return thisOpacity;
            });

            links.style('stroke-opacity', o => (o.source === d || o.target === d ? 1 : opacity));

          };
        }

        //Specific Fade Rules for Link Hover Instances
        function linkFade(opacity) {
          return d => {
            node.style('stroke-opacity', function(o){
              const thisOpacity = isConnected(d.source, o) && isConnected(d.target, o)? 1 : opacity;
              this.setAttribute('fill-opacity', thisOpacity);
              return thisOpacity;
            });
            
            links.style('stroke-opacity', o => (o.source === d.source && o.target === d.target ? 1 : opacity));
          }
        }
        
        var R = 30;

        var g = svg.append('g')
        // var links = g.append('g').selectAll('.link')
        var node = g.append('g').selectAll('.node')

        var tooltip = d3.select("body")
          .append("div")
          .attr("class", "tooltip")
          .style("opacity", 0);
  
        // restart()
        links = g
            .append('g')
            .selectAll('.link')
            .data(edges)
            .enter()
            .append('line')
            .attr('class','link')
            .style('stroke', function(d, i) {
                return colorScale(i)
            })
            .style('pointer-events','none')
            .style('stroke-width', 0.5)
            .attr("marker-end", "url(#marker)" );

        links.attr('class','link')
          .on('mouseover.fade',linkFade(0.1))
          .on('mouseover.tooltip',function(d){
              tooltip.transition()
                .duration(300)
                .style("opacity", .8);
              tooltip.html("Source:"+ d.source.id + 
                          "<p/>Target:" + d.target.id +
                          "<p/>T:"  + d.T)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY + 10) + "px");
          })
          .on("mouseout.tooltip", function() {
            tooltip.transition()
              .duration(100)
              .style("opacity", 0);
          })
          .on('mouseout.fade', linkFade(1))
          .on("mousemove", function() {
            tooltip.style("left", (d3.event.pageX) + "px")
              .style("top", (d3.event.pageY + 10) + "px");
          });


        //5. 绘制边(有了节点和边的数据后)
        // links = g
        //     .append('g')
        //     .selectAll('line')
        //     .data(edges)
        //     .enter()
        //     .append('line')
        //     .attr('stroke', function(d, i) {
        //         return colorScale(i)
        //     })
        //     .attr('stroke-width', 1)
        linksText = g
            .append('g')
            .selectAll('text')
            .data(edges)
            .enter()
            .append('text')
            .text(function(d) {
                return d.relation
            })
        
        linksText.append('textPath')
            .attr('xlink:href',function(d,i){ return '#edgepath'})
            .style('pointer-events','none')
            .text(function(d){return d.relation})

        function dragStart(d) {
            if (!d3.event.active) {
                //设置衰减系数，对节点位置移动过程的模拟，数值越高移动越快，数值范围[0，1]
                forceSimulation.alphaTarget(0.3).restart()
            }
            d.fx = d.x
            d.fy = d.y
        }
        function drag(d) {
            d.fx = d3.event.x
            d.fy = d3.event.y
        }
        function dragEnd(d) {
            if (!d3.event.active) {
                forceSimulation.alphaTarget(0)
            }
            d.fx = null
            d.fy = null
        }

        node = g.selectAll('.node').data(nodes)
          .enter().append('g')
          .attr('class', 'node')
          .call(d3.drag()
            .on('start',dragStart)
            .on('drag',drag)
            .on('end',dragEnd)
          )
      
        node.append("text")
          .attr("dy", '.35em')
          .attr("x", function(d){
              // console.log(d.name+"---"+ d.name.length);
              var re_en = /[a-zA-Z]+/g;
              //如果是全英文，不换行
              if(d.name.match(re_en)){
                  d3.select(this).append('tspan')
                  .attr('x',0)
                  .attr('y',2)
                  .text(function(){return d.name;});
              }
              //如果小于四个字符，不换行
              else if(d.name.length<=4){
                  d3.select(this).append('tspan')
                  .attr('x',0)
                  .attr('y',2)
                  .text(function(){return d.name;});
              }else{
                  var top=d.name.substring(0,4);
                  var bot=d.name.substring(4,d.name.length);

                  d3.select(this).text(function(){return '';});

                  d3.select(this).append('tspan')
                      .attr('x',0)
                      .attr('y',-7)
                      .text(function(){return top;});

                  d3.select(this).append('tspan')
                      .attr('x',0)
                      .attr('y',10)
                      .text(function(){return bot;});
              }
              //直接显示文字    
              /*.text(function(d) { 
              return d.name; */
          })
          .style("text-anchor", "middle")
          .text(d => {
            if (d.name && d.name.length > 10) {
              if (d.parent === "") {
                return d.name.substring(0, 10) + "...";
              } else {
                return d.name.substring(0, 15) + "...";
              }
            } else {
              return d.name;
            }
        });

        node.exit().transition()
          .attr("r",0)
          .remove();

        node.append('title').text(function(d){ return d.name})

        function releasenode(d) {
            d.fx = null;
            d.fy = null;
        }

        function resetData(){
          currNodes = nodes
          currLinks = edges
          //currLinks = graph.links
          //currLinks.push(temp)
          restart()
        }

        const linkedByIndex = {};
        edges.forEach(d => {
          linkedByIndex[`${d.source.index},${d.target.index}`] = 1;
        });

        function isConnected(a, b) {
          return linkedByIndex[`${a.index},${b.index}`] || linkedByIndex[`${b.index},${a.index}`] || a.index === b.index;
        }

        function linkArc(d) {
            var dx = (d.target.x - d.source.x),
                dy = (d.target.y - d.source.y),
                dr = Math.sqrt(dx * dx + dy * dy),
                unevenCorrection = (d.sameUneven ? 0 : 0.5);
                // curvature term defines how tight the arcs are (lower number = tigher curve)
            var curvature = 2,
                arc = (1.0/curvature)*((dr * d.maxSameHalf) / (d.sameIndexCorrected - unevenCorrection));
                
            //console.log(d.maxSameHalf)
            //d.maxSameHalf always showing zero...
            if (d.sameMiddleLink) {
              arc = 0;
            }

            return "M" + d.source.x + "," + d.source.y + "A" + arc + "," + arc + " 0 0," + d.sameArcDirection + " " + d.target.x + "," + d.target.y;
          }

        node.append('circle')
          .attr('r',R)
          .attr('fill',function(d,i){
            return colorScale(i)
            // return '#F9EBF9'
          })
          .attr('fill-opacity',0.3)
          .on('mouseover.tooltip', function(d) {
              tooltip.transition()
                .duration(300)
                .style("opacity", 0.1);
              tooltip.html("Project:" + d.id + "<p/>T:" + d.T + "<p/>Q:" + d.Q)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY + 10) + "px");
            })
          .on('mouseover.fade', fade(0.1))
          .on("mouseout.tooltip", function() {
              tooltip.transition()
                .duration(100)
                .style("opacity", 0);
            })
          .on('mouseout.fade', fade(1))
            .on("mousemove", function() {
              tooltip.style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY + 10) + "px");
            })
          .on('dblclick',releasenode)
          .on('click',function(node){
            //单击时让连接线加粗
            links.style("stroke-width",function(line){
                console.log(line);
                if(line.source.name==node.name || line.target.name==node.name){
                    return 4;
                }else{
                    return 0.5;
                }
            })
          })
          .call(function(node) { node.transition().attr("r", R);})
          .merge(node);
        //6. 绘制节点, 先为节点和节点上的文字分组
        // gs = g
        //     .selectAll('.circleText')
        //     .data(nodes)
        //     .enter()
        //     .append('g')
        //     .attr('transform', function(d, i) {
        //         var cirX = d.x
        //         var cirY = d.y
        //         return 'translate(' + cirX + ',' + cirY + ')'
        //     })
        //     .call(
        //         d3
        //             .drag()
        //             .on('start', this.dragStart)
        //             .on('drag', this.drag)
        //             .on('end', this.dragEnd)
        //     )
 
        // //绘制节点
        // gs.append('circle')
        //     .attr('r', 10)
        //     .attr('fill', function(d, i) {
        //         return colorScale(i)
        //     })
        // //文字
        // gs.append('text')
        //     .attr('x', -10)
        //     .attr('y', -20)
        //     .attr('dy', 10)
        //     .text(function(d) {
        //         return d.name
        //     })
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

.node circle {
	  pointer-events: all;
	  stroke: #777;
	  stroke-width: 1px;
	}

.link.marker {
  stroke-dasharray: 0,2 1;
}
</style>
