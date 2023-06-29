import { GUI } from '../libs/lil-gui.min.js';


class DevGUI {
  constructor() {
    const gui = new GUI();

    const params = {
      mainParam: {
        drawColor: { r: 0.4, g: 0.5, b: 0.2 },
        clearColor: { r: 0.5, g: 0.5, b: 0.5 },
        radius: 0.25,
      },
      /*carpetV: {
        randSize: 1.2,
        randSizeY: 1.0,
        sizeNoise: 2.0,
      },*/
      carpetV: {
        randSize: 0.5,
        randSizeY: 1.3,
        sizeNoise: 1.0,
      },
      carpetF: {
        showNormal: false,
        p1: true,
        p2: true,
        p3: true,
        p4: true,
        p5: true,
        p6: true,
        p7: true,
        p8: true,
        p9: true,
      },
      light: {
        color: 0xffbb71,
        intensity: 6.0,
        axis: { x: 0.336, y: 4.1 }
      },
      timeline: {
        isActive: false,
        speed: 1.0,
        timeout: 1,
        isShowAll: true
      }
    }

    gui.title('CARPET v0.2');

    const mainFolder = gui.addFolder('Main');
    const vertexFolder = gui.addFolder('Vertex');
    const fragmentFolder = gui.addFolder('Fragment');
    const timelineFolder = gui.addFolder('TimeLine');
    const lightFolder = gui.addFolder('Light');

    fragmentFolder.close();
    timelineFolder.close();


    // MAIN
    const mainParam = params.mainParam;
    mainFolder.addColor(mainParam, 'drawColor');
    mainFolder.addColor(mainParam, 'clearColor');
    mainFolder.add(mainParam, 'radius', 0.05, 0.5).name('radius');


    // VERTEX
    const carpetV = params.carpetV;
    vertexFolder.add(carpetV, 'randSize', 0, 5).name('randSize');
    vertexFolder.add(carpetV, 'randSizeY', 0, 5).name('randSizeY');
    vertexFolder.add(carpetV, 'sizeNoise', 0.5, 5).name('sizeNoise');


    // FRAGMENT
    const carpetF = params.carpetF;
    Object.keys(carpetF).forEach((key) => {
      fragmentFolder.add(carpetF, key).name(key);
    })

    // TIME LINE
    const timeline = params.timeline;
    timelineFolder.add(timeline, 'speed', 0, 3, 1).name('speed');
    timelineFolder.add(timeline, 'timeout', 0, 10, 1).name('timeout');

    timelineFolder.onOpenClose((t) => {
      timeline.isActive = !(t._closed);
      console.log(timeline.isActive);
    });



    // LIGHT
    const light = params.light;
    lightFolder.addColor(light, 'color');
    lightFolder.add(light, 'intensity', 0, 20).name('intensity');
    lightFolder.add(light.axis, 'x', 0, 1, 0.001).name('x');
    lightFolder.add(light.axis, 'y', 0, 10).name('y');






    // DEFAULT
    const defaultState = {
      carpetV: { ...params.carpetV },
      carpetF: { ...params.carpetF },
      light: { ...params.light },
    }

    const obj = {
      resetVertex: () => {
        params.carpetV = { ...defaultState.carpetV };
        vertexFolder.reset(true);
      },
      resetFragment: () => {
        params.carpetF = { ...defaultState.carpetF };
        fragmentFolder.reset(true);
      },
      resetLight: () => {
        params.light = { ...defaultState.light };
        lightFolder.reset(true);
      },
    }
    gui.add(obj, 'resetVertex').name('reset Vertex');
    gui.add(obj, 'resetFragment').name('reset Fragment');
    gui.add(obj, 'resetLight').name('reset Light');






    return {
      mainParam: params.mainParam,
      carpetV: params.carpetV,
      carpetF: params.carpetF,
      timeline: params.timeline,
      light: params.light,
    }
  }
}

export { DevGUI }