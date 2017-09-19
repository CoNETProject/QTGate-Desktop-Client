(function (factory) {
    if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
        factory(require("knockout"), exports);
    } else if (typeof define === "function" && define["amd"]) {
        define(["knockout", "exports"], factory);
    } else {
        factory(ko, ko.mapping = {});
    }
}(function (ko, exports) {
    var animations = [ "bounce", "flash", "pulse", "rubberBand", "shake", "swing", "tada", "wobble", "bounceIn", "bounceInDown", 
        "bounceInLeft", "bounceInRight", "bounceInUp", "bounceOut", "bounceOutDown", "bounceOutLeft", "bounceOutRight", 
        "bounceOutUp", "fadeIn", "fadeInDown", "fadeInDownBig", "fadeInLeft", "fadeInLeftBig", "fadeInRight", "fadeInRightBig", 
        "fadeInUp", "fadeInUpBig", "fadeOut", "fadeOutDown", "fadeOutDownBig", "fadeOutLeft", "fadeOutLeftBig", "fadeOutRight", 
        "fadeOutRightBig", "fadeOutUp", "fadeOutUpBig", "flip", "flipInX", "flipInY", "flipOutX", "flipOutY", "lightSpeedIn", 
        "lightSpeedOut", "rotateIn", "rotateInDownLeft", "rotateInDownRight", "rotateInUpLeft", "rotateInUpRight", "rotateOut",
         "rotateOutDownLeft", "rotateOutDownRight", "rotateOutUpLeft", "rotateOutUpRight", "hinge", "rollIn", "rollOut", "zoomIn", 
         "slideInDown", "slideInLeft","slideInRight","slideInUp", "slideOutDown","slideOutLeft","slideOutRight","slideOutUp",
         "zoomInDown", "zoomInLeft", "zoomInRight", "zoomInUp", "zoomOut", "zoomOutDown", "zoomOutLeft", "zoomOutRight", "zoomOutUp"],
        baseAnimateClass = "animated",
        pfx = ["webkit", "moz", "MS", "o", ""];

    function addPrefixedEvent(element, type, callback) {
        for (var p = 0; p < pfx.length; p++) {
            if (!pfx[p]) type = type.toLowerCase();
            element.addEventListener(pfx[p]+type, callback, false);
        }
    }

    function removePrefixedEvent(element, type, fun) {
        for (var p = 0; p < pfx.length; p++) {
            if (!pfx[p]) type = type.toLowerCase();
            element.removeEventListener(pfx[p]+type, fun);
        }
    }

    function hasClass(ele,cls) {
        return ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
    }

    function addClass(ele,cls) {
        if (!hasClass(ele,cls)){
            ele.className = ele.className ? ele.className + " " + cls : cls;
        }
    }

    function removeClass(ele,cls) {
        if (hasClass(ele,cls)) {
            var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
            ele.className = ele.className.replace(reg,' ').trim();
        }
    }

    function doAnimationWork(element, animation, callback, state){
        addClass(element, baseAnimateClass);
        addClass(element, animation);
        const EventFun = ( event ) => {
            removePrefixedEvent(element, "AnimationEnd", EventFun );

            removeClass(element, baseAnimateClass);
            removeClass(element, animation);

            if (typeof callback === 'function'){
                callback(event, state);
            }
        }
        addPrefixedEvent(element, "AnimationEnd", EventFun );
    }

    ko.bindingHandlers.animate = {
        init: function(element, valueAccessor){
            var data = ko.unwrap(valueAccessor()),
                animation, state, toggle, animationOn, animationOff, handler;

            if (!data.animation){
                throw new Error('Animation property must be defined');
            }

            if (!data.state){
                throw new Error('State property must be defined');
            }

            animation = ko.unwrap(data.animation);
            animationOn = typeof animation === 'object' ? animation[0] : animation;
            animationOff = typeof animation === 'object' ? animation[1] : animation;

            if (animationOn && animations.indexOf(animationOn) === -1){
                throw new Error('Invalid first animation');
            }

            if (animationOff && animations.indexOf(animationOff) === -1){
                throw new Error('Invalid second animation');
            }
        },
        update: function(element, valueAccessor){
            var data = ko.unwrap(valueAccessor()),
                animation, state, toggle, animationOn, animationOff, handler;

            if (!data.animation){
                throw new Error('Animation property must be defined');
            }

            if (!data.state){
                throw new Error('State property must be defined');
            }

            animation = ko.unwrap(data.animation);
            state = !!ko.unwrap(data.state);
            animationOn = typeof animation === 'object' ? animation[0] : animation;
            animationOff = typeof animation === 'object' ? animation[1] : animation;
            toggle = animationOn !== animationOff;
            handler = ko.unwrap(data.handler) || undefined;

            if (state){
                doAnimationWork(element, animationOn, handler, state);
            } else if (toggle){
                doAnimationWork(element, animationOff, handler, state);
            }
        }
    };
}));
