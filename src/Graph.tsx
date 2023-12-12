import React, { Component } from 'react';
import { Table } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import { DataManipulator } from './DataManipulator';
import './Graph.css';

interface IProps {
  data: ServerRespond[],
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
}
class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = {
//       stock: 'string',
      price_abc: 'float',
      price_def: 'float',
      ratio: 'float', // in order to find ratio from stock_abc & stock_def
//       top_ask_price: 'float',
//       top_bid_price: 'float',
      timestamp: 'date', // We will reqy=uire timeStamp bcz ww will be tracking these stocks w.r.t. time
      upper_bound: 'float', // Upper bound and Lower bound is used to find out the maximum and minimum boundaries of the ratios of stocks
      lower_bound: 'float',
      trigger_alert: 'float', // this trigger_alert is used when both stocks are crosses one another
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);
      elem.setAttribute('view', 'y_line');
//       elem.setAttribute('column-pivots', '["stock"]');
      elem.setAttribute('row-pivots', '["timestamp"]');
      elem.setAttribute('columns', '["ratio", "lower_bound", "upper_bound", "trigger_alert"]');
      elem.setAttribute('aggregates', JSON.stringify({ // Aggregates is helping us in dealing with duplicate data
//         stock: 'distinct count',
//         top_ask_price: 'avg',
//         top_bid_price: 'avg',
           price_abc: 'avg',
           price_def: 'avg',
           ratio: 'avg',
           timestamp: 'distinct count',
           upper_bound: 'avg', // Upper bound and Lower bound is used to find out the maximum and minimum boundaries of the ratios of stocks
           lower_bound: 'avg',
           trigger_alert: 'avg',

      }));
    }
  }

  componentDidUpdate() {
    if (this.table) {
      this.table.update([
      DataManipulator.generateRow(this.props.data),
        ] as unknown as TableData);
    }
  }
}

export default Graph;
