(function() {
  var $sel = {
      image: $("#image")
    },
    $globals = {
      ctx: null,
      xform: null,
      gkhead: new Image(),
      lastX: null,
      lastY: null,
      defaultX: null,
      defaultY: null,
      scaleFactor: 1.1,
      dragged: null,
      dragStart: null,
      canvas: null,
      mouseOnCanvas: false,
      zoomValue: 0,
      scale: 0,
      handleZoom: null
    },
    canvasObject = {
      redraw: function() {
        let p1 = $globals.ctx.transformedPoint(0, 0);
        let p2 = $globals.ctx.transformedPoint(canvas.width, canvas.height);
        $globals.ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
        $globals.ctx.save();
        $globals.ctx.setTransform(1, 0, 0, 1, 0, 0);
        $globals.ctx.clearRect(0, 0, canvas.width, canvas.height);
        $globals.ctx.fillStyle = "rgba(0,0,0,.2)";
        $globals.ctx.fillRect(0, 0, canvas.width, canvas.height);
        $globals.ctx.restore();
        $globals.ctx.drawImage(
          $globals.gkhead,
          0,
          0,
          canvas.width,
          canvas.height
        );
      },
      getImageType: function(imageBase64) {
        let startIndex = imageBase64.indexOf(":") + 1;
        let endIndex = imageBase64.indexOf(";base64");
        return imageBase64.substring(startIndex, endIndex);
      },
      slideZoom: function(clicks) {
        let factor = Math.abs((clicks + 10) / 10);
        let pt = $globals.mouseOnCanvas
          ? $globals.ctx.transformedPoint($globals.lastX, $globals.lastY)
          : $globals.ctx.transformedPoint($globals.defaultX, $globals.defaultY);
        $globals.ctx.setTransform(1, 0, 0, 1, 0, 0);
        $globals.ctx.translate(pt.x, pt.y);
        $globals.ctx.scale(factor, factor);
        $globals.ctx.translate(-pt.x, -pt.y);
        canvasObject.redraw();
      },
      zoom: function(clicks) {
        let pt = $globals.mouseOnCanvas
          ? $globals.ctx.transformedPoint($globals.lastX, $globals.lastY)
          : $globals.ctx.transformedPoint($globals.defaultX, $globals.defaultY);
        $globals.ctx.translate(pt.x, pt.y);
        let factor = Math.pow($globals.scaleFactor, clicks);
        let scale = $globals.ctx.getTransform().a;
        let scaleLowerLimit = 0.85,
          scaleUpperLimit = 6,
          decision = true;
        if (factor < 1) {
          //regulate zoom speed
          if (factor < 0.9) factor = 0.9;
          //zoom out
          if (scale < scaleLowerLimit) decision = false;
        } else if (factor > 1) {
          //regulate zoom speed
          if (factor > 1.1) factor = 1.1;
          //zoom in
          if (scale > scaleUpperLimit) decision = false;
        } else decision = false;
        if (decision === true) $globals.ctx.scale(factor, factor);
        if ($globals.mouseOnCanvas)
          rangeSliderObject.handleZoom(scale * factor - 1);
        $globals.ctx.translate(-pt.x, -pt.y);
        canvasObject.redraw();
      },
      handleResize: function() {
        $globals.ctx.setTransform(1, 0, 0, 1, 0, 0);
        canvas.width = window.innerWidth - window.innerWidth / 3;
        canvas.height = window.innerHeight - window.innerHeight / 6;
        $globals.lastX = canvas.width / 2;
        $globals.lastY = canvas.height / 2;
        $globals.defaultX = canvas.width / 2;
        $globals.defaultY = canvas.height / 2;
        canvasObject.zoom(0);
      },
      handleScroll: function(event) {
        event.preventDefault();
        let delta = event.wheelDelta
          ? event.wheelDelta / 40
          : event.detail
          ? -event.detail
          : 0;
        if (delta) canvasObject.zoom(delta);
        return false;
      },
      handleMouseDown: function(event) {
        document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect =
          "none";
        $globals.lastX = event.offsetX || event.pageX - canvas.offsetLeft;
        $globals.lastY = event.offsetY || event.pageY - canvas.offsetTop;
        $globals.dragStart = $globals.ctx.transformedPoint(
          $globals.lastX,
          $globals.lastY
        );
        $globals.dragged = false;
      },
      handleMouseUp: function(event) {
        $globals.dragStart = null;
        if (!$globals.dragged) canvasObject.zoom(event.shiftKey ? -1 : 1);
        canvas.setAttribute("style", "cursor: auto;");
      },
      handleMouseMove: function(event) {
        $globals.lastX = event.offsetX || event.pageX - canvas.offsetLeft;
        $globals.lastY = event.offsetY || event.pageY - canvas.offsetTop;
        $globals.dragged = true;
        if ($globals.dragStart != null) {
          canvas.setAttribute(
            "style",
            "cursor: move; cursor: grab; cursor:-moz-grab; cursor:-webkit-grab;"
          );
          var pt = $globals.ctx.transformedPoint(
            $globals.lastX,
            $globals.lastY
          );
          $globals.defaultX = canvas.width / 2;
          $globals.defaultY = canvas.height / 2;
          $globals.ctx.translate(
            pt.x - $globals.dragStart.x,
            pt.y - $globals.dragStart.y
          );
          canvasObject.redraw();
        }
      },
      handleMouseLeave: function() {
        $globals.mouseOnCanvas = false;
      },
      handleMouseEnter: function() {
        $globals.mouseOnCanvas = true;
      },
      updateZoomValue: function(val) {
        $globals.zoomValue = val;
      },
      trackTransforms: function(ctx) {
        const svg = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg"
        );
        let xform = svg.createSVGMatrix();
        ctx.getTransform = function() {
          return xform;
        };
        let savedTransforms = [];

        let save = ctx.save;
        ctx.save = function() {
          savedTransforms.push(xform.translate(0, 0));
          return save.call(ctx);
        };

        let restore = ctx.restore;
        ctx.restore = function() {
          xform = savedTransforms.pop();
          return restore.call(ctx);
        };

        let scale = ctx.scale;
        ctx.scale = function(sx, sy) {
          xform = xform.scaleNonUniform(sx, sy);
          return scale.call(ctx, sx, sy);
        };

        let rotate = ctx.rotate;
        ctx.rotate = function(radians) {
          xform = xform.rotate((radians * 180) / Math.PI);
          return rotate.call(ctx, radians);
        };

        let translate = ctx.translate;
        ctx.translate = function(dx, dy) {
          xform = xform.translate(dx, dy);
          return translate.call(ctx, dx, dy);
        };

        let transform = ctx.transform;
        ctx.transform = function(a, b, c, d, e, f) {
          let m2 = svg.createSVGMatrix();
          m2.a = a;
          m2.b = b;
          m2.c = c;
          m2.d = d;
          m2.e = e;
          m2.f = f;
          xform = xform.multiply(m2);
          return transform.call(ctx, a, b, c, d, e, f);
        };

        let setTransform = ctx.setTransform;
        ctx.setTransform = function(a, b, c, d, e, f) {
          xform.a = a;
          xform.b = b;
          xform.c = c;
          xform.d = d;
          xform.e = e;
          xform.f = f;
          return setTransform.call(ctx, a, b, c, d, e, f);
        };

        let pt = svg.createSVGPoint();

        ctx.transformedPoint = function(x, y) {
          pt.x = x;
          pt.y = y;
          return pt.matrixTransform(xform.inverse());
        };
      },
      init: function(handleZoom) {
        let canvas = document.getElementById("canvas");
        let img = $sel.image[0];
        canvas.width = window.innerWidth - window.innerWidth / 3;
        canvas.height = window.innerHeight - window.innerHeight / 6;
        $globals.lastX = canvas.width / 2;
        $globals.lastY = canvas.height / 2;
        $globals.defaultX = canvas.width / 2;
        $globals.defaultY = canvas.height / 2;
        $globals.ctx = canvas.getContext("2d");
        canvasObject.trackTransforms($globals.ctx);
        $globals.gkhead = img;
        $globals.ctx.fillStyle = "rgba(41,41,41,.5)";
        $globals.ctx.fillRect(0, 0, canvas.width, canvas.height);
        $globals.handleZoom = handleZoom;
        canvasObject.redraw();

        window.addEventListener("resize", canvasObject.handleResize, false);
        canvas.addEventListener(
          "mouseenter",
          canvasObject.handleMouseEnter,
          false
        );
        canvas.addEventListener(
          "mouseleave",
          canvasObject.handleMouseLeave,
          false
        );
        canvas.addEventListener(
          "DOMMouseScroll",
          canvasObject.handleScroll,
          false
        );
        canvas.addEventListener("mousewheel", canvasObject.handleScroll, false);
        canvas.addEventListener(
          "mousedown",
          canvasObject.handleMouseDown,
          false
        );
        canvas.addEventListener(
          "mousemove",
          canvasObject.handleMouseMove,
          false
        );
        canvas.addEventListener("mouseup", canvasObject.handleMouseUp, false);
      }
    };
  rangeSliderObject = {
    updateSlider: function() {
      let currentValue = $globals.zoomValue;
      if (currentValue > 100) currentValue = 100;
      if (currentValue < 0) currentValue = 0;
      var slider = document.querySelector(".range-slider input");
      var parent = slider.parentElement;
      parent.setAttribute("data-slider-value", Math.round(currentValue));
      var $thumb = parent.querySelector(".range-slider__thumb"),
        $bar = parent.querySelector(".range-slider__bar"),
        pct =
          currentValue *
          ((parent.clientHeight - $thumb.clientHeight) / parent.clientHeight);
      $thumb.style.bottom = pct + "%";
      $bar.style.height =
        "calc(" + pct + "% + " + $thumb.clientHeight / 2 + "px)";
      $thumb.textContent = Math.round(currentValue) + "%";
    },

    handleSlide: function() {
      var slider = document.querySelector(".range-slider input");
      let zoomVal = Number(slider.value);
      $globals.zoomValue = zoomVal;
      canvasObject.slideZoom(zoomVal);
      rangeSliderObject.updateSlider();
    },

    handleZoom: function(val) {
      $globals.zoomValue = val * 25;
      rangeSliderObject.updateSlider();
    },

    init: function() {
      var slider = document.querySelector(".range-slider input");
      slider.setAttribute("value", "0");
      rangeSliderObject.updateSlider(slider);
      // Cross-browser support where value changes instantly as you drag the handle, therefore two event types.
      slider.addEventListener("input", rangeSliderObject.handleSlide, false);
      slider.addEventListener("change", rangeSliderObject.handleSlide, false);
    }
  };
  site.registerOnLoadEvent(function() {
    canvasObject.init();
    rangeSliderObject.init();
  });
})();
