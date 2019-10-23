import { Component, } from '@angular/core';
import * as go from 'gojs'
import { group } from '@angular/animations';
//import { readFile } from 'fs';
import { Observable} from 'rxjs'
import { HttpClient } from '@angular/common/http';
//import* as d from '../assets/scheme';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'gojsDemo';
  filePath ='../assets/scheme.json';
  mainGroup: "";
  dataList:any;
  nodes: any[];//[{key: '', text:'', group: ''}];
  edges: any[]
  model: go.GraphLinksModel
  constructor (private http: HttpClient) {
   this.getData().subscribe(d=>{

      this.formatModal(d);
     // console.log(d);
   },

   error=> console.log(error));
  }
  //   model = new go.GraphLinksModel( [{key:1, text: 'ssd', color:'red'}, {key:2, text: 's32', color:'blue'},{key:3, text: 'e32', color:'green'},
//   // [{key:100, text: 'ssd-subGroup', color:'red'}, {key:200, text: 's32-subGroup', color:'blue'}, {key:300, text: 'e32-subGroup', color:'green'}],
//   {key:100, isGroup: true, description:"group with two subprocesses sdsdsd dfdfd  dsfsfdfdf sfdfdf"}, //isSubGraphExpanded
//    {key:111, text: 'ssddfd', color:'red', group:100}, {key:121, text: 'dfgs4532', color:'blue', group:100},{key:13, text: 'e45fg32', color:'green'},
//   // {key:21, text: 'ssd', color:'red'}, {key:22, text: 's32', color:'blue'},{key:23, text: 'e32', color:'green'},
//   // {key:31, text: 'ssd', color:'red'}, {key:32, text: 's32', color:'blue'},{key:33, text: 'e32', color:'green'},
//   // {key:41, text: 'ssd', color:'red'}, {key:42, text: 's32', color:'blue'},{key:43, text: 'e32', color:'green'},
//   // {key:51, text: 'ssd', color:'red'}, {key:52, text: 's32', color:'blue'},{key:53, text: 'e32', color:'green'}
// ],
//   [{from:1, to:2}, {from:1, to:3}, {from:2, to:3}, {from:3, to:3},{from:3, to:13},
//     {from:111, to:1},
//     {from:11, to:21}, {from:11, to:13}, {from:12, to:13}, {from:13, to:13},
//     // {from:21, to:21}, {from:21, to:23}, {from:22, to:23}, {from:23, to:23},
//     // {from:31, to:12}, {from:31, to:33}, {from:32, to:33}, {from:33, to:33},
//     // {from:41, to:21}, {from:41, to:43}, {from:42, to:43}, {from:43, to:43},
//     // {from:51, to:12}, {from:51, to:53}, {from:52, to:53}, {from:53, to:53}
//   ]);

//Nodes
// model = new go.GraphLinksModel([
// {key:1, text: 'initial', color:'blue'}, {key:2, text: '06', color:'gray'}, {key:100, isGroup:true, description:'first - for 06 group' }, {key:3, text: 'end', color:'gray'}, // frist phase - second step has a sub-transaction
// /*{key:11, text: 'second-one', color:'green'},*/ {key:12, text: 'second-two', color:'green', group:100}, {key:200, isGroup:true, description:'second - for second -two group', group:100}, // second phase - first step has a sub-transaction -- key 2 and 11 are same
// /*{key:31, text: 'last-one', color:'yellow'},*/ {key:32, text: 'last-two', color:'gray', group:200}  // third phase - does not have any sub-transaction  -- key 12 and 31 are same
// ],
// //Links to join transactions each other
// [{from:1, to:2}, {from:2, to:1}, {from:2, to:3},
// {from:2, to:12}, {from:12, to:2},
// {from:12, to:32},{from:32, to:12}]);


//read the input from scheme.json and create a modal out of that
getData(): Observable<any> {
  return this.http.get(this.filePath);
}

 formatModal(data: any){
  // main group
  this.mainGroup = data.main_group;
  // get the nodes
  this. nodes = data.nodes.map( (n) => {
    //return {key: n.name, text:n.text, group: n.group, color:(n.text === 'Start')? 'green': (n.text === 'Eind')? 'red' : 'gray'};
    if(n.text === 'Start')
      return {key: n.name, text:n.text, group: n.group, color: 'green',fig: "FramedRectangle"};
    if(n.text === 'Eind')
      return {key: n.name, text:n.text, group: n.group, color:'red', fig: "FramedRectangle"};
    return  {key: n.name, text:n.text, group: n.group, color:'lightgray', fig: "RoundedRectangle"};
   });
   // get the edges, links
   //this.edges = data.edges.map((e) => { return {from: e.from_node, to: e.to_node, text: e.text, line:e.line_style}})
   this.edges = data.edges.map((e) => { return {from: e.from_node, to: e.to_node, text: e.text, line:e.line_style}})

   // get the groups
   let groups= data.nodes.map( item=> item.group ).filter((value, index, self) => self.indexOf(value) === index).map(e=>{return {key:e, isGroup:true, description:e }}); //, category: "Lane"
   // add groups to nodes
   for(let i=0;i<groups.length;i++){
     // do not push main group to this node
      if(data.main_group !== groups[i].key)
      {
        this.nodes.push(groups[i]);
      }
      // else {
      //   groups[i]['category'] = 'Pool';
      //   this.nodes.push(groups[i]);
      // }
   }

  // ADD LABEL TEXT AS NODES.....
  this.addLabelNodes();

  // move index of last node to the end of the array
   let node1 = this.nodes.filter((p)=> p.key === "end_node");
   let index = this.nodes.indexOf(node1[0])
   this.nodes.splice(this.nodes.length, 0, this.nodes.splice(index,1)[0] );
   console.log(this.nodes);

   this.model = new go.GraphLinksModel(this.nodes, this.edges);
  //console.log(data);

  //  if(this.nodes)
 //console.log(this.nodes);
 }

 addLabelNodes(){
  // data.edges.map((e) => { return {from: e.from_node, to: e.to_node, text: e.text, line:e.line_style}})
  let newEdges: any[];
  for(let i=0; i< this.edges.length; i++ ) {
    let x = this.edges[i];
//console.log(x);
    if(x.text.length>0) // create a new node
    {
      let groupNode = this.nodes.filter(p=> p.key ===x.from);
      let groupName="";
      groupName = (groupNode && groupNode.length>0) ? groupNode[0].group: "";
      let id =x.from+"_LabelText_"+i;
      if(groupName.length>0)
        this.nodes.push({key: id, text:x.text, group: groupName, color: 'wheat',fig: "RoundedRectangle"} );
      else
        this.nodes.push({key: id, text:x.text, group: this.mainGroup, color: 'wheat',fig: "RoundedRectangle"} );

        // also add a new edge
        if(newEdges)
          newEdges.push({from: x.from, to: id, text: "", line:'Solid'})
        else
        newEdges = [{from: x.from, to: id, text: "", line:'Solid'}];
        // current edge will update and point to new node - to_node will update with the new node iD
        x.from = id;
        //x.from_node =x.to;
        x.text="";
    }
  }
    if(newEdges)
    {
      console.log(newEdges);
      for(let i=0;i<newEdges.length;i++){
        this.edges.push(newEdges[i]);
      }
    }
 }
}
