import * as go from 'gojs';

// define a custom grid layout that makes sure the length of each lane is the same
// and that each lane is broad enough to hold its subgraph
export class PoolLayout extends go.GridLayout {

  // swimlanes
  readonly MINLENGTH = 400;  // this controls the minimum length of any swimlane
  readonly MINBREADTH = 20;  // this controls the minimum breadth of any non-collapsed swimlane
  public cellSize = new go.Size(1, 1);
  public wrappingColumn = 1;
  public wrappingWidth = Infinity;
  public isRealtime = false;  // don't continuously layout while dragging
  public alignment = go.GridLayout.Position;
  // This sorts based on the location of each Group.
  // This is useful when Groups can be moved up and down in order to change their order.
  public comparer = function (a: go.Part, b: go.Part) {
    const ay = a.location.y;
    const by = b.location.y;
    if (isNaN(ay) || isNaN(by)) return 0;
    if (ay < by) return -1;
    if (ay > by) return 1;
    return 0;
  };
  public doLayout(coll: go.Diagram | go.Group | go.Iterable<go.Part>) {
    const diagram = this.diagram;
    if (diagram === null) return;
    diagram.startTransaction('PoolLayout');
    const pool = this.group;
    if (pool !== null && pool.category === 'Pool') {
      // make sure all of the Group Shapes are big enough
      const minsize = this.computeMinPoolSize(pool);
      pool.memberParts.each(function (lane) {
        if (!(lane instanceof go.Group)) return;
        if (lane.category !== 'Pool') {
          const shape = lane.resizeObject;
          if (shape !== null) {  // change the desiredSize to be big enough in both directions
            const sz = this.computeLaneSize(lane);
            shape.width = (isNaN(shape.width) ? minsize.width : Math.max(shape.width, minsize.width));
            shape.height = (!isNaN(shape.height)) ? Math.max(shape.height, sz.height) : sz.height;
            const cell = lane.resizeCellSize;
            if (!isNaN(shape.width) && !isNaN(cell.width) && cell.width > 0) shape.width = Math.ceil(shape.width / cell.width) * cell.width;
            if (!isNaN(shape.height) && !isNaN(cell.height) && cell.height > 0) shape.height = Math.ceil(shape.height / cell.height) * cell.height;
          }
        }
      });
    }
    // now do all of the usual stuff, according to whatever properties have been set on this GridLayout
    super.doLayout.call(this, coll);
    diagram.commitTransaction('PoolLayout');
  }

  computeLaneSize(lane: go.Group) {
    // assert(lane instanceof go.Group && lane.category !== "Pool");
    const sz = this.computeMinLaneSize(lane);
    if (lane.isSubGraphExpanded) {
      const holder = lane.placeholder;
      if (holder !== null) {
        const hsz = holder.actualBounds;
        sz.height = Math.max(sz.height, hsz.height);
      }
    }

}
computeMinLaneSize(lane: go.Group) {
  if (!lane.isSubGraphExpanded) return new go.Size(this.MINLENGTH, 1);
  return new go.Size(this.MINLENGTH, this.MINBREADTH);
}
computeMinPoolSize(pool: go.Group) {
  // assert(pool instanceof go.Group && pool.category === "Pool");
  let len = this.MINLENGTH;
  pool.memberParts.each(function (lane) {
    // pools ought to only contain lanes, not plain Nodes
    if (!(lane instanceof go.Group)) return;
    const holder = lane.placeholder;
    if (holder !== null) {
      const sz = holder.actualBounds;
      len = Math.max(len, sz.width);
    }
  });
  return new go.Size(len, NaN);
}
}
// end PoolLayout class
