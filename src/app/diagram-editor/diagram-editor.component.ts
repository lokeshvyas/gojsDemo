import { Component, OnInit, Input, Output, EventEmitter, ViewChild,ElementRef } from '@angular/core';
import {MatDialog} from '@angular/material'
import * as go from "gojs";

import{GuidedDraggingTool} from './guidedDraggingTool';
import {ModalComponent} from '../modal/modal.component'
import {PoolLayout} from '../poolLayout';
import { ReturnStatement } from '@angular/compiler';

//import { wrap } from 'module';


@Component({
  selector: 'app-diagram-editor',
  templateUrl: './diagram-editor.component.html',
  styleUrls: ['./diagram-editor.component.css']
})
export class DiagramEditorComponent implements OnInit {


  diagram: go.Diagram = new  go.Diagram();
  pallete: go.Palette = new  go.Palette();

  @ViewChild( 'diagramDiv', {static: true})
  private diagramRef:ElementRef;

  @ViewChild('paletteDiv', {static:true} )
  private paletteRef:ElementRef;

  @Input()
  get model(): go.Model {return this.diagram.model;}
  set model(val:go.Model) {this.diagram.model = val;}

  @Output()
  nodeSelected = new  EventEmitter<go.Node|null>();

  @Output()
  modelChanged = new  EventEmitter<go.ChangedEvent>();

  readonly ActivityMarkerStrokeWidth = 1.5;
  readonly ActivityNodeWidth = 120;
  readonly ActivityNodeHeight = 80;
  readonly ActivityNodeStrokeWidth = 1;
  readonly ActivityNodeStrokeWidthIsCall = 4;



  constructor(public dialog: MatDialog) {
    //this.initializeGraph();
  }

initializeGraph(){

  const $ = go.GraphObject.make;
  // define a swim lane
  const MINLENGTH = 350;
  const MINBREADTH = 25;

  const ActivityNodeFill = $(go.Brush, 'Linear', { 0: 'OldLace', 1: 'PapayaWhip' });
  const ActivityNodeStroke = '#CDAA7D';
  const SubprocessNodeFill = ActivityNodeFill;
  const SubprocessNodeStroke = ActivityNodeStroke;

// here we have to provide license key
//go.licenseKey="";
 this.diagram = $(go.Diagram, 'diagramDiv' , {
   initialContentAlignment: go.Spot.LeftSide,
  //  initialDocumentSpot: go.Spot.TopCenter,
  //  initialViewportSpot: go.Spot.TopCenter,
  //  initialAutoScale:go.Diagram.Uniform,
  // layout: $(go.TreeLayout, {arrangement:go.TreeLayout.ArrangementVertical,alignment:go.TreeLayout.AlignmentCenterSubtrees, angle:90, nodeSpacing:500, rowSpacing:500, layerSpacing:400}),
  // layout: $(go.TreeLayout, {arrangement:go.TreeLayout.ArrangementVertical,alignment:go.TreeLayout.AlignmentCenterSubtrees, angle:90,  nodeSpacing:200}),
  layout: $(go.LayeredDigraphLayout, {direction:0, columnSpacing:50, linkSpacing:160}) ,
   "undoManager.isEnabled": true
 });


let dragTool = new GuidedDraggingTool();
dragTool.isComplexRoutingRealtime = false;
this.diagram.toolManager.draggingTool = dragTool;
this.diagram.addDiagramListener('ChangedSelection',
e => {
const node = e.diagram.selection.first();
this.nodeSelected.emit(node instanceof go.Node ? node : null)
});
this.diagram.addModelChangedListener(e=> e.isTransactionFinished && this.modelChanged.emit(e));

//new Node
this.diagram.nodeTemplate = $(go.Node, go.Panel.Auto,
  {locationSpot:go.Spot.Center},
  $(go.Shape,
    new go.Binding('figure','key', (p)=>{return p.indexOf('_LabelText_')>-1?'RoundedRectangle':'Rectangle'}),
    //'RoundedRectangle',
    //{fill:'white', portId:'', fromLinkable:true, toLinkable:true, toSpot:go.Spot.LeftSide, fromSpot: go.Spot.RightSide, fromLinkableDuplicates:false, toLinkableDuplicates: false},
    {fill:'white', portId:'', fromLinkable:true, toLinkable:true, toSpot:go.Spot.AllSides, fromSpot: go.Spot.AllSides, fromLinkableDuplicates:false, toLinkableDuplicates: false},
    new go.Binding('fill', 'color')),
    $(go.TextBlock ,
      new go.Binding('editable','key', (p)=>{return p.indexOf('_LabelText_')>-1?true:false}),
      new go.Binding('width','key', (p)=>{return p.indexOf('_LabelText_')>-1?180:100}),
      {margin:4, wrap:go.TextBlock.WrapFit,  //width:100,
      },
      new go.Binding("text"))
  );

//New Link
this.diagram.linkTemplate =
$(go.Link,
  {
    //curve:go.Link.Bezier,
    //routing: go.Link.AvoidsNodes,
    routing: go.Link.AvoidsNodes ,
    //zOrder:2,
    corner: 10,
    //curviness:20,
    relinkableFrom: true,
    relinkableTo: true,
    reshapable: true,
    resegmentable: true,
    layerName:'Background',
    ////fromEndSegmentLength:500,
    ////toEndSegmentLength:500,
    fromSpot:go.Spot.AllSides,// go.Spot.RightSide
    toSpot:go.Spot.AllSides,//go.Spot.LeftSide,

    //segmentIndex:0,
    segmentFraction:0.5,
  },
  // new go.Binding('segmentIndex', 'line', (a)=> {return (a === 'Solid') ? 1: 2} ),
  // new go.Binding('segmentFraction', 'line', (a)=> {return (a === 'Solid') ? 0.5: 0.8} ),

  $(go.Shape,{stroke:'gray'},{ strokeDashArray:[2,5]},
   new go.Binding('strokeDashArray', 'line', (a)=> {return (a === 'Solid') ? null: [2,5]} )),
   //new go.Binding('stroke', 'line', (a)=> {return (a === 'Solid') ? 'gray': 'green'} )),
  $(go.Shape,
   //{ strokeDashArray:[20,10] } ,//{ toArrow: "Standard" },
  new go.Binding('toArrow','to', (p)=>{return p.indexOf('_LabelText_')>-1? "":"Standard"}),),
  $(go.Panel, "Auto",
    {width: 150, height: 100,},  // marks this Panel as being a draggable label // _isLinkLabel: true, maxSize: new go.Size(150, 100),
    //{position: new go.Point(100, 0),},
    $(go.Shape,'Rectangle', { fill: "wheat", stroke:null, }),
    $(go.TextBlock, { margin: 3, editable:true, stroke:"gray",
    // segmentIndex:0,    segmentFraction:0.8, fromSpot:go.Spot.RightSide, toSpot: go.Spot.LeftSide
    segmentIndex:0,    segmentFraction:0.8, fromSpot:go.Spot.AllSides, toSpot: go.Spot.AllSides
    },

      new go.Binding("text", "text")),
    // remember any modified segment properties in the link data object
    new go.Binding("segmentIndex").makeTwoWay(),
    new go.Binding("segmentFraction").makeTwoWay(),
    new go.Binding('visible', 'text', (a)=>{return (a)? true:false}),
  )
);

// New group
this.diagram.groupTemplate =
$(go.Group, 'Auto',//this.groupStyle(),
{
  isSubGraphExpanded:false,
  // layerName:'Background'
},
//{layout: $(go.TreeLayout, {angle:90, nodeSpacing:250, arrangement: go.TreeLayout.ArrangementVertical, isRealtime:false, layerSpacing:200})},
//{layout: $(go.TreeLayout, {angle:90, arrangement: go.TreeLayout.ArrangementVertical, isRealtime:false,nodeSpacing:50, layerSpacing:100 })},
{layout: $(go.LayeredDigraphLayout, {direction:90, columnSpacing:50, linkSpacing:100})},
  $(go.Shape, "Rectangle", { fill: "transparent", stroke: "gray" }),//rgba(239,239,239)
  $(go.Panel, "Table",
    { margin: 0.5 },  // avoid overlapping border with table contents
    $(go.RowColumnDefinition, { row: 0, background: "lightgray" }),  // header is white
    $("SubGraphExpanderButton", { row: 0, column: 0, margin: 3 }),
    $(go.TextBlock,  // title is centered in header
      { row: 0, column: 1,  stroke: "gray",
        textAlign: "center", stretch: go.GraphObject.Horizontal },
      new go.Binding("text", 'description')),
    $(go.Placeholder,  // becomes zero-sized when Group.isSubGraphExpanded is false
      { row: 1, columnSpan: 2, padding: 10, alignment: go.Spot.TopLeft },
      new go.Binding("padding", "isSubGraphExpanded",
                     function(exp) { return exp ? 10 : 0; } ).ofObject())
  )
);






this.pallete = new go.Palette();
this.pallete.nodeTemplate = this.diagram.nodeTemplate;

//initialize content of pallete
this.pallete.model.nodeDataArray =[{text: "alpha", color: "blue"},{text: "beta", color: "yellow"}, {text: "ghama", color: "orange"}, {text: "theta", color: "pink"}]

//make force layout
this.diagram.undoManager.isEnabled = true;
this.diagram.contextMenu= this.diagram.contextMenu =
$("ContextMenu",
$("ContextMenuButton",
$(go.TextBlock, "Undo"),
{ click: function(e, obj) { e.diagram.commandHandler.undo(); } },
new go.Binding("visible", "", function(o) {
    return o.diagram.commandHandler.canUndo();
  }).ofObject()),
$("ContextMenuButton",
$(go.TextBlock, "Redo"),
{ click: function(e, obj) { e.diagram.commandHandler.redo(); } },
new go.Binding("visible", "", function(o) {
    return o.diagram.commandHandler.canRedo();
  }).ofObject())
);


//const swimLanesGroupTemplateforPalette = $(go.Group, 'Vertical')
const swimLanesGroupTemplate = go.Group.make(go.Group, go.Panel.Spot, this.groupStyle(),
{
name: 'Lane',
minLocation: new go.Point(NaN, -Infinity),  // only allow vertical movement
maxLocation: new go.Point(NaN, Infinity),
selectionObjectName: 'SHAPE',// go.Shape.toString(), /*SHAPE*/
resizable:true,
layout: $(go.LayeredDigraphLayout, {
isInitial:false,
isOngoing:false,
direction:0, // horizontal from left to right
columnSpacing:10,
layeringOption: go.LayeredDigraphLayout.LayerLongestPathSource
}),
computesBoundsAfterDrag:true,
computesBoundsIncludingLinks:false,
computesBoundsIncludingLocation:true,
handlesDragDropForMembers:true,
mouseDrop: function(e: go.InputEvent, grp: go.GraphObject){
if(!e.diagram.selection.any(n=> (n instanceof go.Group && n.category !== 'subprocess') || n.category ===' privateProcess')){
    if(!(grp instanceof go.Group ) || grp.diagram == null) return;
    const ok = grp.addMembers(grp.diagram.selection, true);
    if(ok) {
      this.updateCrossLaneLinks(grp)
      this.relayoutDiagram();
    } else {
      grp.diagram.currentTool.doCancel();
    }
}
},
subGraphExpandedChanged: (grp: go.Group) => {
if( grp.diagram === null ) return;
if(grp.diagram.undoManager.isUndoingRedoing) return;
const shape= grp.resizeObject;
if(grp.isSubGraphExpanded) {
  shape.height = grp as any[ 'savedBreadth'];
} else {
  (grp as any )['savedBreadth'] = shape.height;
  shape.height =NaN;
}
this.updateCrossLaneLinks(grp);
}
},
$(go.Shape, 'Rectangle', {
name: 'SHAPE', fill: 'white', stroke: null
},
new go.Binding('fill', 'color'),
new go.Binding('desiredSize', 'size', go.Size.parse).makeTwoWay(go.Size.stringify)),
$(go.Shape, 'Rectangle',  // this is the resized object
{ name: 'SHAPE', fill: 'white', stroke: null },  // need stroke null here or you gray out some of pool border.
new go.Binding('fill', 'color'),
new go.Binding('desiredSize', 'size', go.Size.parse).makeTwoWay(go.Size.stringify)),

// the lane header consisting of a Shape and a TextBlock
$(go.Panel, 'Horizontal',
{
name: 'HEADER',
angle: 270,  // maybe rotate the header to read sideways going up
alignment: go.Spot.LeftCenter, alignmentFocus: go.Spot.LeftCenter
},
$(go.TextBlock,  // the lane label
{ editable: true, margin: new go.Margin(2, 0, 0, 8) },
new go.Binding('visible', 'isSubGraphExpanded').ofObject(),
new go.Binding('text', 'text').makeTwoWay()),
$('SubGraphExpanderButton', { margin: 4, angle: -270 })  // but this remains always visible!
),  // end Horizontal Panel
$(go.Placeholder,
{ padding: 12, alignment: go.Spot.TopLeft, alignmentFocus: go.Spot.TopLeft }),
$(go.Panel, 'Horizontal', { alignment: go.Spot.TopLeft, alignmentFocus: go.Spot.TopLeft },
$(go.TextBlock,  // this TextBlock is only seen when the swimlane is collapsed
{
  name: 'LABEL',
  editable: true, visible: false,
  angle: 0, margin: new go.Margin(6, 0, 0, 20)
},
new go.Binding('visible', 'isSubGraphExpanded', function (e) { return !e; }).ofObject(),
new go.Binding('text', 'text').makeTwoWay())
)

);
swimLanesGroupTemplate.resizeAdornmentTemplate = $(go.Adornment, go.Panel.Spot, $(go.Placeholder),
$(go.Shape, {
  alignment: go.Spot.Right,
  desiredSize: new go.Size(10,50),
  fill: 'lightgray', stroke: 'lightblue',cursor: 'col-resize'
}),
new go.Binding('visible','', (n) => {
  if(n.adornePart === null) {
    return false;
} else {
  return n.adornPart.isSubGraphExpanded;
}
}).ofObject()
); // meed placeholder and shape

const subProcessGroupTemplate =
$(go.Group, 'Spot',
{
  locationSpot: go.Spot.Center,
  locationObjectName: 'PH',
  // locationSpot: go.Spot.Center,
  isSubGraphExpanded: false,
  memberValidation: function (group: go.Group, part: go.Part) {
    return !(part instanceof go.Group) ||
           (part.category !== 'Pool' && part.category !== 'Lane');
  },
  mouseDrop: function (e: go.InputEvent, grp: go.GraphObject) {
    if (!(grp instanceof go.Group) || grp.diagram === null) return;
    const ok = grp.addMembers(grp.diagram.selection, true);
    if (!ok) grp.diagram.currentTool.doCancel();
  },
 //contextMenu: activityNodeMenu,
 // itemTemplate: boundaryEventItemTemplate
},
new go.Binding('itemArray', 'boundaryEventArray'),
new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
// move a selected part into the Foreground layer, so it isn't obscured by any non-selected parts
// new go.Binding("layerName", "isSelected", function (s) { return s ? "Foreground" : ""; }).ofObject(),
$(go.Panel, 'Auto',
  $(go.Shape, 'RoundedRectangle',
    {
      name: 'PH', fill: SubprocessNodeFill, stroke: SubprocessNodeStroke,
      minSize: new go.Size(this.ActivityNodeWidth, this.ActivityNodeHeight),
      portId: '', fromLinkable: true, toLinkable: true, cursor: 'pointer',
      fromSpot: go.Spot.RightSide, toSpot: go.Spot.LeftSide
    },
    new go.Binding('strokeWidth', 'isCall', function (s) { return s ? this.ActivityNodeStrokeWidthIsCall : this.ActivityNodeStrokeWidth; })
  ),
  $(go.Panel, 'Vertical',
    { defaultAlignment: go.Spot.Left },
    $(go.TextBlock,  // label
      { margin: 3, editable: true },
      new go.Binding('text', 'text').makeTwoWay(),
      new go.Binding('alignment', 'isSubGraphExpanded', function (s) { return s ? go.Spot.TopLeft : go.Spot.Center; })),
    // create a placeholder to represent the area where the contents of the group are
    $(go.Placeholder,
      { padding: new go.Margin(5, 5) }),
    this.makeMarkerPanel(true, 1)  // sub-process,  loop, parallel, sequential, ad doc and compensation markers
  )  // end Vertical Panel
)
);

const poolGroupTemplate =
$(go.Group, 'Auto', this.groupStyle(),
  {
    computesBoundsIncludingLinks: false,
    // use a simple layout that ignores links to stack the "lane" Groups on top of each other
    layout: $(PoolLayout, { spacing: new go.Size(0, 0) })  // no space between lanes
  },
  new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
  $(go.Shape,
    { fill: 'white' },
    new go.Binding('fill', 'color')),
  $(go.Panel, 'Table',
    { defaultColumnSeparatorStroke: 'black' },
    $(go.Panel, 'Horizontal',
      { column: 0, angle: 270 },
      $(go.TextBlock,
        { editable: true, margin: new go.Margin(5, 0, 5, 0) },  // margin matches private process (black box pool)
        new go.Binding('text').makeTwoWay())
    ),
    $(go.Placeholder,
      { background: 'darkgray', column: 1 })
  )
); // end poolGroupTemplate
// map the templates
const groupTemplateMap = new go.Map<string, go.Group>();
groupTemplateMap.add('subprocess', subProcessGroupTemplate);
groupTemplateMap.add('Lane', swimLanesGroupTemplate);
groupTemplateMap.add('Pool', poolGroupTemplate);

//this.diagram.groupTemplateMap =groupTemplateMap;
//this.diagram = $(go.Diagram, 'diagramDiv', {})

/* create an automatice layout*/


}

  ngOnInit() {

    this.initializeGraph();
    // if(this.diagramRef)
    //    this.diagram.div = this.diagramRef.nativeElement;
    if(this.paletteRef)
      this.pallete.div= this.paletteRef.nativeElement;



  }
  openDialog(data: any) {
    if(!data)
    return;

    const dialogRef = this.dialog.open(ModalComponent, {width: '240px', data: {key: data.key, text: data.text, color: data.color}});
    dialogRef.afterClosed().subscribe( result =>{
    if(result) {
      this.diagram.model.commit(
        function (m){
          m.set(data, "text", result.text);
          m.set(data, "color", result.color);
      }, 'modified node props');
    }
    });
  }
  // common settings
  groupStyle() {
    return [
      {
        layerName: 'Background',  // all pools and lanes are always behind all nodes and links
        background: 'transparent',  // can grab anywhere in bounds
        movable: true, // allows users to re-order by dragging
        copyable: false,  // can't copy lanes or pools
        avoidable: true,  // don't impede AvoidsNodes routed Links
        minLocation: new go.Point( NaN, -Infinity),  // only allow vertical movement
        maxLocation: new go.Point(NaN, Infinity)
      },
      new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify)
    ];
  }
  updateCrossLaneLinks(grp: go.Group){
    grp.findExternalLinksConnected().each(n=> {n.visible = n.fromNode !== null && n.fromNode.isVisible() && n.toNode.isVisible()})
  }

  // this is called after nodes have been moved or lanes resized, to layout all of the Pool Groups again
  relayoutDiagram(){
    this.diagram.layout.invalidateLayout();
    this.diagram.findTopLevelGroups().each(n=> {if(n.category === 'Pool' && n.layout !== null) {
      n.layout.invalidateLayout();
    }})
  }

// sub-process,  loop, parallel, sequential, ad doc and compensation markers in horizontal array
  makeMarkerPanel(sub: boolean, scale: number) {
      const $ = go.GraphObject.make;
    return $(go.Panel, 'Horizontal',
      { alignment: go.Spot.MiddleBottom, alignmentFocus: go.Spot.MiddleBottom },
      // $(go.Shape, 'BpmnActivityLoop',
      //   { width: 12 / scale, height: 12 / scale, margin: 2, visible: false, strokeWidth: this.ActivityMarkerStrokeWidth },
      //   new go.Binding('visible', 'isLoop')),
      // $(go.Shape, 'BpmnActivityParallel',
      //   { width: 12 / scale, height: 12 / scale, margin: 2, visible: false, strokeWidth: this.ActivityMarkerStrokeWidth },
      //   new go.Binding('visible', 'isParallel')),
      // $(go.Shape, 'BpmnActivitySequential',
      //   { width: 12 / scale, height: 12 / scale, margin: 2, visible: false, strokeWidth: this.ActivityMarkerStrokeWidth },
      //   new go.Binding('visible', 'isSequential')),
      // $(go.Shape, 'BpmnActivityAdHoc',
      //   { width: 12 / scale, height: 12 / scale, margin: 2, visible: false, strokeWidth: this.ActivityMarkerStrokeWidth },
      //   new go.Binding('visible', 'isAdHoc')),
      // $(go.Shape, 'BpmnActivityCompensation',
      //   { width: 12 / scale, height: 12 / scale, margin: 2, visible: false, strokeWidth: this.ActivityMarkerStrokeWidth, fill: null },
      //   new go.Binding('visible', 'isCompensation')),
      this.makeSubButton(sub)
    ); // end activity markers horizontal panel
  }
  // sub-process,  loop, parallel, sequential, ad doc and compensation markers in horizontal array
    makeSubButton(sub: boolean) {
      const $ = go.GraphObject.make;
    if (sub) {
      return [$('SubGraphExpanderButton'),
      { margin: 2, visible: false },
      new go.Binding('visible', 'isSubProcess')];
    }
    return [];
  }
}
