<template>
  <!-- <svg id="myid" width="800" height="600"></svg> -->
  <!-- <div id="myid">
    <svg></svg>
  </div> -->
  <div id="app">
    <svg></svg>
  </div>
</template>

<script>
import * as d3 from 'd3'
import Http from '@/utils/service'

export default {

  data() {
    return {
      edges: [],
      nodes: [],
      str: [],
      g: {},
      links: {},
      linksText:{}
    }
  },
  mounted() {
    var arg = { "cql" : "match (a:Person{name:'Tom Hanks'})-[r:ACTED_IN]->(b) return a,b,r" }
    Http.getCql(arg).then(data => {
      console.log(data)
      data.data.links.forEach(tmp=>{
        console.log(tmp)
        // tmp.source = tmp.source
        // tmp.target = tmp.target
        // edges.push(tmp)
      })
      // edges = data.data.links
      this.str = data.data.str
      this.nodes = data.data.nodes
      this.edges = data.data.links
      // console.log(this.edges)
      this.start()
    })
  },
  methods: {
    start() {
      var width = 1280
      var height = 1080 
      var marge = {top:60,bottom:60,left:60,right:60}
      let svg = d3.select("#app").append("svg")
      var width = svg.attr("width",width)
      var height = svg.attr("height",height)
      var g = svg.append("g")
        .attr("transform","translate("+marge.top+","+marge.left+")")
        
      //准备数据

      
      this.edges = [{"name":"r","props":{"roles":["Jim Lovell"]},"relation":"ACTED_IN","source":22,"target":1,"value":1},{"name":"r","props":{"roles":["Jimmy Dugan"]},"relation":"ACTED_IN","source":22,"target":3,"value":1},{"name":"r","props":{"roles":["Joe Banks"]},"relation":"ACTED_IN","source":22,"target":5,"value":1},{"name":"r","props":{"roles":["Mr. White"]},"relation":"ACTED_IN","source":22,"target":7,"value":1},{"name":"r","props":{"roles":["Dr. Robert Langdon"]},"relation":"ACTED_IN","source":22,"target":9,"value":1},{"name":"r","props":{"roles":["Zachry","Dr. Henry Goose","Isaac Sachs","Dermot Hoggins"]},"relation":"ACTED_IN","source":22,"target":11,"value":1},{"name":"r","props":{"roles":["Chuck Noland"]},"relation":"ACTED_IN","source":22,"target":13,"value":1},{"name":"r","props":{"roles":["Paul Edgecomb"]},"relation":"ACTED_IN","source":22,"target":15,"value":1},{"name":"r","props":{"roles":["Sam Baldwin"]},"relation":"ACTED_IN","source":22,"target":17,"value":1},{"name":"r","props":{"roles":["Hero Boy","Father","Conductor","Hobo","Scrooge","Santa Claus"]},"relation":"ACTED_IN","source":22,"target":19,"value":1},{"name":"r","props":{"roles":["Rep. Charlie Wilson"]},"relation":"ACTED_IN","source":22,"target":21,"value":1},{"name":"r","props":{"roles":["Joe Fox"]},"relation":"ACTED_IN","source":22,"target":23,"value":1},{"name":"r","props":{"roles":["Joe Fox"]},"relation":"ACTED_IN","source":47,"target":25,"value":1},{"name":"r","props":{"roles":["Hero Boy","Father","Conductor","Hobo","Scrooge","Santa Claus"]},"relation":"ACTED_IN","source":47,"target":26,"value":1},{"name":"r","props":{"roles":["Jimmy Dugan"]},"relation":"ACTED_IN","source":47,"target":29,"value":1},{"name":"r","props":{"roles":["Dr. Robert Langdon"]},"relation":"ACTED_IN","source":47,"target":31,"value":1},{"name":"r","props":{"roles":["Jim Lovell"]},"relation":"ACTED_IN","source":47,"target":32,"value":1},{"name":"r","props":{"roles":["Joe Banks"]},"relation":"ACTED_IN","source":47,"target":34,"value":1},{"name":"r","props":{"roles":["Paul Edgecomb"]},"relation":"ACTED_IN","source":47,"target":37,"value":1},{"name":"r","props":{"roles":["Rep. Charlie Wilson"]},"relation":"ACTED_IN","source":47,"target":39,"value":1},{"name":"r","props":{"roles":["Zachry","Dr. Henry Goose","Isaac Sachs","Dermot Hoggins"]},"relation":"ACTED_IN","source":47,"target":41,"value":1},{"name":"r","props":{"roles":["Chuck Noland"]},"relation":"ACTED_IN","source":47,"target":43,"value":1},{"name":"r","props":{"roles":["Mr. White"]},"relation":"ACTED_IN","source":47,"target":45,"value":1},{"name":"r","props":{"roles":["Sam Baldwin"]},"relation":"ACTED_IN","source":47,"target":46,"value":1}];
      //设置一个color的颜色比例尺，为了让不同的扇形呈现不同的颜色
    // http://bl.ocks.org/couchand/6420534
    // function name(d) { return d.name; }
    // function group(d) { return d.relation; }
      var colorScale = d3.scaleOrdinal()
        .domain(d3.range(this.nodes.length))
        .range(d3.schemeCategory10);

      
        //var color = d3.scale.schemeCategory10();
      function colorByGroup(d) { return colorScale(d); }

        //新建一个力导向图
        var forceSimulation = d3.forceSimulation()
          .force("link",d3.forceLink())
          .force("charge",d3.forceManyBody().strength(-300)) // 设置作用力
          .force("center",d3.forceCenter(width / 2, height / 2));
          
        //初始化力导向图，也就是传入数据
        //生成节点数据
        forceSimulation.nodes(this.nodes)
          .on("tick",this.ticked);//这个函数很重要，后面给出具体实现和说明
        //生成边数据
        forceSimulation.force("link")
          .links(this.edges)
          .distance(function(d){//每一边的长度
            return d.value*200;
          })    	
        //设置图形的中心位置	
        forceSimulation.force("center")
          .x(width/2)
          .y(height/2);
        //在浏览器的控制台输出
        console.log(this.nodes);
        console.log(this.edges);
        // edges.forEach(data=>{
        //   console.log('source',data.source.index,'target',data.target.index)
        // })
        
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

        //有了节点和边的数据后，我们开始绘制
        //绘制边
        var links = g.append("g")
          .selectAll("line")
          .data(this.edges)
          .enter()
          .append("line")
        .attr("class","link")
          .attr("stroke",function(d,i){
            return colorScale(i);
          })
          .attr("stroke-width",2)
        .attr("marker-end","url(#marker)");
        // .call(d3.zoom()
        // 	.scaleExtent([-5,2])
        // 	.on("zoom",zoomed)
        // );
        var linksText = g.append("g")
          .selectAll("text")
          .data(this.edges)
          .enter()
          .append("text")
          .text(function(d){
            return d.relation;
          })
        

        //绘制节点
        //老规矩，先为节点和节点上的文字分组
        var node = g.selectAll(".circleText")
          .data(this.nodes)
          .enter()
          .append("g")
          .attr("transform",function(d,i){
            var cirX = d.x;
            var cirY = d.y;
            return "translate("+cirX+","+cirY+")";
          })
        .attr('class','node')
          .call(d3.drag()
            .on("start",started)
            .on("drag",dragged)
            .on("end",ended)
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
        node.append("circle")
          .attr("r",30)
        .attr("fill",function(d, i) {
                  return colorScale(i)
              })
        .attr('fill-opacity',0.5)
          //.attr("fill",function(d,i){
          //	return colorScale(i);
          //})

      node.append('circle')
        .attr('r', 4)
        .attr('stroke', 'black');
        //文字
        node.append("text")
          .attr("x",-10)
          .attr("y",-20)
          .attr("dy",10)
        .attr("dx",0)
          .text(function(d){
          if (d.props.name != undefined) {
              return d.props.name;
          } else {
            return d.props.title;
          }
          })

      node.append('title').text(function(d){ return d.name});

      g.selectAll(".circleText")
          .data(this.nodes).exit().remove();
          
      function ticked(){
        links
          .attr("x1",function(d){return d.source.x;})
          .attr("y1",function(d){return d.source.y;})
          .attr("x2",function(d){return d.target.x;})
          .attr("y2",function(d){return d.target.y;});
          
        linksText
          .attr("x",function(d){
          return (d.source.x+d.target.x)/2;
        })
        .attr("y",function(d){
          return (d.source.y+d.target.y)/2;
        });
          
        
        // .attr("cx", function(d) { return d.x*2; })
        // .attr("cy", function(d) { return d.y*2; })
      node.attr("transform",function(d) { return "translate(" + d.x + "," + d.y + ")"; });
        // .attr('clip-path', function(d) { return 'url(#clip-'+d.index+')'; });
      }
      function started(d){
        if(!d3.event.active){
          forceSimulation.alphaTarget(0.5).restart();
        }
        d.fx = d.x;
        d.fy = d.y;
      }
      function dragged(d){
        d.fx = d3.event.x;
        d.fy = d3.event.y;
      }
      function ended(d){
        if(!d3.event.active){
          forceSimulation.alphaTarget(0);
        }
        d.fx = null;
        d.fy = null;
      }
    }
    // zoomed(){
		// 	g.attr( "transform",d3.event.transform );
    // },
    // ticked(){
    //   this.links
    //     .attr("x1",function(d){return d.source.x;})
    //     .attr("y1",function(d){return d.source.y;})
    //     .attr("x2",function(d){return d.target.x;})
    //     .attr("y2",function(d){return d.target.y;});
        
    //   this.linksText
    //     .attr("x",function(d){
    //     return (d.source.x+d.target.x)/2;
    //   })
    //   .attr("y",function(d){
    //     return (d.source.y+d.target.y)/2;
    //   });
        
      
    //   // .attr("cx", function(d) { return d.x*2; })
    //   // .attr("cy", function(d) { return d.y*2; })
    //   node.attr("transform",function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    //   // .attr('clip-path', function(d) { return 'url(#clip-'+d.index+')'; });
    // },
    // started(d){
    //   if(!d3.event.active){
    //     forceSimulation.alphaTarget(0.5).restart();
    //   }
    //   d.fx = d.x;
    //   d.fy = d.y;
    // },
    // dragged(d){
    //   d.fx = d3.event.x;
    //   d.fy = d3.event.y;
    // },
    // ended(d){
    //   if(!d3.event.active){
    //     forceSimulation.alphaTarget(0);
    //   }
    //   d.fx = null;
    //   d.fy = null;
    // }
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