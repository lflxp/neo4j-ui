<template lang='pug'>
    <div id="id">
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
        <el-row>
            <el-col :span="svg_span">
                <svg></svg>
            </el-col>
            <el-col :span="str_span">
                <el-table
                    :data="str"
                    style="width: 100%">
                    <el-table-column
                        prop="group"
                        label="名称">
                    </el-table-column>
                    <el-table-column
                        prop="value"
                        label="值"
                        width="180">
                    </el-table-column>
                    </el-table-column>
                </el-table>
            </el-col>
            <el-col :span="ints_span">
                <el-table
                    :data="ints"
                    style="width: 100%">
                    <el-table-column
                        prop="group"
                        label="名称">
                    </el-table-column>
                    <el-table-column
                        prop="value"
                        label="值"
                        width="180">
                    </el-table-column>
                </el-table>
            </el-col>
        </el-row>
    </div>
</template>
<script>
/**
 * 力导向图
<el-input placeholder="example: MATCH (a)-[r:DIRECTED]->(b) RETURN a,b,r" v-model="cql" clearable>
                    <template slot="prepend">$</template>
                    <template slot="append">
                        <el-button type="primary" icon="el-icon-caret-right" @click="search"></el-button>
                    </template>
                </el-input>
 */
import * as d3 from 'd3'
import Http from '@/utils/service'

let gs = '',
    forceSimulation = '',
    links = '',
    linksText = ''
// let nodes =  [
// 			{"group":"a","id":50,"labels":["Person"],"props":{"born":1956,"name":"Tom Hanks"},"type":"node"},
// 			{"group":"b","id":163,"labels":["Movie"],"props":{"released":1995,"tagline":"Houston, we have a problem.","title":"Apollo 13"},"type":"node"},
// 			{"group":"m","id":134,"labels":["Person"],"props":{"born":1954,"name":"Ron Howard"},"type":"node"},
// 			{"group":"a","id":50,"labels":["Person"],"props":{"born":1956,"name":"Tom Hanks"},"type":"node"},
// 			{"group":"b","id":181,"labels":["Movie"],"props":{"released":1992,"tagline":"Once in a lifetime you get a chance to do something different.","title":"A League of Their Own"},"type":"node"},
// 			{"group":"m","id":185,"labels":["Person"],"props":{"born":1943,"name":"Penny Marshall"},"type":"node"},
// 			{"group":"a","id":50,"labels":["Person"],"props":{"born":1956,"name":"Tom Hanks"},"type":"node"},
// 			{"group":"b","id":57,"labels":["Movie"],"props":{"released":1990,"tagline":"A story of love, lava and burning desire.","title":"Joe Versus the Volcano"},"type":"node"}]
 
// let edges = [
// 			{"name":"r","props":{"roles":["Jim Lovell"]},"relation":"ACTED_IN","source":7,"target":1,"value":1},
// 			{"name":"x","props":{},"relation":"DIRECTED","source":6,"target":1,"value":1},
// 			{"name":"r","props":{"roles":["Jimmy Dugan"]},"relation":"ACTED_IN","source":7,"target":4,"value":1},
// 			{"name":"x","props":{},"relation":"DIRECTED","source":5,"target":4,"value":1},
// 			{"name":"r","props":{"roles":["Joe Banks"]},"relation":"ACTED_IN","source":7,"target":2,"value":1},
// 			{"name":"x","props":{},"relation":"DIRECTED","source":4,"target":7,"value":3},
// 			{"name":"r","props":{"roles":["Mr. White"]},"relation":"ACTED_IN","source":7,"target":4,"value":1},
//       {"name":"x","props":{},"relation":"DIRECTED","source":3,"target":6,"value":1}]
let nodes = []
let edges = []
export default {
  name: 'Search',
  data() {
    return {
      id: '',
      cql: '',
      svg_span: 24,
      str_span: 0,
      ints_span: 0,
      str: [],
      ints: []
    }
  },
  methods: {
    handleSelect(item) {
        console.log(item);
    },
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
    remove() {
        this.svg_span = 24
        this.str_span = 0
        this.ints_span = 0
        d3.select(this.$el).select('svg').selectAll('*').remove()
    },
    search() {
        if (this.cql == '') {
            this.$message.error('请输入neo4j查询语句')
            return
        }
        
        var arg = { "cql" : this.cql }
        nodes = []
        edges = []
        this.remove()
        Http.getCql(arg).then(data => {
            console.log(data)
            if (data.data.nodes == undefined) {
                this.$message.error(data.data)
                return
            }
            nodes = data.data.nodes

            edges = data.data.links

            if (data.data.str.length != 0) {
                this.svg_span = this.svg_span - 6
                this.str_span = 6
                this.str = data.data.str
            }
            if (data.data.ints.length != 0) {
                this.svg_span = this.svg_span -6 
                this.ints_span = 6
                this.ints = data.data.ints
            }

            //1.创建svg画布
            let marge = { top: 160, bottom: 60, left: 160, right: 60 }
            // let width = document.getElementById(this.id).clientWidth
            // let height = document.getElementById(this.id).clientHeight
            let width = `${document.documentElement.clientWidth}`
            // let height = 600
            let height = `${document.documentElement.clientHeight}`-55
            const svg = d3
            .select(this.$el)
            .select('svg')
            .attr('width', width)
            .attr('height', height)
            let g = svg
            .append('g')
            .attr(
                'transform',
                'translate(' + marge.top + ',' + marge.left + ')'
            )

            function zoomed(){
            g.attr( "transform",d3.event.transform );
            }
            // 缩放和平移
            svg.call(d3.zoom()
            .scaleExtent([0.1,10])
            .on('zoom',zoomed)
            );
            //define arrow
            svg.append("svg:defs")
            .append("svg:marker")
            .attr("id", "marker")
            .attr('viewBox', '0 -5 10 10')
            .attr("refX", 20)
            .attr("refY",0)
            .attr('markerWidth', 10)
            .attr('markerHeight', 10)
            .attr('orient', 'auto')
            .append('svg:path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr("fill","brown");
        
            //2.设置一个color的颜色比例尺，为了让不同的扇形呈现不同的颜色
            var colorScale = d3
            .scaleOrdinal()
            .domain(d3.range(nodes.length))
            .range(d3.schemeCategory10)

            //3.新建一个力导向图
            forceSimulation = d3
            .forceSimulation()
            .force('link', d3.forceLink())
            .force('charge', d3.forceManyBody().strength(-300)) // 设置作用力
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
                return d.value * 150
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
            .attr("class","link")
            .attr("stroke",function(d,i){
                return colorScale(i);
            })
            .attr("stroke-width",2)
            .attr("marker-end","url(#marker)");
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
            .attr('class','node')
            .call(
                d3
                    .drag()
                    .on('start', this.dragStart)
                    .on('drag', this.drag)
                    .on('end', this.dragEnd)
            )
            .on("mouseover",function(d){
                d3.select(this).select("circle").style("stroke-width", 6); 
                d3.select(this).select("circle").style("stroke", "orange"); 
                d3.select(this).select("text").style("font", "20px sans-serif");
                d3.selectAll("rect." + d.location).style("stroke-width", 6);
                d3.selectAll("rect." + d.location).style("stroke", "orange");
                d3.selectAll("text." + d.location).style("font", "20px sans-serif");
                d3.selectAll("tr." + d.name).style("background-color", "orange");
            })
            .on("mouseout",  function(d) { 
            // if(isConnected(d, o)) {
                d3.select(this).select("circle").style("stroke-width", 1.5); 
                d3.select(this).select("circle").style("stroke", "gray"); 
                d3.select(this).select("text").style("font", "12px sans-serif");
                d3.selectAll("rect." + d.location).style("stroke-width", 1.5);
                d3.selectAll("rect." + d.location).style("stroke", "gray");
                d3.selectAll("text." + d.location).style("font", "12px sans-serif");
                d3.selectAll("tr." + d.name).style("background-color", "white");
                //}
            });

            //绘制节点
            gs.append('circle')
                .attr('r', 30)
                .attr('fill', function(d, i) {
                    return colorScale(i)
                })
                .attr('fill-opacity',0.5)
            //文字
            gs.append('text')
                .attr('x', -10)
                .attr('y', -20)
                .attr('dy', 10)
                .text(function(d) {
                    if (d.props.name != undefined) {
                    return d.props.name;
                    } else {
                    return d.props.title;
                    }
                })
            gs.append('title').text(function(d){ return d.name});

            g.selectAll(".circleText")
            .data(nodes).exit().remove();
        })
        .catch(error=>{
            console.error(error)
        })
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
          { "value": "纵食", "address": "元丰天山花园(东门) 双流路267号" },
          { "value": "钱记", "address": "上海市长宁区天山西路" },
          { "value": "壹杯加", "address": "上海市长宁区通协路" },
          { "value": "唦哇嘀咖", "address": "上海市长宁区新泾镇金钟路999号2幢（B幢）第01层第1-02A单元" },
          { "value": "爱茜茜里(西郊百联)", "address": "长宁区仙霞西路88号1305室" },
          { "value": "爱茜茜里(近铁广场)", "address": "上海市普陀区真北路818号近铁城市广场北区地下二楼N-B2-O2-C商铺" },
          { "value": "鲜果榨汁（金沙江路和美广店）", "address": "普陀区金沙江路2239号金沙和美广场B1-10-6" },
          { "value": "开心丽果（缤谷店）", "address": "上海市长宁区威宁路天山路341号" },
          { "value": "超级鸡车（丰庄路店）", "address": "上海市嘉定区丰庄路240号" },
          { "value": "妙生活果园（北新泾店）", "address": "长宁区新渔路144号" },
          { "value": "香宜度麻辣香锅", "address": "长宁区淞虹路148号" },
          { "value": "凡仔汉堡（老真北路店）", "address": "上海市普陀区老真北路160号" },
          { "value": "港式小铺", "address": "上海市长宁区金钟路968号15楼15-105室" },
          { "value": "蜀香源麻辣香锅（剑河路店）", "address": "剑河路443-1" },
          { "value": "北京饺子馆", "address": "长宁区北新泾街道天山西路490-1号" },
          { "value": "饭典*新简餐（凌空SOHO店）", "address": "上海市长宁区金钟路968号9号楼地下一层9-83室" },
          { "value": "焦耳·川式快餐（金钟路店）", "address": "上海市金钟路633号地下一层甲部" },
          { "value": "动力鸡车", "address": "长宁区仙霞西路299弄3号101B" },
          { "value": "浏阳蒸菜", "address": "天山西路430号" },
          { "value": "四海游龙（天山西路店）", "address": "上海市长宁区天山西路" },
          { "value": "樱花食堂（凌空店）", "address": "上海市长宁区金钟路968号15楼15-105室" },
          { "value": "壹分米客家传统调制米粉(天山店)", "address": "天山西路428号" },
          { "value": "福荣祥烧腊（平溪路店）", "address": "上海市长宁区协和路福泉路255弄57-73号" },
          { "value": "速记黄焖鸡米饭", "address": "上海市长宁区北新泾街道金钟路180号1层01号摊位" },
          { "value": "红辣椒麻辣烫", "address": "上海市长宁区天山西路492号" },
          { "value": "(小杨生煎)西郊百联餐厅", "address": "长宁区仙霞西路88号百联2楼" },
          { "value": "阳阳麻辣烫", "address": "天山西路389号" },
          { "value": "南拳妈妈龙虾盖浇饭", "address": "普陀区金沙江路1699号鑫乐惠美食广场A13" }
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
    },
    created() {
      this.id = this.uuid()
    },
    mounted() {
        this.restaurants = this.loadAll();
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

.el-autocomplete{
  width: 100%;
}
</style>
