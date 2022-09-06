import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

let context;

export default function withDragDropContext(Component) {
  // ensure a singleton instance of the context exists
  if (!context) {
    context = DragDropContext(HTML5Backend);
  }

  return context(Component);
}
