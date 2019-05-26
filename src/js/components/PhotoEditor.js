export default class PhotoEditor {
    constructor() {
        this.ctx = null
        this.xform = null
        this.gkhead = new Image()
        this.lastX = null
        this.lastY = null
        this.scaleFactor = 1.1
        this.dragged = null
        this.dragStart = null
        this.canvas = null
        this.that = null

        this.handleResize = this.handleResize.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
    }
    redraw(){
        var p1 = this.ctx.transformedPoint(0, 0);
        var p2 = this.ctx.transformedPoint(this.canvas.width, this.canvas.height);
        this.ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "rgba(0,0,0,.2)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
        this.ctx.drawImage(this.gkhead, this.canvas.width / 2 - this.gkhead.width / 2,
            this.canvas.height / 2 - this.gkhead.height / 2);
    }
    getImageType(imageBase64) {
        var startIndex = imageBase64.indexOf(":") + 1;
        var endIndex = imageBase64.indexOf(";base64");
        return imageBase64.substring(startIndex, endIndex);
    }
    zoom(clicks) {
        var pt = this.ctx.transformedPoint(this.lastX, this.lastY);
        this.ctx.translate(pt.x, pt.y);
        var factor = Math.pow(this.scaleFactor, clicks);
        var scale = this.ctx.getTransform().a;
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
            this.ctx.scale(factor, factor);
        }
        this.ctx.translate(-pt.x, -pt.y);
        this.redraw();
    }
    handleResize(){
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.canvas.width = window.innerWidth - window.innerWidth / 5;
        this.canvas.height = window.innerHeight - window.innerHeight / 5;
        this.lastX = this.canvas.width / 2;
        this.lastY = this.canvas.height / 2;
        this.zoom(0);
    }
    handleScroll(event) {
        event.preventDefault();
        var delta = event.wheelDelta ? event.wheelDelta / 40 : event.detail ? -event.detail : 0;
        if (delta) this.zoom(delta);
        return false;
    }
    handleMouseDown(event) {
        this.lastX = event.offsetX || (event.pageX - this.canvas.offsetLeft);
        this.lastY = event.offsetY || (event.pageY - this.canvas.offsetTop);
        this.dragStart = this.ctx.transformedPoint(this.lastX, this.lastY);
        this.dragged = false;
    }
    handleMouseUp(event) {
        this.dragStart = null;
        if (!this.dragged) {
            this.zoom(event.shiftKey ? -1 : 1)
        }
    }
    handleMouseMove(event) {
        this.lastX = event.offsetX || (event.pageX - this.canvas.offsetLeft);
        this.lastY = event.offsetY || (event.pageY - this.canvas.offsetTop);
        this.dragged = true;
        if (this.dragStart != null) {
            var pt = this.ctx.transformedPoint(this.lastX, this.lastY);
            this.ctx.translate(pt.x - this.dragStart.x, pt.y - this.dragStart.y);
            this.redraw();
        }
    }
    trackTransforms(ctx) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg",'svg');
        let xform = svg.createSVGMatrix();
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
        this.canvas = document.getElementById("canvas");
        this.canvas.width = window.innerWidth-window.innerWidth/5;
        this.canvas.height = window.innerHeight - window.innerHeight / 5;
        this.lastX = this.canvas.width / 2;
        this.lastY = this.canvas.height / 2;
        this.ctx = this.canvas.getContext("2d");
        this.trackTransforms(this.ctx);
        this.gkhead.src = 'http://phrogz.net/tmp/gkhead.jpg';
        this.ctx.fillStyle = "rgba(41,41,41,.5)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.redraw();
        window.addEventListener('resize', this.handleResize, false);
        this.canvas.addEventListener('DOMMouseScroll', this.handleScroll, false);
        this.canvas.addEventListener('mousewheel', this.handleScroll, false);
        this.canvas.addEventListener('mousedown', this.handleMouseDown, false);
        this.canvas.addEventListener('mousemove', this.handleMouseMove, false);
        this.canvas.addEventListener('mouseup', this.handleMouseUp, false);
    }
}