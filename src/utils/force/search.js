import * as d3 from 'd3'
import config from '../tool/config'

export default class Force {
    defaultSetting() {
        return {
            width: 800,
            height: 600,
            padding: {
                top: 60,
                bottom: 60,
                left: 60,
                right: 60
            }
        }
    }
    constructor (selector, option) {
        const defaultSetting = this.defaultSetting()
        this.config = Object.assign(defaultSetting, option)
        const {
            width,
            height,
        } = this.config
        //创建svg
        this.svg = d3.select(selector).append('svg')
            .attr('width',width)
            .attr('height',height)
        this.g = this.svg.append('g')
            .attr('transform','translate('+60+','+60+')')
    }
    drawForce(data) {
        this.nodes = []
        this.edges = []
        this.str = []
        //准备数据
        this.nodes = data.data.nodes
        this.edges = data.data.links
        this.str = data.data.str
        //设置一个color的颜色比例尺，为了让不同的扇形呈现不同的颜色
        this.colorScale = d3.scaleOrdinal()
            .domain(d3.range(this.nodes.length))
            .range(d3.schemeCategory10)
        this.forceDraw()
    }
    forceDraw() {
        const {
            width,
            height
        } = this.config
        //新建一个力导向图
        this.forceSimulation = d3.forceSimulation()
          .force("link",d3.forceLink())
          .force("charge",d3.forceManyBody().strength(-300)) // 设置作用力
          .force("center",d3.forceCenter(width / 2, height / 2));
          
        //初始化力导向图，也就是传入数据
        //生成节点数据
        this.forceSimulation.nodes(this.nodes)
          .on("tick",this.ticked);//这个函数很重要，后面给出具体实现和说明
        //生成边数据
        this.forceSimulation.force("link")
          .links(this.edges)
          .distance(function(d){//每一边的长度
            return d.value*200;
          })    	
        console.log(width,height)
        //设置图形的中心位置	
        this.forceSimulation.force("center")
          .x(width/2)
          .y(height/2);
        //在浏览器的控制台输出
        // console.log(this.nodes);
        // console.log(this.links);
        // edges.forEach(data=>{
        //   console.log('source',data.source.index,'target',data.target.index)
        // })

        this.svg.call(d3.zoom()
            .scaleExtent([0.1,10])
            .on('zoom', this.zoomed));

        //define arrow
        this.svg.append("svg:defs")
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
        this.links = this.g.append("g")
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
        this.linksText = this.g.append("g")
            .selectAll("text")
            .data(this.edges)
            .enter()
            .append("text")
            .text(function(d){
                return d.relation;
            })
        

        //绘制节点
        //老规矩，先为节点和节点上的文字分组
        this.node = this.g.selectAll(".circleText")
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
                .on("start",this.started)
                .on("drag",this.dragged)
                .on("end",this.ended)
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
            this.circleDraw()
    }
    circleDraw() {
        //绘制节点
        this.node.append("circle")
            .attr("r",30)
            .attr("fill",function(d, i) {
                  return this.colorScale(i)
              })
            .attr('fill-opacity',0.5)
          //.attr("fill",function(d,i){
          //	return colorScale(i);
          //})

        this.node.append('circle')
            .attr('r', 4)
            .attr('stroke', 'black');
        //文字
        this.node.append("text")
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

        this.node.append('title').text(function(d){ return d.name});

        this.g.selectAll(".circleText")
            .data(this.nodes).exit().remove();
    }
    ticked() {
        links
            .attr("x1",function(d){return d.source.x;})
            .attr("y1",function(d){return d.source.y;})
            .attr("x2",function(d){return d.target.x;})
            .attr("y2",function(d){return d.target.y;});
          
        linksText.attr("x",function(d){
          return (d.source.x+d.target.x)/2;
        })
        .attr("y",function(d){
          return (d.source.y+d.target.y)/2;
        });
          
        
        // .attr("cx", function(d) { return d.x*2; })
        // .attr("cy", function(d) { return d.y*2; })
        node.attr("transform",function(d) { return "translate(" + d.x + "," + d.y + ")"; });
      
    }
    started(d){
        if(!d3.event.active){
          this.forceSimulation.alphaTarget(0.5).restart();
        }
        d.fx = d.x;
        d.fy = d.y;
    }
    dragged(d){
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }
    ended(d){
        if(!d3.event.active){
          this.forceSimulation.alphaTarget(0);
        }
        d.fx = null;
        d.fy = null;
    }
    colorByGroup(d) {
        return this.colorScale(d)
    }
    zoomed() {
        this.g.attr('transform', d3.event.transform)
    }
}