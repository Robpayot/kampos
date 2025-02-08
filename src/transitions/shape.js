// default Uniforms values
export const guiObj = {
    progress: 0,
    nbDivider: 50,
    shape: 'circle',
    shapeBorder: 0.15,
    effect: 'transition',
    direction: 'xy',
    transitionSpread: 1.1,
    speed: 3.2,
    easing: 'quart.out',
    bkgColor: '#121212',
    brightness: false,
    brightnessValue: 1,
    overlayColor: false,
};

// import fragmentShader from './shape.frag';
/**
 * @function shapeTransition
 * @returns {shapeTransitionEffect}
 * @example shapeTransition()
 */
export default function () {
    /**
     * @typedef {Object} shapeTransitionEffect
     * @property {ArrayBufferView|ImageData|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement|ImageBitmap} to media source to transition into
     * @property {number} progress number between 0.0 and 1.0
     * @property {boolean} disabled
     *
     * @example
     * effect.to = document.querySelector('#video-to');
     * effect.progress = 0.5;
     */

    return {
        vertex: {
            attribute: {
                a_transitionToTexCoord: 'vec2',
            },
            main: `
    v_transitionToTexCoord = a_transitionToTexCoord;`,
        },
        fragment: {
            uniform: {
                u_transitionEnabled: 'bool',
                u_transitionProgress: 'float',
                u_transitionTo: 'sampler2D',
                u_resolution: 'vec2',
                u_nbDivider: 'float',
            },
            constant: `
            const float circleBorder = 0.15;

            float circle(vec2 _uv, float _radius){
                vec2 l = _uv - vec2(0.5);
                float border = circleBorder;
                return 1. - smoothstep(_radius - (_radius * border),
                                    _radius + (_radius * border),
                                    dot(l, l) * 4.0);
            }
            `,
            main: `
            // Under the hood
            // vec4 pixel = texture2D(u_source, sourceCoord);
            // vec3 color = pixel.rgb;

            if (u_transitionEnabled) {

            // Grid of circles
            vec2 st = gl_FragCoord.xy / u_resolution;
            vec2 aspect = u_resolution / min(u_resolution.x, u_resolution.y); // Calculate aspect ratio
            st.x *= aspect.x / aspect.y; // Adjust x coordinate based on aspect ratio to have square
            st *= u_nbDivider; // TODO: nbShapes      // Scale up the space by 3
            st = fract(st); // Wrap around 1.0


            // Circle progress
            float circleProgress = v_texCoord.x + 1.; // 1 à 2
            float offset = 0.;
            // if (uDirection == 2.) {
            //     circleProgress = vUv.y + 1.;
            // } else if (uDirection == 3.) {
            //     circleProgress = (vUv.x + 1. + vUv.y + 1.) / 2.;
            // } else if (uDirection == 4.) {
            //     circleProgress = (vUv.x + 1. + (1. - vUv.y)) / 2.;
            //     offset = 1.;
            // }

            // Transition
            float transition = (circleProgress * 2. + offset) - u_transitionProgress * 6.;
            circleProgress = pow(abs(transition), 1.15);

            // if (uEffect == 1.) {
            //     if (uDirection == 5.) {
            //     transition = 2.15 - uProgress * 4.6;
            //     }
            //     circleProgress = pow(abs(transition), uTransitionSpread);
            // } else {
            //     transition = (circleProgress * 2. + offset) - uProgress * 4.;
            //     circleProgress = pow(transition, uTransitionSpread);

            //     if (uDirection == 5.) {
            //     // adding 0.15 extra to be sure shapes are covering the whole space (espacially for circle because of blurry border)
            //     circleProgress = 2.15 - uProgress * 2.3;
            //     }
            // }


            vec3 shapeColor = vec3(0.,0.,0.);
            shapeColor = vec3(circle(st, max(circleProgress, 0.)));

            vec4 textureTarget = texture2D(u_transitionTo, v_transitionToTexCoord);

            color = mix(textureTarget.rgb, color, smoothstep(0., 1., transition)) * shapeColor;
            alpha = shapeColor.r;
}`,
        },
        get disabled() {
            return !this.uniforms[0].data[0];
        },
        set disabled(b) {
            this.uniforms[0].data[0] = +!b;
        },
        get progress() {
            return this.uniforms[2].data[0];
        },
        set progress(p) {
            this.uniforms[2].data[0] = p;
        },
        get to() {
            return this.textures[0].data;
        },
        set to(media) {
            this.textures[0].data = media;
        },
        set resolution([width, height]) {
            this.uniforms[3].data[0] = width;
            this.uniforms[3].data[1] = height;
        },
        set nbDivider(value) {
            this.uniforms[4].data[0] = value;
        },
        varying: {
            v_transitionToTexCoord: 'vec2',
        },
        uniforms: [
            {
                name: 'u_transitionEnabled',
                type: 'i',
                data: [1],
            },
            {
                name: 'u_transitionTo',
                type: 'i',
                data: [1],
            },
            {
                name: 'u_transitionProgress',
                type: 'f',
                data: [0],
            },
            {
                name: 'u_resolution',
                type: 'f',
                data: [0, 0],
            },
            {
                name: 'u_nbDivider',
                type: 'f',
                data: [guiObj.nbDivider],
            },
        ],
        attributes: [
            {
                name: 'a_transitionToTexCoord',
                extends: 'a_texCoord',
            },
        ],
        textures: [
            {
                format: 'RGBA',
                update: true,
            },
        ],
    };
}
