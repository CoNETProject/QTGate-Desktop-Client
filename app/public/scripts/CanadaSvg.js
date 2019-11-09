/* Day */
var dayGroup = document.getElementById("DayGroup");
/* Canoe */
var canoe = document.getElementsByClassName("canoe");
var canoeReflection = document.getElementsByClassName("canoeReflection");
/* Island */
var treesPink = document.getElementsByClassName("treesPink");
var treesOrange = document.getElementsByClassName("treesOrange");
var CoralTriangle1 = document.getElementsByClassName("CoralTriangle1");
var CoralTriangle2 = document.getElementsByClassName("CoralTriangle2");
var CoralTriangle3 = document.getElementsByClassName("CoralTriangle3");
/*Sea */
var waveRight = document.getElementsByClassName("waveRight");
var waveLeft = document.getElementsByClassName("waveLeft");
/* Sky */
var blueCloudLeft = document.getElementsByClassName("blueCloudLeft");
var blueCloudRight = document.getElementsByClassName("blueCloudRight");
var pinkCloud = document.getElementsByClassName("pinkCloud");
var sunRayLeft = document.getElementsByClassName("sunRayLeft");
var sunRayRight = document.getElementsByClassName("sunRayRight");
/*Rflection*/
var treesPinkR = document.getElementsByClassName("treesPinkR");
var treesOrangeR = document.getElementsByClassName("treesOrangeR");
var RCoralTriangle1 = document.getElementsByClassName("RCoralTriangle1");
var RCoralTriangle2 = document.getElementsByClassName("RCoralTriangle2");
var RCoralTriangle3 = document.getElementsByClassName("RCoralTriangle3");
/* --------------------------- */
/* Animation */
//canoe
var tlCanoe = new TimelineMax({
repeat:-1,
yoyo:true,
ease: "easeInOut"
});
tlCanoe.fromTo(canoe, 1.5, {
y:0
}, {
y:4
})
tlCanoe.fromTo(canoeReflection, 1.5, {
y:0
}, {
y:-4
}, "-=1.5")
//Sea
var tlwaveLeft = new TimelineMax({
repeat:-1,
yoyo:true,
ease: "easeInOut"
});
tlwaveLeft.fromTo(waveLeft, 5, {
x:0
}, {
x:35
})
tlwaveLeft.fromTo(waveRight, 5, {
x:0
}, {
x:-35
}, "-=5")
//tree
var tlswingingTree = new TimelineMax({
repeat:-1,
yoyo:true,
ease: "easeInOut"
});
tlswingingTree.staggerFromTo(treesPink, 2, {
transformOrigin:"50% 0%",
rotation:"5deg",
}, {
rotation:"-5deg",
}, .2);
var ReflectswingingTree = new TimelineMax({
repeat:-1,
yoyo:true,
});
ReflectswingingTree.staggerFromTo(treesPinkR, 2, {
transformOrigin:"50% 0%",
rotation:"-5deg",
}, {
rotation:"5deg",
}, .2);
var tlOrangeTrees = new TimelineMax({
repeat:-1,
yoyo:true,
ease: "easeInOut"
});
tlOrangeTrees.fromTo(treesOrange, 2, {
transformOrigin:"50% 100%",
rotation:"1deg",
}, {
rotation:"-1deg",
}, .2);
var ReflectOrangeTrees = new TimelineMax({
repeat:-1,
yoyo:true});
ReflectOrangeTrees.fromTo(treesOrangeR, 2, {
transformOrigin:"50% 0%",
rotation:"-1deg",
}, {
rotation:"1deg",
}, .2);
var tlCoralTrees = new TimelineMax({repeat:-1});
tlCoralTrees.set([CoralTriangle1, CoralTriangle3], {
transformOrigin: "50% 20%",
rotation: "0deg",
repeatDelay:2
})
tlCoralTrees.to([CoralTriangle1, CoralTriangle3], 1, {
rotation: "6deg",
ease: "easeInOut"
})
tlCoralTrees.to([CoralTriangle1, CoralTriangle3], 1, {
rotation: "-6deg",
ease: "easeInOut"
})
tlCoralTrees.to([CoralTriangle1, CoralTriangle3], .5, {
rotation: "3deg",
ease: "easeInOut"
})
tlCoralTrees.to([CoralTriangle1, CoralTriangle3], .5, {
rotation: "-3deg",
ease: "easeInOut"
})
tlCoralTrees.to([CoralTriangle1, CoralTriangle3], .4, {
rotation: "2.5deg",
ease: "easeInOut"
})
tlCoralTrees.to([CoralTriangle1, CoralTriangle3], .4, {
rotation: "-2.5deg",
ease: "easeInOut"
})
tlCoralTrees.to([CoralTriangle1, CoralTriangle3], .4, {
rotation: "0deg",
ease: "easeInOut"
})
var tlCoralTree2 = new TimelineMax({repeat:-1});
tlCoralTree2.set(CoralTriangle2, {
transformOrigin: "50% 20%",
rotation: "0deg",
delay:.5,
repeatDelay:2.2
})
tlCoralTree2.to(CoralTriangle2, .85, {
rotation: "6deg",
ease: "easeInOut"
})
tlCoralTree2.to(CoralTriangle2, .85, {
rotation: "-6deg",
ease: "easeInOut"
})
tlCoralTree2.to(CoralTriangle2, .5, {
rotation: "3deg",
ease: "easeInOut"
})
tlCoralTree2.to(CoralTriangle2, .5, {
rotation: "-3deg",
ease: "easeInOut"
})
tlCoralTree2.to(CoralTriangle2, .4, {
rotation: "2.5deg",
ease: "easeInOut"
})
tlCoralTree2.to(CoralTriangle2, .4, {
rotation: "-2.5deg",
ease: "easeInOut"
})
tlCoralTree2.to(CoralTriangle2, .4, {
rotation: "0deg",
ease: "easeInOut"
})
//Coral Tirangles Reflection
var ReflectCoralTrees = new TimelineMax({repeat:-1});
ReflectCoralTrees.set([RCoralTriangle1, RCoralTriangle3], {
transformOrigin: "50% 80%",
rotation: "0deg",
repeatDelay:2
})
ReflectCoralTrees.to([RCoralTriangle1, RCoralTriangle3], 1, {
rotation: "-6deg",
ease: "easeInOut"
})
ReflectCoralTrees.to([RCoralTriangle1, RCoralTriangle3], 1, {
rotation: "6deg",
ease: "easeInOut"
})
ReflectCoralTrees.to([RCoralTriangle1, RCoralTriangle3], .5, {
rotation: "-3deg",
ease: "easeInOut"
})
ReflectCoralTrees.to([RCoralTriangle1, RCoralTriangle3], .5, {
rotation: "3deg",
ease: "easeInOut"
})
ReflectCoralTrees.to([RCoralTriangle1, RCoralTriangle3], .4, {
rotation: "-2.5deg",
ease: "easeInOut"
})
ReflectCoralTrees.to([RCoralTriangle1, RCoralTriangle3], .4, {
rotation: "2.5deg",
ease: "easeInOut"
})
ReflectCoralTrees.to([RCoralTriangle1, RCoralTriangle3], .4, {
rotation: "0deg",
ease: "easeInOut"
})
var ReflectCoralTree2 = new TimelineMax({repeat:-1});
ReflectCoralTree2.set(CoralTriangle2, {
transformOrigin: "50% 80%",
rotation: "0deg",
delay:.5,
repeatDelay:2.2
})
ReflectCoralTree2.to(RCoralTriangle2, .85, {
rotation: "-6deg",
ease: "easeInOut"
})
ReflectCoralTree2.to(RCoralTriangle2, .85, {
rotation: "6deg",
ease: "easeInOut"
})
ReflectCoralTree2.to(RCoralTriangle2, .5, {
rotation: "-3deg",
ease: "easeInOut"
})
ReflectCoralTree2.to(RCoralTriangle2, .5, {
rotation: "3deg",
ease: "easeInOut"
})
ReflectCoralTree2.to(RCoralTriangle2, .4, {
rotation: "-2.5deg",
ease: "easeInOut"
})
ReflectCoralTree2.to(RCoralTriangle2, .4, {
rotation: "2.5deg",
ease: "easeInOut"
})
ReflectCoralTree2.to(RCoralTriangle2, .4, {
rotation: "0deg",
ease: "easeInOut"
})
//sky
var tlblueCloud = new TimelineMax({
repeat:-1,
yoyo:true,
});
tlblueCloud.fromTo(blueCloudLeft, 5.5, {
x:0
}, {
x:55,
ease: "linear"
})
tlblueCloud.fromTo(blueCloudRight, 5.5, {
x:0
}, {
x:-55,
ease: "linear"
}, "-=5")
var tlpinkCloud = new TimelineMax({
repeat:-1,
yoyo:true,
ease: "easeInOut"
});
tlpinkCloud.staggerFromTo(pinkCloud, 20, {
x:0
}, {
x:300
}, 1.5)
var tlsunRays = new TimelineMax({
repeat:-1,
yoyo:true,
});
tlsunRays.fromTo(sunRayLeft, 4.5, {
x:0
}, {
x:25,
ease:"linear"
})
tlsunRays.fromTo(sunRayRight, 4.5, {
x:0
}, {
x:-25,
ease:"linear"
}, "-=5");