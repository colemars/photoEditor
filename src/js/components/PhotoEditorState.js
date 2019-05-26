import React from 'react';

export default class PhotoEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ctx: null,
            gkhead: new Image(),
            lastX: null,
            lastY: null,
            scaleFactor: 1.1,
            dragged: null,
            dragStart: null,
            canvas: null
        };
        this.myRef = React.createRef();
    }
    handleResize() {
        this.state.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.setState({
            canvas: {
              ...this.state.canvas,
              width: window.innerWidth - window.innerWidth / 5,
              height: window.innerHeight - window.innerHeight / 5
            }
        });
        this.setState({lastX: this.state.canvas.width / 2});
        this.setState({lastY: this.state.canvas.height / 2});
        this.zoom();
    }
    redraw() {
        var p1 = this.state.ctx.transformedPoint(0, 0);
        var p2 = this.state.ctx.transformedPoint(this.state.canvas.width, this.state.canvas.height);
        this.state.ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
        this.state.ctx.save();
        this.state.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.state.ctx.clearRect(0, 0, this.state.canvas.width, this.state.canvas.height);
        this.setState({
            ctx: {
              ...this.state.ctx,
              fillStyle: "rgba(0,0,0,.2)"
            }
        })
        this.state.ctx.fillRect(0, 0, this.state.canvas.width, this.state.canvas.height);
        this.state.ctx.restore();
        this.state.ctx.drawImage(this.state.gkhead, this.state.canvas.width / 2 - this.state.gkhead.width / 2,
            this.state.canvas.height / 2 - this.state.gkhead.height / 2);
    }
    getImageType(imageBase64) {
        var startIndex = imageBase64.indexOf(":") + 1;
        var endIndex = imageBase64.indexOf(";base64");
        return imageBase64.substring(startIndex, endIndex);
    }
    zoom(clicks) {
        var pt = this.state.ctx.transformedPoint(this.state.lastX, this.state.lastY);
        this.state.ctx.translate(pt.x, pt.y);
        var factor = Math.pow(this.state.scaleFactor, clicks);
        var scale = this.state.ctx.getTransform().a;
        let scaleLowerLimit = 1,
            scaleUpperLimit = 5,
            decision = true
        if (factor < 1) {
            //zoom out
            if (scale < scaleLowerLimit) {
                decision = false
            }
        } else if (factor > 1) {
            //zoom in
            if (scale > scaleUpperLimit) {
                decision = false
            }
        } else decision = false;
        if (decision === true) {
            this.state.ctx.scale(factor, factor);
        }
        this.state.ctx.translate(-pt.x, -pt.y);
        this.redraw();
    }
    handleScroll(event) {
        var delta = event.wheelDelta ? event.wheelDelta / 40 : event.detail ? -event.detail : 0;
        if (delta) this.zoom(delta);
        return false;
    }
    handleMouseDown(event) {
        document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
        this.setState({lastX: event.offsetX || (event.pageX - this.state.canvas.offsetLeft)});
        this.setState({lastY: event.offsetY || (event.pageY - this.state.canvas.offsetTop)});
        this.setState({dragStart: this.state.ctx.transformedPoint(this.state.lastX, this.state.lastY)});
        this.setState({dragged: false});
    }
    handleMouseUp(event) {
        this.state.dragStart = null;
        console.log(this.state.dragged);
        if (!this.state.dragged) {
            console.log('zoom')
            this.zoom(event.shiftKey ? -1 : 1)
        }
        this.state.canvas.setAttribute("style", "cursor: auto;");
    }
    handleMouseMove(event) {
        this.state.lastX = event.offsetX || (event.pageX - this.state.canvas.offsetLeft);
        this.state.lastY = event.offsetY || (event.pageY - this.state.canvas.offsetTop);
        this.state.dragged = true;
        if (this.state.dragStart != null) {
            this.state.canvas.setAttribute("style", "cursor: move; cursor: grab; cursor:-moz-grab; cursor:-webkit-grab;");
            var pt = this.state.ctx.transformedPoint(this.state.lastX, this.state.lastY);
            this.state.ctx.translate(pt.x - this.state.dragStart.x, pt.y - this.state.dragStart.y);
            this.redraw();
        }
    }
    trackTransforms(ctx) {
        var svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        var xform = svg.createSVGMatrix();
        ctx.getTransform = function () { return xform; };
        var savedTransforms = [];
        var save = ctx.save;
        ctx.save = function () {
            savedTransforms.push(xform.translate(0, 0));
            return save.call(ctx);
        };
        var restore = ctx.restore;
        ctx.restore = function () {
            xform = savedTransforms.pop();
            return restore.call(ctx);
        };

        var scale = ctx.scale;
        ctx.scale = function (sx, sy) {
            xform = xform.scaleNonUniform(sx, sy);
            return scale.call(ctx, sx, sy);
        };

        var rotate = ctx.rotate;
        ctx.rotate = function (radians) {
            xform = xform.rotate(radians * 180 / Math.PI);
            return rotate.call(ctx, radians);
        };

        var translate = ctx.translate;
        ctx.translate = function (dx, dy) {
            xform = xform.translate(dx, dy);
            return translate.call(ctx, dx, dy);
        };

        var transform = ctx.transform;
        ctx.transform = function (a, b, c, d, e, f) {
            var m2 = svg.createSVGMatrix();
            m2.a = a; m2.b = b; m2.c = c; m2.d = d; m2.e = e; m2.f = f;
            xform = xform.multiply(m2);
            return transform.call(ctx, a, b, c, d, e, f);
        };

        var setTransform = ctx.setTransform;
        ctx.setTransform = function (a, b, c, d, e, f) {
            xform.a = a;
            xform.b = b;
            xform.c = c;
            xform.d = d;
            xform.e = e;
            xform.f = f;
            return setTransform.call(ctx, a, b, c, d, e, f);
        };

        var pt = svg.createSVGPoint();

        ctx.transformedPoint = function (x, y) {
            pt.x = x; pt.y = y;
            return pt.matrixTransform(xform.inverse());
        }

    }
    init() {
        this.setState({canvas: document.getElementById("this.state.canvas")})
        this.state.lastX = this.state.canvas.width / 2;
        this.state.lastY = this.state.canvas.height / 2;
        this.state.ctx = this.state.canvas.getContext("2d");
        this.trackTransforms(this.state.ctx);
        this.state.gkhead.src = 'http://phrogz.net/tmp/gkhead.jpg';
        this.state.canvas.width = window.innerWidth - window.innerWidth / 5;
        this.state.canvas.height = window.innerHeight - window.innerHeight / 5;
        this.state.ctx.fillStyle = "rgba(41,41,41,.5)";
        this.state.ctx.fillRect(0, 0, this.state.canvas.width, this.state.canvas.height);
        this.redraw();
        window.addEventListener('resize', this.handleResize, false);
        this.state.canvas.addEventListener('DOMMouseScroll', this.handleScroll, false);
        this.state.canvas.addEventListener('mousewheel', this.handleScroll, false);
        this.state.canvas.addEventListener('mousedown', this.handleMouseDown, false);
        this.state.canvas.addEventListener('mousemove', this.handleMouseMove, false);
        this.state.canvas.addEventListener('mouseup', this.handleMouseUp, false);
    }

    componentDidMount() {
        console.log('mount')
    }

    shouldComponentUpdate(){
        return false;
    }

    render() {
        return (
            <div ref={this.myRef} />
        );
    }
}
