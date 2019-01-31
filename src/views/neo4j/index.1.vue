<template lang='pug'>
    <div id="id">
      <svg></svg>
    </div>
</template>
<script>
/**
 * 力导向图
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
  name: 'Scale',
  data() {
    return {
      id: ''
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
      }
    },
    created() {
      this.id = this.uuid()
    },
    mounted() {
      var arg = { "cql" : "match (a:Person{name:'Tom Hanks'})-[r:ACTED_IN]->(b) return a,b,r" }
      Http.getCql(arg).then(data => {
        console.log(data)
        nodes = data.data.nodes

        edges = data.data.links

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
