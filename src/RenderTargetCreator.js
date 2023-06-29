class RenderTargetCreator {
  constructor(THREE) {
    this.THREE = THREE;
  }

  create(width, height, params = {}) {

    const THREE = this.THREE;

    const isDepth = params.isDepth || false;
    const isSave = params.isSave || false;
    const minFilter = params.minFilter || THREE.NearestFilter;
    const magFilter = params.magFilter || THREE.NearestFilter;

    if (!isDepth) {
      const renderTarget = []
      const iters = isSave ? 2 : 1;

      for (let idx = 0; idx < iters; idx++) {
        renderTarget[idx] = new THREE.WebGLRenderTarget(
          width,
          height,
          {
            format: THREE.RGBAFormat,
            type: THREE.UnsignedByteType,
          });

        renderTarget[idx].texture.generateMipmaps = false;
        renderTarget[idx].texture.minFilter = minFilter;
        renderTarget[idx].texture.magFilter = magFilter;
      }

      renderTarget.width = width;
      renderTarget.height = height;
      renderTarget.isSave = isSave;

      return renderTarget;
    } else {
      const renderTarget = [new THREE.WebGLRenderTarget(
        width,
        height
      )];
      const target = renderTarget[0];

      target.depthTexture = new THREE.DepthTexture();
      target.depthTexture.generateMipmaps = false;
      target.depthTexture.format = THREE.DepthFormat;
      target.depthTexture.type = THREE.UnsignedShortType;
      target.depthTexture.minFilter = THREE.NearestFilter;
      target.depthTexture.magFilter = THREE.NearestFilter;

      renderTarget.width = width;
      renderTarget.height = height;
      renderTarget.isDepth = true;

      return renderTarget;
    }
  }

  getTargetNum(renderTarget, frameCount) {
    let renderNum = renderTarget.isSave ? frameCount % 2 === 0 ? 0 : 1 : 0;
    let textureNum = renderTarget.isSave ? Math.abs(renderNum - 1) : 0;
    return { renderNum, textureNum }
  }
}

export { RenderTargetCreator }