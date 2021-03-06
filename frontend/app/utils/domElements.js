import Ember from 'ember';

/*global d3 */

/*----------------------------------------------------------------------------*/

/** Make the given DOM element width resizable;  it is expected to contain an element
 * .resizer, which is what the user drags.
 * The .resizer is styled to position to the right or left edge :
 * e.g. <div class="resizer" style="float:right; width:10px; height:10px">X</div>
 * or instead of float:right could use position: absolute; right: -5px;
 * and with a suitable horizontal resize icon e.g. glyphicon-resize-horizontal 
 * or http://fontawesome.io/3.2.1/icon/resize-horizontal/
 *
 * This is equivalent to jquery-ui .resizable(), which is not working with the
 * current set of framework and tools versions
 *  ("TypeError: this._handles.disableSelection is not a function").
 *
 * Usage eg.     eltWidthResizable('#holder');
 *
 * @param eltSelector DOM element to make resizable
 * @param filter  undefined or event filter - refn github.com/d3/d3-drag#drag_filter
 * @param resized undefined or callback when resized
 * @return the d3 drag object, so that the caller can register for drag events.
 * The caller could use eltWidthResizable(...).on('drag') instead of passing resized,
 * but this function wraps the calculation of x and dx which is useful.
 */
function eltWidthResizable(eltSelector, filter, resized)
{
  /** refn : meetamit https://stackoverflow.com/a/25792309  */
  let resizable = d3.select(eltSelector);

  let resizer = resizable.select('.resizer'),

  /** assumes single '.resizer', or they all have some flex-grow. */
  resizable_flex_grow = resizable.node().style['flex-grow'];

  if ((resizable.node() === null) || (resizer.node() === null))
    console.log("eltWidthResizable() resizer=", resizer, eltSelector, resizable.node(), resizer.node());

  let startX;
  let dragResize = d3.drag()  // d3 v3: was .behavior
    .on('drag', function(d, i, g) {
      logElementDimensions(g[0], 'on drag');

      // as for .resize() below,
      // .on() seems to apply a reasonable debounce, but if not, use Ember.run.debounce()
      // Determine resizer position relative to resizable (parent)
      let x = d3.mouse(this.parentNode)[0];
      let dx = d3.event.dx;
      // console.log("eltWidthResizable drag x=", x, dx);
      // Avoid negative or really small widths
      x = Math.max(50, x);

      resizable.style('width', x + 'px');

      /* If the parent (resizable) has "flex-grow: 1", disable that so that it can be adjusted.
       */
      resizable.style('flex-grow', 'inherit');

      if (resized)
        // 'this' is resizer elt.
        // Only the first 2 args are used so far - the others can be dropped.
        resized(x, dx, eltSelector, resizable, resizer, this);
    });
  // if (filter)
    dragResize.filter(shiftKeyfilter/*filter*/);

  /* If the window size is changed (in particular reduced then increased),
   * restore the previous value, so that the flex-grow can
   * automatically absorb the increased width.
   */
  let w =
    Ember.$( window );
  console.log(w);
  w.resize(function() {
    /*  .resize() may apply some debounce also - refn https://api.jquery.com/resize/.
     * Seems that the version used is frontend/bower_components/jquery/dist/jquery.js
     * (noting also bower_components/jquery-ui/ui/widgets/resizable.js).
     */
    Ember.run.debounce(resizeEnd, 300);
  });
  function resizeEnd() { 
    console.log("eltWidthResizable window resize", eltSelector, resizable_flex_grow);
    logWindowDimensions(window, 'drag');
    resizable.style('flex-grow', resizable_flex_grow);
  };


  if (resizer)
    resizer.call(dragResize);
  else
    console.log("eltWidthResizable() resizer=", resizer, eltSelector, dragResize);
    return dragResize;
}

function logWindowDimensions(w, text)
{
  let s = w.screen, v = w.visualViewport;
  console.log
  (
    text, 'inner', w.innerWidth, "x", w.innerHeight, 
    'avail', s.availWidth, 'x',  s.availHeight,
    'screen', s.width, 'x', s.height, 'visualViewport', v.width, 'x', v.height
  );
}

function logElementDimensions(e, text)
{
  console.log
  (
    text,
    'client', e.clientWidth, 'x', e.clientHeight, e.clientLeft, ',', e.clientTop,
    'offset', e.offsetWidth, 'x', e.offsetHeight, e.offsetLeft, ',', e.offsetTop, e.offsetParent,
    'scroll', e.scrollWidth, 'x', e.scrollHeight, e.scrollLeft, ',', e.scrollTop
  );
}

/*----------------------------------------------------------------------------*/

/** Event filter for eltWidthResizable() ... d3 drag.filter()
 *  refn github.com/d3/d3-drag#drag_filter
 */
function shiftKeyfilter() {
  let ev = d3.event.sourceEvent || d3.event; 
  return ev.shiftKey;
}

function noShiftKeyfilter() {
  let ev = d3.event.sourceEvent || d3.event; 
  return ! ev.shiftKey;
}

/*----------------------------------------------------------------------------*/

export { eltWidthResizable, shiftKeyfilter, noShiftKeyfilter };
